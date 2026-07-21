import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

function BookingInfo() {
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const params = PagesIndex.useParams();
  const transId = params.transId;
  const [bookingDetails, setBookingDetails] = useState({});
  const [finalBookingCalculation, setFinalBookingCalculation] = useState({});
  const [openTicketCartGST, setOpenTicketCartGST] = useState(false);
  const [openFoodCartGST, setOpenFoodCartGST] = useState(false);

  const handleTicketCartGSTToolTip = () => {
    setOpenTicketCartGST(!openTicketCartGST);
  };
  const handleFoodCartGSTToolTip = () => {
    setOpenFoodCartGST(!openFoodCartGST);
  };
  useEffect(() => {
    getBookingDetails();
  }, []);
  const getBookingDetails = () => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("initTransId", transId);
    PagesIndex.apiPostHandler(PagesIndex.Api.BOOKING_DETAILS, urlEncoded)
      .then((res) => {
        setBookingDetails(res.data);
        setFinalBookingCalculation(res?.data?.finalBookingCalculation);
        dispatch(PagesIndex.hideLoader());
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
      });
  };
  return (
    <Index.Box className="main-booking-info">
      <Index.Box className="cus-container">
        <Index.Box className="booking-info-header">
          <Index.Box className="confirm-icon">
            <Index.DoneAllIcon />
          </Index.Box>
          <Index.Typography className="confirm-text">
            Your Booking Details
          </Index.Typography>
        </Index.Box>
        <Index.Box className="booking-info-body">
          <Index.Box className="booking-qr-info">
            <PagesIndex.QRCode
              value={bookingDetails?.addSeatData?.strBookId}
              // value={bookingDetails?.initTransId}
              renderAs="canvas"
              bgColor={"#23211e"}
              fgColor={"#bcbcbc"}
              size={125}
            />
            <Index.Box className="booking-code-text-wrapper">
              <Index.Typography className="booking-code-text">
                Booking ID
              </Index.Typography>
              <Index.Typography className="booking-code-text">
                {bookingDetails?.addSeatData?.strBookId}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
          <Index.Box className="booking-detail-box">
            <img
              className="movie-img"
              src={
                bookingDetails?.movieId?.poster
                  ? `${PagesIndex.IMAGES_API_ENDPOINT}/${bookingDetails?.movieId?.poster}`
                  : PagesIndex.Png.NoImage
              }
              width="585"
              height="800"
              alt="movie"
            />
            <Index.Box className="booking-detail-summary">
              <Index.Box className="booking-detail-title-box">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="booking-detail-title"
                >
                  {bookingDetails?.movieId?.name}
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="booking-detail-content"
                >
                  {bookingDetails?.movieId?.languages} (
                  {bookingDetails?.movieId?.censorRating}) -{" "}
                  {bookingDetails?.movieId?.category}
                </Index.Typography>
              </Index.Box>
              <Index.Typography
                variant="p"
                component="p"
                className="booking-detail-value"
              >
                {PagesIndex.moment(
                  bookingDetails?.showId?.sessionRealShow
                ).format("MMM DD, YYYY")}{" "}
                |{" "}
                {PagesIndex.moment(
                  bookingDetails?.showId?.sessionRealShow
                ).format("hh:mm A")}
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="booking-detail-value"
              >
                <Index.Typography variant="p" component="p">
                  {bookingDetails?.showId?.screenName}
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="booking-detail-content"
                  >
                    &nbsp;({" "}
                    {
                      bookingDetails?.setSeatData?.strSeatInfo
                        ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length
                        : 0
                    }{" "}
                    Tickets )
                  </Index.Typography>
                </Index.Typography>
                {bookingDetails?.setSeatData?.strSeatInfo}
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="booking-detail-value"
              >
                <Index.Typography
                  variant="span"
                  component="span"
                  className="booking-detail-content"
                >
                  {bookingDetails?.cinemaId?.displayName} : &nbsp;
                </Index.Typography>
                <a href={bookingDetails?.cinemaId?.googleUrl} target="_blank">
                  {bookingDetails?.cinemaId?.address}
                </a>
              </Index.Typography>
            </Index.Box>
          </Index.Box>
          <Index.Box className="booking-summary-bottom gap-price-book">
            <Index.Box className="payment-summary">
              <Index.Box className="ticket-book-gst">
                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label "
                  >
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="coupon-book-code"
                    >
                      Ticket Price :
                    </Index.Typography>
                    {/* <Index.Typography variant="p" component="p">
                      (
                      {
                        bookingDetails?.setSeatData?.strSeatInfo
                          .split(" - ")[1]
                          .split(",").length
                      }{" "}
                      x ₹
                      {parseFloat(
                        bookingDetails?.foodAndBvgResponse?.curTicketsTotal -
                          bookingDetails?.foodAndBvgResponse?.curTicketsTax1 -
                          bookingDetails?.foodAndBvgResponse?.curTicketsTax2 /
                            bookingDetails?.setSeatData?.strSeatInfo
                              .split(" - ")[1]
                              .split(",").length
                      ).toFixed(2)}
                      )
                    </Index.Typography> */}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-price"
                  >
                    ₹
                    {finalBookingCalculation?.ticketCart?.basePrice
                      ? parseFloat(
                          finalBookingCalculation?.ticketCart?.basePrice
                        ).toFixed(2)
                      : parseFloat(
                          bookingDetails?.finalBookingCalculation?.finalAmount
                            ? bookingDetails.finalBookingCalculation.finalAmount
                            : bookingDetails?.paymentResponse?.amount || 0
                        ).toFixed(2)}
                  </Index.Typography>
                </Index.Box>
                {finalBookingCalculation &&
                  Object?.keys(finalBookingCalculation)?.length > 0 && (
                    <>
                      {finalBookingCalculation?.ticketCart?.membershipDiscount >
                        0 && (
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
                            className="payment-summary-price"
                          >
                            - ₹
                            {finalBookingCalculation?.ticketCart
                              ?.membershipDiscount
                              ? parseFloat(
                                  finalBookingCalculation?.ticketCart
                                    ?.membershipDiscount
                                )?.toFixed(2)
                              : 0}
                          </Index.Typography>
                        </Index.Box>
                      )}

                      {finalBookingCalculation?.ticketCart?.discountAmount >
                        0 && (
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
                            className="payment-summary-price"
                          >
                            - ₹
                            {finalBookingCalculation?.ticketCart?.discountAmount
                              ? parseFloat(
                                  finalBookingCalculation?.ticketCart
                                    ?.discountAmount
                                )?.toFixed(2)
                              : 0}
                          </Index.Typography>
                        </Index.Box>
                      )}

                      {finalBookingCalculation?.ticketCart?.totalAfterDiscount >
                        0 && (
                        <Index.Box className="payment-summary-row">
                          <Index.Typography
                            variant="p"
                            component="p"
                            className="payment-summary-label"
                          >
                            Total After Discount :
                          </Index.Typography>
                          <Index.Typography
                            variant="p"
                            component="p"
                            className="payment-summary-price"
                          >
                            ₹
                            {finalBookingCalculation?.ticketCart
                              ?.totalAfterDiscount
                              ? parseFloat(
                                  finalBookingCalculation?.ticketCart
                                    ?.totalAfterDiscount
                                )?.toFixed(2)
                              : 0}
                          </Index.Typography>
                        </Index.Box>
                      )}

                      <Index.Box className="payment-summary-row">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="payment-summary-label flex-gst-details"
                        >
                          GST
                          <Index.ClickAwayListener
                            onClickAway={handleTicketCartGSTToolTip}
                            className="tooltip-click-away"
                          >
                            <div>
                              <Index.Tooltip
                                PopperProps={{
                                  disablePortal: true,
                                }}
                                onClose={handleTicketCartGSTToolTip}
                                open={openTicketCartGST}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                arrow="center"
                                placement="right"
                                className="tooltip-open-btn"
                                title={
                                  <div className="tooltip-inner-details">
                                    <Index.Box className="payment-summary-row">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="payment-summary-label"
                                      >
                                        CGST (
                                        {finalBookingCalculation?.ticketCart
                                          ?.totalAfterDiscount < 115
                                          ? `6%`
                                          : "9%"}
                                        )
                                      </Index.Typography>
                                    </Index.Box>
                                    <Index.Box className="payment-summary-row">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="payment-summary-label"
                                      >
                                        SGST (
                                        {finalBookingCalculation?.ticketCart
                                          ?.totalAfterDiscount < 115
                                          ? `6%`
                                          : "9%"}
                                        )
                                      </Index.Typography>
                                    </Index.Box>
                                  </div>
                                }
                              >
                                <Index.Button
                                  onClick={handleTicketCartGSTToolTip}
                                  className="handal-btn-tool"
                                >
                                  <img
                                    src={PagesIndex.Png.informationButton}
                                    className="information-icon"
                                  />
                                </Index.Button>
                              </Index.Tooltip>
                            </div>
                          </Index.ClickAwayListener>
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="payment-summary-price"
                        >
                          {parseFloat(
                            finalBookingCalculation?.ticketCart?.cgst +
                              finalBookingCalculation?.ticketCart?.sgst
                          ).toFixed(2) !== "NaN"
                            ? `₹${parseFloat(
                                finalBookingCalculation?.ticketCart?.cgst +
                                  finalBookingCalculation?.ticketCart?.sgst
                              ).toFixed(2)}`
                            : 0}
                        </Index.Typography>
                      </Index.Box>

                      <Index.Box className="payment-summary-row">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="payment-summary-label"
                        >
                          Sub Total:
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="payment-summary-price"
                        >
                          ₹
                          {finalBookingCalculation?.ticketCart?.total
                            ? parseFloat(
                                finalBookingCalculation?.ticketCart?.total
                              )?.toFixed(2)
                            : 0}
                        </Index.Typography>
                      </Index.Box>
                    </>
                  )}
              </Index.Box>
              <Index.Box className="payment-summary-label">
                <Index.Typography variant="p" component="p">
                  <Index.Box className="payment-summary-row">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label coupon-book-code"
                    >
                      Food and beverages:
                    </Index.Typography>
                  </Index.Box>
                  {bookingDetails?.fAndBDetails?.map((data, key) => {
                    return (
                      <>
                        <Index.Box
                          className="booking-info-food-list-item"
                          key={key}
                        >
                          <Index.Box>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-detail-label  title-booking-couple"
                            >
                              {data?.name.toLowerCase()}{" "}
                              <small>
                                (x
                                {data?.quantity})
                              </small>
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-detail-label payment-summary-price food-couple-prices"
                            >
                              ₹{parseFloat(data?.price).toFixed(2)}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </>
                    );
                  })}
                </Index.Typography>
              </Index.Box>
              <Index.Box className="food-beverages-gst">
                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label coupon-book-code"
                  >
                    Food and beverages price :
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-price"
                  >
                    ₹
                    {bookingDetails?.foodAndBvgResponse?.curFoodTotal
                      ? parseFloat(
                          bookingDetails?.foodAndBvgResponse?.curFoodTotal +
                            (bookingDetails?.foodAndBvgResponse?.curFoodTotal *
                              5) /
                              100
                        ).toFixed(2)
                      : 0}
                  </Index.Typography>
                </Index.Box>
                {bookingDetails?.fAndBDetails?.length > 0 && (
                  <>
                    <Index.Box className="payment-summary-row food-list-row flex-booking-wrap">
                      {finalBookingCalculation &&
                        Object.keys(finalBookingCalculation)?.length > 0 && (
                          <>
                            {finalBookingCalculation?.foodCart
                              ?.membershipDiscount > 0 && (
                              <Index.Box className="payment-summary-row ticket-book-gst">
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-label"
                                >
                                  Membership Discount:
                                </Index.Typography>
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-price"
                                >
                                  ₹
                                  {finalBookingCalculation?.foodCart
                                    ?.membershipDiscount
                                    ? parseFloat(
                                        finalBookingCalculation?.foodCart
                                          ?.membershipDiscount
                                      )?.toFixed(2)
                                    : 0}
                                </Index.Typography>
                              </Index.Box>
                            )}
                            {finalBookingCalculation?.foodCart?.discountAmount >
                              0 && (
                              <Index.Box className="payment-summary-row ticket-book-gst">
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-label"
                                >
                                  Discount:
                                </Index.Typography>
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-price"
                                >
                                  ₹
                                  {finalBookingCalculation?.foodCart
                                    ?.discountAmount
                                    ? parseFloat(
                                        finalBookingCalculation?.foodCart
                                          ?.discountAmount
                                      )?.toFixed(2)
                                    : 0}
                                </Index.Typography>
                              </Index.Box>
                            )}

                            {finalBookingCalculation?.foodCart
                              ?.totalAfterDiscount > 0 && (
                              <Index.Box className="payment-summary-row ticket-book-gst">
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-label"
                                >
                                  Total After Discount:
                                </Index.Typography>
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-price"
                                >
                                  ₹
                                  {finalBookingCalculation?.foodCart
                                    ?.totalAfterDiscount
                                    ? parseFloat(
                                        finalBookingCalculation?.foodCart
                                          ?.totalAfterDiscount
                                      )?.toFixed(2)
                                    : 0}
                                </Index.Typography>
                              </Index.Box>
                            )}

                            <Index.Box className="payment-summary-row">
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="payment-summary-label flex-gst-details"
                              >
                                GST
                                <Index.ClickAwayListener
                                  onClickAway={handleFoodCartGSTToolTip}
                                  className="tooltip-click-away"
                                >
                                  <div>
                                    <Index.Tooltip
                                      PopperProps={{
                                        disablePortal: true,
                                      }}
                                      onClose={handleFoodCartGSTToolTip}
                                      open={openFoodCartGST}
                                      disableFocusListener
                                      disableHoverListener
                                      disableTouchListener
                                      arrow="center"
                                      placement="right"
                                      className="tooltip-open-btn"
                                      title={
                                        <div className="tooltip-inner-details">
                                          <Index.Box className="payment-summary-row">
                                            <Index.Typography
                                              variant="p"
                                              component="p"
                                              className="payment-summary-label"
                                            >
                                              CGST (2.5%)
                                            </Index.Typography>
                                          </Index.Box>
                                          <Index.Box className="payment-summary-row">
                                            <Index.Typography
                                              variant="p"
                                              component="p"
                                              className="payment-summary-label"
                                            >
                                              SGST (2.5%)
                                            </Index.Typography>
                                          </Index.Box>
                                        </div>
                                      }
                                    >
                                      <Index.Button
                                        onClick={handleFoodCartGSTToolTip}
                                        className="handal-btn-tool"
                                      >
                                        <img
                                          src={PagesIndex.Png.informationButton}
                                          className="information-icon"
                                        />
                                      </Index.Button>
                                    </Index.Tooltip>
                                  </div>
                                </Index.ClickAwayListener>
                              </Index.Typography>
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="payment-summary-price"
                              >
                                {parseFloat(
                                  finalBookingCalculation?.foodCart?.cgst +
                                    finalBookingCalculation?.foodCart?.sgst
                                ).toFixed(2) !== "NaN"
                                  ? `₹${parseFloat(
                                      finalBookingCalculation?.foodCart?.cgst +
                                        finalBookingCalculation?.foodCart?.sgst
                                    ).toFixed(2)}`
                                  : 0}
                              </Index.Typography>
                            </Index.Box>

                            <Index.Box className="payment-summary-row">
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="payment-summary-label"
                              >
                                Sub Total:
                              </Index.Typography>
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="payment-summary-price"
                              >
                                ₹{" "}
                                {finalBookingCalculation?.foodCart?.total
                                  ? parseFloat(
                                      finalBookingCalculation?.foodCart?.total
                                    )?.toFixed(2)
                                  : 0}
                              </Index.Typography>
                            </Index.Box>
                          </>
                        )}
                    </Index.Box>
                  </>
                )}
              </Index.Box>

              {/* <Index.Box className="coupon-book-contain">
                <Index.Box className="coupon-book-title payment-summary-row">
                  <Index.Typography className="coupon-book-code payment-summary-label">
                    Coupon :
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-price"
                  >
                    ₹ 200
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label"
                  >
                    <span>Coupon Title : </span> CNPX - 0000030
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-price"
                  >
                    ₹ 200
                  </Index.Typography>
                </Index.Box>
              </Index.Box> */}

              <Index.Box className="payment-summary-row">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="booking-detail-label"
                >
                  Service Charge :
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="booking-detail-value"
                >
                  ₹
                  {/* {parseFloat(
                                    item?.cinemaId?.convenienceFees *
                                      item?.setSeatData?.strSeatInfo
                                        .split(" - ")[1]
                                        .split(",").length
                                  ).toFixed(2)} */}
                  0
                </Index.Typography>
              </Index.Box>

              <Index.Box className="payment-summary-row mt-10">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="payment-summary-label"
                >
                  <Index.Typography variant="p" component="p" >
                    Convenience fee :
                  </Index.Typography>
                  <Index.Typography variant="p" component="p">
                    (
                    {
                      bookingDetails?.setSeatData?.strSeatInfo
                        ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length
                        : 0
                    }{" "}
                    x ₹{bookingDetails?.cinemaId?.convenienceFees} - Including
                    GST)
                  </Index.Typography>
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="payment-summary-price"
                >
                  ₹
                  {parseFloat(
                    bookingDetails?.cinemaId?.convenienceFees *
                      (bookingDetails?.setSeatData?.strSeatInfo
                        ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length
                        : 0)
                  ).toFixed(2)}
                </Index.Typography>
              </Index.Box>
            </Index.Box>
            <Index.Box className="total-payment-row">
              <Index.Typography
                variant="p"
                component="p"
                className="total-payment"
              >
                Total :
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="total-payment"
              >
                ₹
                {parseFloat(
                  bookingDetails?.finalBookingCalculation?.finalAmount
                    ? bookingDetails.finalBookingCalculation.finalAmount
                    : bookingDetails?.paymentResponse?.amount || 0
                ).toFixed(2)}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default BookingInfo;
