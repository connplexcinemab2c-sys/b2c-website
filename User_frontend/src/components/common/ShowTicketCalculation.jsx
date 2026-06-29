import React, { useState } from "react";
import Index from "./../../container/Index";
import PagesIndex from "../PagesIndex";

const ShowTicketCalculation = ({ bookingDetails, finalBookingCalculation }) => {
  const [openTicketCartGST, setOpenTicketCartGST] = useState(false);
  const [openFoodCartGST, setOpenFoodCartGST] = useState(false);

  const handleTicketCartGSTToolTip = () => {
    setOpenTicketCartGST(!openTicketCartGST);
  };
  const handleFoodCartGSTToolTip = () => {
    setOpenFoodCartGST(!openFoodCartGST);
  };


  return (
    <Index.Accordion>
      <Index.AccordionSummary
        expandIcon={<Index.ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Index.Typography
          variant="p"
          component="p"
          className="booking-detail-label"
        >
          Total Amount
        </Index.Typography>
        <Index.Typography
          variant="p"
          component="p"
          className="booking-detail-value"
        >
          ₹{parseFloat(
            bookingDetails?.finalBookingCalculation?.finalAmount
              ? bookingDetails?.finalBookingCalculation?.finalAmount
              : bookingDetails?.paymentResponse?.amount
          ).toFixed(2)}
        </Index.Typography>
      </Index.AccordionSummary>
      <Index.AccordionDetails className="show-booking-details">
        <Index.Box className="ticket-flex-gst">
          <Index.Box className="ticket-details-book-confirm">
            <Index.Typography
              variant="p"
              component="p"
              className="booking-detail-label bold-confirmation"
            >
              Ticket Price :
            </Index.Typography>
            <Index.Typography
              variant="p"
              component="p"
              className="booking-detail-value bold-confirmation"
            >
              ₹
              {finalBookingCalculation?.ticketCart?.ticketTotal
                ? parseFloat(
                  finalBookingCalculation?.ticketCart?.ticketTotal
                ).toFixed(2)
                :"0.00"}
            </Index.Typography>
          </Index.Box>
           {finalBookingCalculation &&
          Object.keys(finalBookingCalculation).length > 0 ? (
            <>
              {finalBookingCalculation?.ticketCart?.membershipDiscount || finalBookingCalculation?.foodCart?.membershipDiscount  ? (
                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label"
                  >
                    Membership Discount :
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-value"
                  >
                    - ₹{
                      parseFloat(
                        (Number(finalBookingCalculation?.ticketCart?.membershipDiscount) || 0) +
                        (Number(finalBookingCalculation?.foodCart?.membershipDiscount) || 0)
                      ).toFixed(2)
                    }
                  </Index.Typography>
                </Index.Box>
              ) : (
                ""
              )}

              {finalBookingCalculation?.ticketCart?.discountAmount || finalBookingCalculation?.foodCart?.discountAmount ? (
                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label"
                  >
                    Discount :
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-value"
                  >
                    - ₹{
                      parseFloat(
                        (Number(finalBookingCalculation?.ticketCart?.discountAmount) || 0) +
                        (Number(finalBookingCalculation?.foodCart?.discountAmount) || 0)
                      ).toFixed(2)
                    }
                  </Index.Typography>
                </Index.Box>
              ) : (
                ""
              )}

            </>
          ) :""}
      </Index.Box>

        {bookingDetails?.fAndBDetails?.length ? (
          <Index.Box className="confirm-space-ticket">
            <Index.Box className="food-confrimation-details">
              <Index.Box className="coupon-title-screen ticket-details-book-confirm w-100-full">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="booking-detail-label bold-confirmation"
                >
                  Foods & Beverages:
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="booking-detail-value bold-confirmation"
                >
                  ₹
                    {finalBookingCalculation?.foodCart?.fnbTotal
                    ? parseFloat(finalBookingCalculation?.foodCart?.fnbTotal).toFixed(2)
                    : 0}
                  
                </Index.Typography>
              </Index.Box>

              {bookingDetails?.fAndBDetails?.map((data, key) => (
                <Index.Box
                  className="food-list-item coupon-food-couple"
                  key={key}
                >
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-label"
                  >
                    {data?.name.toLowerCase()}{" "}
                    <small>(x{data?.quantity})</small>
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-label"
                  >
                    ₹{parseFloat(data?.price).toFixed(2)}
                  </Index.Typography>
                </Index.Box>
              ))}
            </Index.Box>
          </Index.Box>
        ) : null}

        {Number(finalBookingCalculation?.rewardCoinsRedeemed) > 0 && (
          <Index.Box className="payment-summary-row reward-discount-row">
            <Index.Typography
              variant="p"
              component="p"
              className="payment-summary-label reward-discount-label"
            >
              Reward Points Applied ({finalBookingCalculation?.rewardCoinsRedeemed} pts) :
            </Index.Typography>
            <Index.Typography
              variant="p"
              component="p"
              className="payment-summary-value reward-discount-value"
            >
              - ₹{parseFloat(finalBookingCalculation?.rewardDiscountApplied || 0).toFixed(2)}
            </Index.Typography>
          </Index.Box>
        )}

        <Index.Box>
          <Index.Typography
            variant="p"
            component="p"
            className="booking-detail-label"
          >
            Convenience fee <small>(Including GST)</small> :
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="booking-detail-value"
          >
            ₹
            {finalBookingCalculation?.convenienceFeesObject?.total > 0 ? parseFloat(
              finalBookingCalculation?.convenienceFeesObject?.total
            ).toFixed(2) : "0.00"}
          </Index.Typography>
        </Index.Box>

      </Index.AccordionDetails>
    </Index.Accordion>
  );
};

export default ShowTicketCalculation;
