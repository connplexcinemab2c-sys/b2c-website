import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { getUserToken, userLogOut } from "../../../../redux/user/action";
import ShowTicketCalculation from "../../../../components/common/ShowTicketCalculation";

function ConfirmationScreen() {
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const navigate = PagesIndex.useNavigate();
  const transId = new URLSearchParams(location.search).get("transId");
  const [loading, setLoading] = useState(true);
  const [openTicketCartGST, setOpenTicketCartGST] = useState(false);
  const [openFoodCartGST, setOpenFoodCartGST] = useState(false);

  const handleTicketCartGSTToolTip = () => {
    setOpenTicketCartGST(!openTicketCartGST);
  };
  const handleFoodCartGSTToolTip = () => {
    setOpenFoodCartGST(!openFoodCartGST);
  };
  // const userToken = new URLSearchParams(location.search).get("token");
  // console.log(location, ":location");
  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);
  const [bookingDetails, setBookingDetails] = useState({});
  const [finalBookingCalculation, setFinalBookingCalculation] = useState({});
  const [earnedReward, setEarnedReward] = useState(null);
  useEffect(() => {
    getBookingDetails();
  }, []);

  const getBookingDetails = () => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("initTransId", transId);
    PagesIndex.apiPostHandler(PagesIndex.Api.BOOKING_DETAILS, urlEncoded)
      .then((res) => {
        console.log(res.data, ":res.data", res.data.finalBookingCalculation)
        setBookingDetails(res.data);
        setFinalBookingCalculation(res.data.finalBookingCalculation);
        dispatch(PagesIndex.hideLoader());
        setLoading(false);
        if (location.pathname === "/confirmation-screen" && transId && userToken) {
          PagesIndex.apiGetHandler(
            `${PagesIndex.Api.REWARD_BY_TRANSACTION}?transId=${transId}`,
            "",
            userToken
          )
            .then((r) => { if (r?.status === 200 && r.data) setEarnedReward(r.data); })
            .catch(() => {});
        }
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
        setLoading(false);
      });
  };

  // useEffect(() => {
  //   if(userToken && transId && location?.pathname == '/confirmation-screen'){
  //     dispatch(getUserToken(userToken))
  //   }
  // },[userToken , transId , location])

  console.log(bookingDetails, ":bookingDetails")
  return (
    <Index.Box
      className={`main-confirmation-screen ${
        location.pathname === "/my-booked-ticket"
          ? "my-booking-ticket-screen"
          : ""
      }`}
    >
      <Index.Box className="cus-container">
        {location.pathname === "/confirmation-screen" && (
          <Index.Box className="confirmation-screen-header">
            <Index.Box className="confirm-icon">
              <Index.DoneAllIcon />
            </Index.Box>
            <Index.Typography className="confirm-text">
              Payment of{" "}
              <Index.Typography
                component="span"
                className="confirm-text-amount"
              >
                ₹
                {parseFloat(
                  typeof bookingDetails?.paymentResponse?.amount === "string"
                    ? bookingDetails?.paymentResponse?.amount
                    : bookingDetails?.paymentResponse?.amount / 100 || 0
                ).toFixed(2)}
              </Index.Typography>{" "}
              Successful
            </Index.Typography>
            {earnedReward?.coins > 0 && (
              <Index.Box className="reward-earned-banner">
                <Index.MonetizationOnIcon className="reward-earned-icon" />
                <Index.Typography className="reward-earned-text">
                  You earned{" "}
                  <span className="reward-earned-pts">
                    {earnedReward.coins.toLocaleString()} pts
                  </span>{" "}
                  on this booking!
                </Index.Typography>
              </Index.Box>
            )}
          </Index.Box>
        )}
        <Index.Box className="confirmation-screen-body">
          <Index.Box className="booking-id-box">
            <Index.Typography className="booking-confirm-text">
              {location.pathname === "/my-booked-ticket"
                ? "YOUR BOOKING DETAILS!"
                : "YOUR BOOKING IS CONFIRMED!"}
            </Index.Typography>
            <Index.Typography className="booking-confirm-id">
              Booking ID {bookingDetails?.addSeatData?.strBookId || "-"}
            </Index.Typography>
            <Index.Typography className="booking-confirm-id">
              Booking Date{" "}
              {PagesIndex.moment(bookingDetails?.updatedAt).format(
                "DD-MM-YYYY hh:mm A"
              )}
            </Index.Typography>
          </Index.Box>
          <Index.Box className="booking-detail-box">
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
                      {bookingDetails?.movieId?.name || "-"}
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="booking-detail-content"
                    >
                      {bookingDetails?.movieId?.languages || "-"}{" "}
                      {bookingDetails?.movieId?.censorRating &&
                        `${bookingDetails?.movieId?.censorRating}-`}{" "}
                      {bookingDetails?.movieId?.category}
                    </Index.Typography>
                    {
                      bookingDetails?.showId?.sessionRealShow ? 
                    
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
                    </Index.Typography>: "-"
                    }
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
                        {bookingDetails?.cinemaId?.address || "-"}
                      </a>
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="booking-summary-right">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="booking-detail-value"
                    >
                      Order ID : {bookingDetails?.initTransId || "-"}
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="booking-detail-value"
                    >
                      {bookingDetails?.showId?.screenName || "-"}
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="booking-detail-value"
                    >
                      {bookingDetails?.setSeatData?.strSeatInfo || "-"}
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
                      Tickets )
                    </Index.Typography>
                    {!loading && (
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-detail-value"
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                        }}
                      >
                        Status :{" "}
                        {bookingDetails?.commitStatus ? (
                          <span style={{ color: "green" }}>BOOKED</span>
                        ) : (
                          <span style={{ color: "red" }}>FAILED</span>
                        )}
                      </Index.Typography>
                    )}
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
              <PagesIndex.QRCode
                value={bookingDetails?.addSeatData?.strBookId}
                // value={bookingDetails?.initTransId}
                renderAs="canvas"
                bgColor={"#23211e"}
                fgColor={"#bcbcbc"}
                size={100}
              />
              <Index.Typography className="booking-code-text">
                Booking ID
              </Index.Typography>
              <Index.Typography className="booking-code-text">
                {bookingDetails?.addSeatData?.strBookId}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="confirmation-screen-footer">
          <Index.Typography className="confirmation-screen-footer-text">
            You can access your ticket from your Profile. We will send you an
            e-Mail/SMS Confirmation within 15 Minutes.
          </Index.Typography>
          {location.pathname !== "/app-confirmation-screen" && (
            <Index.Box className="confirmation-screen-footer-btn">
              <Index.Link to="/" className="btn btn-primary">
                Back To Home
              </Index.Link>
            </Index.Box>
          )}
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default ConfirmationScreen;
