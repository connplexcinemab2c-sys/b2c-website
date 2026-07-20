import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import "./myTicket.css";
import PagesIndex from "../../../PagesIndex";

export default function MyTicket() {
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const transId = new URLSearchParams(location.search).get("transId");
  const [bookingDetails, setBookingDetails] = useState({});
  const [value, setValue] = React.useState(5);
  const [openTerm, setOpenTerm] = React.useState(false);
  const [settingsState, setSettingsState] = useState({});
  const [openHelp, setOpenHelp] = React.useState(false);
  const handleOpenTerm = () => setOpenTerm(true);
  const handleCloseTerm = () => setOpenTerm(false);

  //   Help modal
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);
  useEffect(() => {
    getBookingDetails();
    getGeneralSettings();
  }, []);
  const getBookingDetails = () => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("initTransId", transId);
    PagesIndex.apiPostHandler(PagesIndex.Api.BOOKING_DETAILS, urlEncoded)
      .then((res) => {
        setBookingDetails(res.data);
        dispatch(PagesIndex.hideLoader());
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
      });
  };
  const getGeneralSettings = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_GENERAL_SETTINGS).then(
      (res) => {
        if (res?.status === 200) {
          setSettingsState(res?.data);
        } else {
          PagesIndex.toast.error(res?.message);
        }
        dispatch(PagesIndex.hideLoader());
      }
    );
  };
  return (
    <>
      <Index.Box className="ticket-wrapper">
        <Index.Box className="ticket-main">
          <Index.Box className="ticket-logo-sec">
            <img
              src={PagesIndex.Svg.ConnplexLogo}
              alt="logo"
              className="ticket-logo"
            />
          </Index.Box>
          <Index.Box className="feedback-sec">
            <Index.Typography
              component="p"
              variant="p"
              className="feedback-title"
            >
              Feedback submitted
            </Index.Typography>
            <Index.Rating
              className="cus-rating"
              name="simple-controlled"
              value={value}
              disabled
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
            />
          </Index.Box>
          <Index.Box className="ticket-content-sec">
            <Index.Box className="ticket-round ticket-round-top"></Index.Box>
            <Index.Typography
              component="p"
              variant="p"
              className="welcome-title"
            >
              HI{" "}
              <span className="welcome-name">
                {bookingDetails?.userId?.firstName &&
                bookingDetails?.userId?.lastName
                  ? `${bookingDetails?.userId?.firstName} ${bookingDetails?.userId?.lastName}`
                  : "Patron"}
              </span>
              ,<br></br>
              WELCOME TO CONNPLEX SMART THEATRES!
            </Index.Typography>
            <Index.Typography
              component="p"
              variant="p"
              className="welcome-title welcome-my"
            >
              SCAN THE QR CODE AT<br></br>
              THE ENTRANCE OF THE SMART<br></br> THEATRE
            </Index.Typography>
            <Index.Box className="ticket-qr-main cus-center">
              <Index.Box className="ticket-qr-sec">
                <PagesIndex.QRCode
                  value={bookingDetails?.addSeatData?.strBookId}
                  // value={bookingDetails?.initTransId}
                  renderAs="canvas"
                  bgColor={"#fff"}
                  fgColor={"#000"}
                  size={130}
                />
                {/* <img src={PagesIndex.Svg.qrCode} alt="qr" className="qr-img" /> */}
              </Index.Box>
            </Index.Box>
            <Index.Typography
              component="p"
              variant="p"
              className="welcome-title book-id-text"
            >
              BOOKING ID : {bookingDetails?.addSeatData?.strBookId}
              <br /> INVOICE NO. : {bookingDetails?.initTransId}
            </Index.Typography>
            <Index.Box className="movie-details">
              <Index.Box className="movie-details-box">
                <Index.Box className="movie-sec cus-center">
                  <img
                    src={PagesIndex.Svg.film}
                    alt="film"
                    className="film-ic"
                  />
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="movie-title"
                  >
                    Movie
                  </Index.Typography>
                </Index.Box>
                <Index.Typography
                  component="p"
                  variant="p"
                  className="movie-title movie-name"
                >
                  {bookingDetails?.movieId?.name} - (
                  {bookingDetails?.movieId?.censorRating})
                </Index.Typography>
                <Index.Typography
                  component="p"
                  variant="p"
                  className="movie-time"
                >
                  <span>
                    {PagesIndex.moment(
                      bookingDetails?.showId?.sessionRealShow
                    ).format("DD MMM YYYY")}
                  </span>{" "}
                  |{" "}
                  <span>
                    {PagesIndex.moment(
                      bookingDetails?.showId?.sessionRealShow
                    ).format("hh:mm A")}
                  </span>
                </Index.Typography>
              </Index.Box>
              <Index.Box className="movie-details-box">
                <Index.Box className="movie-sec cus-center">
                  <img
                    src={PagesIndex.Svg.theatre}
                    alt="film"
                    className="film-ic"
                  />
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="movie-title"
                  >
                    {bookingDetails?.showId?.screenName}
                  </Index.Typography>
                </Index.Box>
                {/* <Index.Typography
                  component="p"
                  variant="p"
                  className="movie-title movie-name"
                >
                  01
                </Index.Typography> */}
                {/* <Index.Typography component='p' variant='p' className='movie-time'><span>21 Dec 2023</span> | <span>01:15 PM</span>
                                </Index.Typography> */}
              </Index.Box>
              <Index.Box className="movie-details-box br-bottom">
                <Index.Box className="movie-sec cus-center">
                  <img
                    src={PagesIndex.Svg.seat}
                    alt="film"
                    className="film-ic"
                  />
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="movie-title"
                  >
                    Seat
                  </Index.Typography>
                </Index.Box>
                <Index.Typography
                  component="p"
                  variant="p"
                  className="movie-title movie-name"
                >
                  {bookingDetails?.setSeatData?.strSeatInfo}
                </Index.Typography>
                {/* <Index.Typography component='p' variant='p' className='movie-time'><span>21 Dec 2023</span> | <span>01:15 PM</span>
                                </Index.Typography> */}
              </Index.Box>
              <Index.Box className="ticket-detail-sec">
                <Index.Box className="ticket-round ticket-round-left"></Index.Box>
                <Index.Box className="ticket-round ticket-round-right"></Index.Box>
                <Index.Box className="ticket-round ticket-round-bottom"></Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    NO. OF TICKETS:
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    {
                      bookingDetails?.setSeatData?.strSeatInfo
                        ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length
                        : 0
                    }
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    TOTAL AMOUNT PAID:
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    ₹
                    {parseFloat(
                      typeof bookingDetails?.paymentResponse?.amount ===
                        "string"
                        ? bookingDetails?.paymentResponse?.amount
                        : bookingDetails?.paymentResponse?.amount / 100 || 0
                    ).toFixed(2)}
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    COST BREAKUP :
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    &nbsp;
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    NET TICKET CHARGE :
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    ₹
                    {parseFloat(
                      bookingDetails?.addSeatData?.curTicketsTotal -
                        bookingDetails?.addSeatData?.curTicketsTax1 -
                        bookingDetails?.addSeatData?.curTicketsTax2
                    ).toFixed(2)}
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    CGST CHARGE (9%) :
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    ₹{bookingDetails?.addSeatData?.curTicketsTax1}
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    SGST CHARGE (9%) :
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    ₹{bookingDetails?.addSeatData?.curTicketsTax2}
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    CONVENIENCE FEES :
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
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
                <Index.Box className="ticket-con-sec">
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    TICKET COST :
                  </Index.Typography>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="title-con-text"
                  >
                    ₹
                    {parseFloat(
                      bookingDetails?.addSeatData?.curTicketsTotal +
                        bookingDetails?.cinemaId?.convenienceFees *
                          (bookingDetails?.setSeatData?.strSeatInfo
                            ? bookingDetails.setSeatData.strSeatInfo.split(" - ")[1]?.split(",").length
                            : 0)
                    ).toFixed(2)}
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="ticket-footer-sec">
            <Index.Typography component="p" variant="p" className="gst-text">
              GSTIN: <span>{bookingDetails?.cinemaId?.GSTNumber}</span>
            </Index.Typography>
            <Index.Typography
              component="p"
              variant="p"
              className="smart-theatre"
            >
              #INDIA KA APNA SMART THEATRE
            </Index.Typography>
            <Index.Box className="ticket-footer-btn">
              <Index.Button className="term-btn" onClick={handleOpenTerm}>
                Terms and Conditions
              </Index.Button>
              <Index.Button className="term-btn" onClick={handleOpenHelp}>
                Need help? Click here
              </Index.Button>
            </Index.Box>
            <Index.Box className="ticket-social-sec cus-center">
              <Index.Link
                className="ticket-social-link cus-center"
                to={"https://www.theconnplex.com"}
                target="_blank"
              >
                <img
                  src={PagesIndex.Svg.internet}
                  alt="internet"
                  className="social-img"
                />
              </Index.Link>
              <Index.Link
                className="ticket-social-link cus-center"
                to={`${settingsState?.instagramUrl}`}
                target="_blank"
              >
                <img
                  src={PagesIndex.Svg.instagram}
                  alt="instagram"
                  className="social-img"
                />
              </Index.Link>
              <Index.Link
                className="ticket-social-link cus-center"
                to={`${settingsState?.facebookUrl}`}
                target="_blank"
              >
                <img
                  src={PagesIndex.Svg.facebook}
                  alt="facebook"
                  className="social-img"
                />
              </Index.Link>
              <Index.Link
                className="ticket-social-link cus-center"
                to={`${settingsState?.linkedInUrl}`}
                target="_blank"
              >
                <img
                  src={PagesIndex.Svg.linkedin}
                  alt="linkedin"
                  className="social-img"
                />
              </Index.Link>
              <Index.Link
                className="ticket-social-link cus-center"
                to={`${settingsState?.twitterUrl}`}
                target="_blank"
              >
                <img
                  src={PagesIndex.Svg.twitter}
                  alt="twitter"
                  className="social-img mt-4"
                />
              </Index.Link>
            </Index.Box>
            <Index.Typography
              component="p"
              variant="p"
              className="smart-theatre"
            >
              Digital billing powered by
            </Index.Typography>
            <img src={PagesIndex.Svg.razorpay} alt="logo" className="pay-img" />
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <Index.Modal
        open={openTerm}
        onClose={handleCloseTerm}
        aria-labelledby="select-city-modal-title"
        aria-describedby="select-city-modal-description"
        className="select-city-modal ticket-term-modal"
      >
        <Index.Box className="select-city-modal-inner ticket-term-modal-inner">
          <Index.Box className="modal-inner cus-scrollbar">
            <Index.Box className="popular-city-box">
              <Index.Box className="popular-city-header">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="popular-city-title"
                >
                  Terms & Conditions
                </Index.Typography>
              </Index.Box>
              <Index.Box className="popular-city-wrapper-main cus-scrollbar">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  1. The viewer below the age of 18 years cannot be admitted for
                  movies certified as A rated.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  2. Entry in the Audi will be given before 5 minutes of the
                  showtime.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  3. Tickets are mandatory for children aged 3 years and above.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  4. The ticket is only valid for the date and the show printed
                  on the ticket.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  5. The ticket is neither Transferable nor Refundable.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  6. Rights of admission are reserved.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  7. Management will not allow the viewer to enter/ carry any
                  stuff from outside (eatable/ drink) except one small water
                  bottle per viewer.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  8. Items like Laptop bags, Baggage, food packages, cameras,
                  cigarettes/ e-cigarettes/ bidi, knives, firearms, lighters/
                  matchboxes, and all types of inflammable objects are strictly
                  restricted.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  9. Only online booking partner messages are allowed, printouts
                  & forwarded messages are allowed for both Movies Tickets and
                  F&B.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  10. If there is any show breakdown or cancellation due to
                  technical reasons, money will be refunded according to the
                  booking process. Online booking will get a refund online and
                  not at the theatre.
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="ticket-modal-text"
                >
                  11. A minimum of 6 tickets is required to run the show, or the
                  show will be cancelled.
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
      <Index.Modal
        open={openHelp}
        onClose={handleCloseHelp}
        aria-labelledby="select-city-modal-title"
        aria-describedby="select-city-modal-description"
        className="select-city-modal ticket-term-modal"
      >
        <Index.Box className="select-city-modal-inner ticket-term-modal-inner">
          <Index.Box className="modal-inner cus-scrollbar">
            <Index.Box className="popular-city-box">
              <Index.Box className="popular-city-header ticket-help-modal">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="popular-city-title"
                >
                  Help & support
                </Index.Typography>
                {/* <img src={PagesIndex.Svg.support} alt='support' className='support-img' /> */}
              </Index.Box>
              <Index.Box className="popular-city-wrapper-main cus-scrollbar">
                <Index.FormControl>
                  {/* <Index.FormLabel id="demo-radio-buttons-group-label">Gender</Index.FormLabel> */}
                  <Index.RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="female"
                    name="radio-buttons-group help-radio-btn"
                  >
                    <Index.FormControlLabel
                      value="female"
                      className="radio-list-lable"
                      control={<Index.Radio className="radio-list" />}
                      label="I cannot see my bill"
                    />
                    <Index.FormControlLabel
                      value="male"
                      className="radio-list-lable"
                      control={<Index.Radio className="radio-list" />}
                      label="This is not my bill"
                    />
                    <Index.FormControlLabel
                      value="bill"
                      className="radio-list-lable"
                      control={<Index.Radio className="radio-list" />}
                      label="There are mistakes in the bill"
                    />
                    <Index.FormControlLabel
                      value="feedback"
                      className="radio-list-lable"
                      control={<Index.Radio className="radio-list" />}
                      label="I want to give feedback to the store"
                    />
                  </Index.RadioGroup>
                  <Index.Box className="help-modal-footer cus-center">
                    <Index.Button className="btn btn-secondary">
                      Cancel
                    </Index.Button>
                    <Index.Button className="btn btn-primary">
                      Next
                    </Index.Button>
                  </Index.Box>
                </Index.FormControl>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
}
