import WhatsAppBooking from "../../models/WhatsAppBooking.js";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";

/**
 * Webhook handler to receive and store booking notifications from WhatsApp automation.
 * Accepts flexible payload properties mapping standard fields, and stores the raw payload.
 */
export const receiveBooking = async (req, res) => {
  try {
    console.log("Received WhatsApp booking webhook payload:", JSON.stringify(req.body));

    const {
      mobileNumber,
      phone,
      senderPhone,
      customerName,
      name,
      cinemaName,
      cinema,
      movieName,
      movie,
      showTime,
      showtime,
      seats,
      seatList,
      amountPaid,
      amount,
      price,
      bookingId,
      transactionId,
      bookingRef
    } = req.body;

    // Resolve phone/mobile number (required)
    const resolvedPhone = mobileNumber || phone || senderPhone;
    if (!resolvedPhone) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Missing required mobile number/phone in payload.",
      });
    }

    // Resolve values supporting various common webhook naming conventions
    const resolvedName = customerName || name || null;
    const resolvedCinema = cinemaName || cinema || null;
    const resolvedMovie = movieName || movie || null;
    const resolvedShowTime = showTime || showtime || null;
    
    // Handle seats parsing (could be string or array)
    let resolvedSeats = [];
    const rawSeats = seats || seatList;
    if (rawSeats) {
      if (Array.isArray(rawSeats)) {
        resolvedSeats = rawSeats.map(String);
      } else if (typeof rawSeats === "string") {
        resolvedSeats = rawSeats.split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    // Handle amount parsing
    const rawAmount = amountPaid || amount || price || 0;
    const resolvedAmount = parseFloat(rawAmount) || 0;

    // Resolve booking/transaction ID
    const resolvedBookingId = bookingId || transactionId || bookingRef || null;

    // Save to the WhatsAppBooking collection
    const newWhatsAppBooking = new WhatsAppBooking({
      mobileNumber: String(resolvedPhone).trim(),
      customerName: resolvedName,
      cinemaName: resolvedCinema,
      movieName: resolvedMovie,
      showTime: resolvedShowTime ? String(resolvedShowTime).trim() : null,
      seats: resolvedSeats,
      amountPaid: resolvedAmount,
      bookingId: resolvedBookingId,
      rawPayload: req.body,
    });

    await newWhatsAppBooking.save();

    console.log(`Successfully saved WhatsApp booking for phone ${resolvedPhone}`);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "WhatsApp booking data stored successfully.",
      data: {
        id: newWhatsAppBooking._id,
        bookingId: newWhatsAppBooking.bookingId
      }
    });
  } catch (error) {
    console.error("Error receiving WhatsApp booking webhook:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};
