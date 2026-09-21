import { StatusCodes } from "http-status-codes";
import WhatsAppCampaign from "../../models/WhatsAppCampaign.js";
import WhatsAppCampaignRecipient from "../../models/WhatsAppCampaignRecipient.js";
import WhatsAppOrder, { WhatsAppOrderItem } from "../../models/WhatsAppOrder.js";
import { normalizePhoneNumber } from "../../utils/phoneNormalizer.js";

/**
 * Create or update a WhatsApp campaign
 * POST /api/whatsapp/campaigns
 */
export const createCampaign = async (req, res) => {
  try {
    const { campaign_id, campaign_name, description, status, metadata } = req.body;

    if (!campaign_id || !campaign_name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "campaign_id and campaign_name are required.",
      });
    }

    const cleanedId = String(campaign_id).trim().toLowerCase();

    const campaign = await WhatsAppCampaign.findOneAndUpdate(
      { campaign_id: cleanedId },
      {
        $set: {
          campaign_id: cleanedId,
          campaign_name: String(campaign_name).trim(),
          description: description || "",
          status: status || "active",
          ...(metadata ? { metadata } : {}),
        },
      },
      { upsert: true, new: true }
    );

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Campaign saved successfully.",
      data: campaign,
    });
  } catch (error) {
    console.error("[WhatsAppTracking] Error creating campaign:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to create campaign.",
    });
  }
};

/**
 * List all campaigns with recipient & conversion metrics
 * GET /api/whatsapp/campaigns
 */
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await WhatsAppCampaign.find().sort({ createdAt: -1 }).lean();

    // Enrich with recipient & conversion counts
    const enriched = await Promise.all(
      campaigns.map(async (camp) => {
        const totalRecipients = await WhatsAppCampaignRecipient.countDocuments({
          campaign_id: camp.campaign_id,
        });
        const totalConversions = await WhatsAppCampaignRecipient.countDocuments({
          campaign_id: camp.campaign_id,
          has_converted: true,
        });
        const conversionRevenueAgg = await WhatsAppOrder.aggregate([
          { $match: { utm_campaign: camp.campaign_id, is_conversion: true } },
          { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
        ]);
        const totalRevenue = conversionRevenueAgg[0]?.totalRevenue || 0;

        return {
          ...camp,
          metrics: {
            totalRecipients,
            totalConversions,
            conversionRate:
              totalRecipients > 0
                ? Number(((totalConversions / totalRecipients) * 100).toFixed(2))
                : 0,
            totalRevenue,
          },
        };
      })
    );

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: enriched,
    });
  } catch (error) {
    console.error("[WhatsAppTracking] Error listing campaigns:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to list campaigns.",
    });
  }
};

/**
 * Bulk import or sync recipients for a WhatsApp campaign
 * POST /api/whatsapp/campaigns/recipients
 */
export const addRecipients = async (req, res) => {
  try {
    const { campaign_id, recipients } = req.body;

    if (!campaign_id || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "campaign_id and an array of recipients are required.",
      });
    }

    const cleanedCampaignId = String(campaign_id).trim().toLowerCase();

    // Ensure campaign exists or auto-create placeholder
    await WhatsAppCampaign.findOneAndUpdate(
      { campaign_id: cleanedCampaignId },
      {
        $setOnInsert: {
          campaign_id: cleanedCampaignId,
          campaign_name: cleanedCampaignId,
          status: "active",
        },
      },
      { upsert: true }
    );

    const bulkOps = [];
    let validCount = 0;

    for (const raw of recipients) {
      const phoneInput = typeof raw === "object" ? raw.phone : raw;
      const normalizedPhone = normalizePhoneNumber(phoneInput);
      const sentAt = (typeof raw === "object" && raw.sent_at) ? new Date(raw.sent_at) : new Date();

      if (normalizedPhone) {
        validCount++;
        bulkOps.push({
          updateOne: {
            filter: { campaign_id: cleanedCampaignId, phone: normalizedPhone },
            update: {
              $setOnInsert: {
                campaign_id: cleanedCampaignId,
                phone: normalizedPhone,
                sent_at: sentAt,
                has_converted: false,
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await WhatsAppCampaignRecipient.bulkWrite(bulkOps, { ordered: false });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: `Successfully processed ${validCount} recipients for campaign ${cleanedCampaignId}.`,
      data: {
        campaign_id: cleanedCampaignId,
        totalSubmitted: recipients.length,
        totalValid: validCount,
      },
    });
  } catch (error) {
    console.error("[WhatsAppTracking] Error adding campaign recipients:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to add campaign recipients.",
    });
  }
};

/**
 * Get conversion reports (orders matched to WhatsApp campaigns)
 * GET /api/whatsapp/conversions
 */
export const getConversions = async (req, res) => {
  try {
    const { campaign_id, phone, is_conversion, utm_source, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (campaign_id) {
      filter.utm_campaign = String(campaign_id).trim().toLowerCase();
    }
    if (phone) {
      filter.phone = normalizePhoneNumber(phone);
    }
    if (utm_source) {
      if (utm_source !== "all" && utm_source !== "*") {
        filter.utm_source = String(utm_source).trim().toLowerCase();
      }
    }
    if (is_conversion !== undefined) {
      filter.is_conversion = is_conversion === "true" || is_conversion === true;
    } else if (!utm_source) {
      // Default to returning only genuine WhatsApp conversions / WhatsApp-sourced bookings
      filter.$or = [{ utm_source: "whatsapp" }, { is_conversion: true }];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, totalCount, summaryAgg] = await Promise.all([
      WhatsAppOrder.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      WhatsAppOrder.countDocuments(filter),
      WhatsAppOrder.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            conversionsCount: {
              $sum: { $cond: ["$is_conversion", 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg[0] || { totalRevenue: 0, conversionsCount: 0 };

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: {
        orders,
        pagination: {
          totalCount,
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)) || 1,
        },
        summary: {
          totalOrders: totalCount,
          totalRevenue: summary.totalRevenue,
          conversionsCount: summary.conversionsCount,
        },
      },
    });
  } catch (error) {
    console.error("[WhatsAppTracking] Error querying conversions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to retrieve conversions.",
    });
  }
};

/**
 * Check if a phone number received a campaign and if it converted
 * GET /api/whatsapp/check-conversion/:phone
 */
export const checkConversion = async (req, res) => {
  try {
    const rawPhone = req.params.phone;
    const normalized = normalizePhoneNumber(rawPhone);

    if (!normalized) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid phone number.",
      });
    }

    const [recipientRecords, orderRecords] = await Promise.all([
      WhatsAppCampaignRecipient.find({ phone: normalized }).lean(),
      WhatsAppOrder.find({ phone: normalized }).sort({ date: -1 }).lean(),
    ]);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: {
        normalizedPhone: normalized,
        campaignsReceived: recipientRecords,
        ordersPlaced: orderRecords,
        hasConverted: recipientRecords.some((r) => r.has_converted) || orderRecords.some((o) => o.is_conversion),
      },
    });
  } catch (error) {
    console.error("[WhatsAppTracking] Error checking phone conversion:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Failed to check conversion.",
    });
  }
};
