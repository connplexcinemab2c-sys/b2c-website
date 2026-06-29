import React, { useEffect, useState } from "react";
import PagesIndex from "../../../PagesIndex";
import "../confirmationScreen/confirmationScreen.css";
import "../confirmationScreen/confirmationScreen.css";
import "./bookingHistory.css";
import Index from "../../../Index";
import "./bookingHistory.responsive.css";
import "../bookingInfo/bookingInfo.css";
import ShowTicketCalculation from "../../../../components/common/ShowTicketCalculation";

function BookingHistory() {
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const transId = new URLSearchParams(location.search).get("transId");
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
        setFinalBookingCalculation(res.data.finalBookingCalculation);
        dispatch(PagesIndex.hideLoader());
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
      });
  };
  return (
    <Index.Box className="main-booking-history main-confirmation-screen history-confirm-padding">
      <Index.Box className="add-booking-history-header">
        <Index.Box className="cus-container">
          <Index.Typography
            variant="h1"
            component="h1"
            className="header-title"
          >
            Booking Summary
          </Index.Typography>
        </Index.Box>
      </Index.Box>
      <Index.Box className="confirmation-screen-body">
        <Index.Box className="booking-detail-box history-book-details">
          <Index.Box className="booking-detail-left">
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
              <Index.Box className="booking-summary-top">
                <Index.Box className="booking-summary-left">
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
                    {bookingDetails?.movieId?.languages}{" "}
                    {bookingDetails?.movieId?.censorRating &&
                      `${bookingDetails?.movieId?.censorRating}-`}{" "}
                    {bookingDetails?.movieId?.category}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-content"
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
                    className="booking-detail-content"
                  >
                    <Index.Typography
                      variant="span"
                      component="span"
                      className="booking-detail-content"
                    >
                      <span>
                        {bookingDetails?.cinemaId?.displayName} : &nbsp;
                      </span>
                    </Index.Typography>
                    <a href={bookingDetails?.cinemaId?.googleUrl}>
                      {bookingDetails?.cinemaId?.address}
                    </a>
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="booking-summary-right">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-value"
                  >
                    Order ID : {bookingDetails?.initTransId}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-value"
                  >
                    {bookingDetails?.showId?.screenName}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-value"
                  >
                    {bookingDetails?.setSeatData?.strSeatInfo}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-detail-value"
                  >
                    ({" "}
                    {
                      bookingDetails?.setSeatData?.strSeatInfo
                        .split(" - ")[1]
                        .split(",").length
                    }{" "}
                    Tickets)
                  </Index.Typography>
                  <Index.Typography
                      variant="p"
                      component="p"
                      className="booking-detail-value"
                      sx={{display:"flex" ,justifyContent:"flex-end" , gap:"10px"}}
                    >
                     Status : {bookingDetails?.commitStatus ? <span style={{color:"green"}}>BOOKED</span> : <span style={{color:"red"}}>FAILED</span>}
                    </Index.Typography>
                </Index.Box>
              </Index.Box>
              <Index.Box className="booking-summary-bottom">
                <ShowTicketCalculation
                  bookingDetails={bookingDetails}
                  finalBookingCalculation={finalBookingCalculation}
                />
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="booking-detail-right">
            <Index.Typography className="booking-code-text id-right-history">
              Booking ID
            </Index.Typography>
            <Index.Typography className="booking-code-text id-details-history">
              {bookingDetails?.addSeatData?.strBookId}
            </Index.Typography>
            <Index.Typography className="booking-code-text id-dexsc-history">
              Oops!!! Something went wrong. If your money has been debited /
              tickets have not been confirmed then you can simply "Raise an
              Issue" Ticket by sharing the unsuccessful transaction details
              under "Your Profile" section on the Website/App and our Team shall
              get back to you on the same
            </Index.Typography>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default BookingHistory;
