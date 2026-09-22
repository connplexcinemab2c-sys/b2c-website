import Transaction from "../models/Transaction.js";
import WhatsAppCampaignRecipient from "../models/WhatsAppCampaignRecipient.js";
import WhatsAppCampaign from "../models/WhatsAppCampaign.js";
import WhatsAppOrder, { WhatsAppOrderItem } from "../models/WhatsAppOrder.js";
import { normalizePhoneNumber } from "../utils/phoneNormalizer.js";

/**
 * WhatsApp Conversion Tracking & Attribution Service
 * Attaches UTM source/campaign, normalizes phone, builds order items,
 * and matches orders back to WhatsApp campaign recipients.
 */
export const processOrderAttribution = async (initTransId, utmData = {}) => {
  try {
    if (!initTransId) {
      console.warn("[WhatsAppTracking] No initTransId provided for attribution");
      return null;
    }

    const bookingDetails = await Transaction.findOne({ initTransId })
      .populate({
        path: "cinemaId",
        select: "cinemaName address",
      })
      .populate({
        path: "movieId",
        select: "name languages censorRating category",
      })
      .populate({
        path: "showId",
        select: "sessionRealShow screenName",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email mobileNumber",
      })
      .lean();

    if (!bookingDetails) {
      console.warn(`[WhatsAppTracking] Transaction not found for initTransId: ${initTransId}`);
      return null;
    }

    // 1. Resolve and normalize phone number
    const rawPhone =
      utmData?.phone ||
      bookingDetails.userId?.mobileNumber ||
      bookingDetails.paymentResponse?.contact ||
      null;

    const normalizedPhone = normalizePhoneNumber(rawPhone);

    // 2. Resolve UTM parameters
    let utm_source = (utmData?.utm_source || bookingDetails.utm_source || "direct").toLowerCase().trim();
    if (utm_source === "whatsapp" || utm_source === "wa" || utm_source === "wp" || utm_source.startsWith("wp_")) {
      utm_source = "whatsapp";
    }
    if (bookingDetails.utm_source === "whatsapp" || bookingDetails.utm_source === "wp") {
      utm_source = "whatsapp";
    }
    const utm_campaign = (utmData?.utm_campaign || bookingDetails.utm_campaign || null)?.toLowerCase()?.trim() || null;

    // 3. Resolve Order ID
    const order_id =
      bookingDetails.addSeatData?.strBookId ||
      bookingDetails.commitBookingData?.strBookId ||
      initTransId;

    // 4. Resolve Products / Items
    const items = [];

    // 4a. Ticket product item
    const movieName = bookingDetails.movieId?.name || "Movie Tickets";
    const screenName = bookingDetails.showId?.screenName ? ` (${bookingDetails.showId.screenName})` : "";
    let seatCount = 1;
    if (bookingDetails.setSeatData?.strSeatInfo) {
      const seatParts = bookingDetails.setSeatData.strSeatInfo.split(" - ");
      if (seatParts[1]) {
        seatCount = seatParts[1].split(",").map((s) => s.trim()).filter(Boolean).length || 1;
      }
    } else if (bookingDetails.addSeatData?.curTicketsTotal) {
      seatCount = 1;
    }

    const ticketPrice =
      parseFloat(
        bookingDetails.finalBookingCalculation?.ticketCart?.ticketTotal ||
        bookingDetails.addSeatData?.curTicketsTotal ||
        0
      ) || 0;

    items.push({
      order_id,
      product_id: String(bookingDetails.movieId?._id || "movie_ticket"),
      product_name: `${movieName}${screenName} x ${seatCount}`,
      category: "Ticket",
      quantity: seatCount,
      price: ticketPrice,
    });

    // 4b. Food & Beverage items
    if (Array.isArray(bookingDetails.fAndBDetails) && bookingDetails.fAndBDetails.length > 0) {
      for (const fnb of bookingDetails.fAndBDetails) {
        const qty = Number(fnb.quantity) || 1;
        const price = Number(fnb.price || fnb.itemPriceByQuantity || 0);
        items.push({
          order_id,
          product_id: String(fnb.itemId || fnb.itemMasterItemCode || "fnb_item"),
          product_name: fnb.name || "Snack Item",
          category: "Snack",
          quantity: qty,
          price: price,
        });
      }
    }

    // 5. Calculate total order value
    const total =
      parseFloat(
        bookingDetails.finalBookingCalculation?.finalAmount ||
        bookingDetails.paymentResponse?.amount ||
        items.reduce((acc, curr) => acc + (curr.price || 0), 0)
      ) || 0;

    // 6. Recipient matching — check if phone received this campaign
    let is_conversion = false;
    let matchedRecipient = null;

    if (normalizedPhone) {
      const recipientQuery = { phone: normalizedPhone };
      if (utm_campaign) {
        recipientQuery.campaign_id = utm_campaign;
      }

      matchedRecipient = await WhatsAppCampaignRecipient.findOne(recipientQuery);

      if (matchedRecipient) {
        is_conversion = true;
        await WhatsAppCampaignRecipient.updateOne(
          { _id: matchedRecipient._id },
          {
            $set: {
              has_converted: true,
              converted_at: new Date(),
              order_id: order_id,
            },
          }
        );
        console.log(
          `[WhatsAppTracking] Match confirmed: Phone ${normalizedPhone} converted on campaign ${matchedRecipient.campaign_id} for order ${order_id}`
        );
      }
    }

    if (utm_source === "wp" || utm_source === "whatsapp") {
      is_conversion = true;
    }

    // 7. Upsert into WhatsAppOrder
    const orderDoc = await WhatsAppOrder.findOneAndUpdate(
      { order_id },
      {
        $set: {
          order_id,
          initTransId,
          phone: normalizedPhone || "unknown",
          utm_source,
          utm_campaign: utm_campaign || matchedRecipient?.campaign_id || null,
          total,
          date: new Date(),
          is_conversion,
          conversion_matched_at: is_conversion ? new Date() : null,
          items,
          transactionRef: bookingDetails._id,
        },
      },
      { upsert: true, new: true }
    );

    // 8. Bulk insert/replace into WhatsAppOrderItem for granular queries
    await WhatsAppOrderItem.deleteMany({ order_id });
    if (items.length > 0) {
      await WhatsAppOrderItem.insertMany(items);
    }

    // 9. Update Transaction document
    await Transaction.updateOne(
      { initTransId },
      {
        $set: {
          utm_source,
          utm_campaign: utm_campaign || matchedRecipient?.campaign_id || null,
          normalized_phone: normalizedPhone,
          is_whatsapp_conversion: is_conversion,
        },
      }
    );

    return {
      order: orderDoc,
      is_conversion,
      normalizedPhone,
      items,
      total,
      matchedRecipient,
    };
  } catch (error) {
    console.error("[WhatsAppTracking] Error processing order attribution:", error);
    return null;
  }
};

export default {
  processOrderAttribution,
};
