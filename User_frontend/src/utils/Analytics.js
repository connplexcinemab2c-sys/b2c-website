import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export const initGA = () => {
  if (MEASUREMENT_ID === "G-XXXXXXXXXX") {
    console.warn(
      "GA4: Google Analytics initialized with default placeholder G-XXXXXXXXXX. " +
      "Please set VITE_GA_MEASUREMENT_ID in your environment variables for real tracking."
    );
  } else {
    console.log(`GA4: Initializing Google Analytics 4 with ID: ${MEASUREMENT_ID}`);
  }
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackPageView = (path) => {
  if (!path) return;
  ReactGA.send({ hitType: "pageview", page: path });
  console.log(`GA4: Pageview tracked for: ${path}`);
};

/**
 * Tracks begin_checkout event in GA4
 * @param {Object} bookingDetails 
 */
export const trackBeginCheckout = (bookingDetails) => {
  try {
    const value = bookingDetails?.finalBookingCalculation?.finalAmount || 0;
    const items = [];

    if (bookingDetails?.movieId) {
      items.push({
        item_id: bookingDetails.movieId._id || "movie_id",
        item_name: bookingDetails.movieId.name || "movie_name",
        item_category: "Movie Ticket",
        price: bookingDetails?.finalBookingCalculation?.ticketCart?.ticketTotal || 0,
        quantity: bookingDetails?.setSeatData?.strSeatInfo
          ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length || 1
          : 1,
      });
    }

    ReactGA.event("begin_checkout", {
      currency: "INR",
      value: parseFloat(value),
      items: items,
    });
    console.log("GA4: Event 'begin_checkout' tracked", { value, items });
  } catch (error) {
    console.error("GA4: Error tracking begin_checkout event:", error);
  }
};

/**
 * Tracks successful purchase event in GA4 (Tickets & Snacks)
 * @param {Object} bookingDetails 
 */
export const trackPurchase = (bookingDetails) => {
  try {
    const items = [];

    // 1. Add movie ticket details
    if (bookingDetails?.movieId) {
      const ticketTotal = bookingDetails?.finalBookingCalculation?.ticketCart?.ticketTotal || 0;
      const quantity = bookingDetails?.setSeatData?.strSeatInfo
        ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length || 1
        : 1;

      items.push({
        item_id: bookingDetails.movieId._id || "movie_id",
        item_name: bookingDetails.movieId.name || "movie_name",
        item_category: "Movie Ticket",
        price: parseFloat(ticketTotal),
        quantity: quantity,
      });
    }

    // 2. Add Snacks (F&B) details if any
    const fnbTotal = bookingDetails?.finalBookingCalculation?.foodCart?.fnbTotal || 0;
    if (fnbTotal > 0) {
      items.push({
        item_id: "snacks_total",
        item_name: "Food & Beverage",
        item_category: "Snacks",
        price: parseFloat(fnbTotal),
        quantity: 1,
      });
    }

    const transactionId = bookingDetails?.addSeatData?.strBookId || bookingDetails?.initTransId;
    const finalAmount = bookingDetails?.finalBookingCalculation?.finalAmount || bookingDetails?.paymentResponse?.amount || 0;

    if (!transactionId) {
      console.warn("GA4: Purchase event skipped due to missing transactionId", bookingDetails);
      return;
    }

    ReactGA.event("purchase", {
      transaction_id: transactionId,
      value: parseFloat(finalAmount),
      currency: "INR",
      items: items,
    });
    console.log("GA4: Event 'purchase' tracked successfully", { transactionId, finalAmount, items });
  } catch (error) {
    console.error("GA4: Error tracking purchase event:", error);
  }
};

/**
 * Tracks successful membership subscription purchase event in GA4
 * @param {Array} membershipItem 
 */
export const trackMembershipPurchase = (membershipItem) => {
  try {
    const item = membershipItem?.[0];
    if (!item) return;

    const transactionId = item.initTransId || item.subscriptionId?._id || "membership_txn";
    const price = parseFloat(item.subscriptionId?.price || item.payments?.[0]?.paymentResponse?.amount || 0);

    ReactGA.event("purchase", {
      transaction_id: transactionId,
      value: price,
      currency: "INR",
      items: [
        {
          item_id: item.subscriptionId?._id || "membership_id",
          item_name: `${item.subscriptionId?.title || "Membership"} Subscription`,
          item_category: "Membership",
          price: price,
          quantity: 1,
        }
      ],
    });
    console.log("GA4: Membership purchase event tracked successfully", { transactionId, price });
  } catch (error) {
    console.error("GA4: Error tracking membership purchase event:", error);
  }
};
