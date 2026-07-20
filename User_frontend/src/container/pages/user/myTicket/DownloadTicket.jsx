import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import "./myTicket.css";
import PagesIndex from "../../../PagesIndex";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DownloadTicket() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();

  const transId = new URLSearchParams(location.search).get("transId");
  const isDownloadTicket =
    new URLSearchParams(location.search).get("isDownload") || false;


  const [bookingDetails, setBookingDetails] = useState({});
  const [value, setValue] = React.useState(5);
  const [openTerm, setOpenTerm] = React.useState(false);
  const [settingsState, setSettingsState] = useState({});
  const [isTicketGenerated, SetIsTicketGenerated] = useState(false);
  const [finalBookingCalculation, setFinalBookingCalculation] = useState({});
  console.log(finalBookingCalculation, ":finalBookingCalculation");
  const [openHelp, setOpenHelp] = React.useState(false);
  const handleOpenTerm = () => setOpenTerm(true);
  const handleCloseTerm = () => setOpenTerm(false);

  const [openTicketCartGST, setOpenTicketCartGST] = useState(false);
  const [openFoodCartGST, setOpenFoodCartGST] = useState(false);

  const handleTicketCartGSTToolTip = () => {
    setOpenTicketCartGST(!openTicketCartGST);
  };
  const handleFoodCartGSTToolTip = () => {
    setOpenFoodCartGST(!openFoodCartGST);
  };

  //   Help modal
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);
  useEffect(() => {
    getGeneralSettings();
  }, []);
  useEffect(() => {
    if (transId != undefined) {
      getBookingDetails();
    }
  }, [transId]);
  const getBookingDetails = () => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("initTransId", transId);
    PagesIndex.apiPostHandler(PagesIndex.Api.BOOKING_DETAILS, urlEncoded)
      .then((res) => {
        setBookingDetails(res.data);
        setFinalBookingCalculation(res?.data?.finalBookingCalculation);
        if (isDownloadTicket) {
          SetIsTicketGenerated(true);
        }
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

  function html2canvasSuccess(canvas) {
    let ticketWidth;
    let ticketHeight;
    let ticketView;
    let sizeUnitType;
    if (window.screen.width < 1066) {
      ticketView = "p";
      sizeUnitType = "pt";
      (ticketWidth = 375), (ticketHeight = 1200);
    } else {
      ticketView = "l";
      sizeUnitType = "px";
      (ticketWidth = 1266), (ticketHeight = 1190);
    }
    var pdf = new jsPDF(ticketView, sizeUnitType, [ticketWidth, ticketHeight]),
      pdfInternals = pdf.internal,
      pdfPageSize = pdfInternals.pageSize,
      pdfScaleFactor = pdfInternals.scaleFactor,
      pdfPageWidth = pdfPageSize.width,
      pdfPageHeight = pdfPageSize.height,
      totalPdfHeight = 0,
      htmlPageHeight = canvas.height,
      htmlScaleFactor = canvas.width / pdfPageWidth;

    while (totalPdfHeight < htmlPageHeight) {
      var ctx = canvas.getContext("2d");
      ctx.webkitImageSmoothingEnabled = true;
      ctx.mozImageSmoothingEnabled = true;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      var img = new Image();
      img.src = canvas.toDataURL();

      ctx.drawImage(img, 0, 0);
      // ctx.drawImage(img, 0, totalPdfHeight, img.width, img.height, 0, 0, img.width, img.height);
      pdf.addImage(
        img,
        "jpeg",
        0,
        0,
        pdfPageWidth,
        pdfPageHeight,
        null,
        "NONE"
      );

      totalPdfHeight += pdfPageHeight * pdfScaleFactor * htmlScaleFactor;

      if (totalPdfHeight < htmlPageHeight) {
        pdf.addPage();
      }
    }

    let curDate = PagesIndex.moment(new Date()).format("DD-MM-YYYY");
    pdf.save(`Connplex-movie-ticket (${curDate})`); // Save PDF
    localStorage.removeItem("DownloadTicket");
    setTimeout(() => {
      // navigate("/account", { state: { tab: 1 } });
      PagesIndex.toast.success("Ticket Download Successfully");
    }, [2000]);
  }
  useEffect(() => {
    if (isTicketGenerated) {
      html2canvas(document.getElementById("download-ticket-pdf"), {
        scale: 2,
        dpi: 144,
      }).then((canvas) => {
        html2canvasSuccess(canvas);
      });
      SetIsTicketGenerated(false);
    }
  }, [isTicketGenerated]);

  function preventBack() {
    window.history.forward();
  }
  setTimeout(preventBack(), 0);

  return (
    <>
      <Index.Box className="ticketing-download" id="download-ticket-pdf">
        <Index.Box className="ticket-wrapper">
          <Index.Box className="ticket-main">
            <Index.Box className="ticket-logo-sec">
              <img
                src={PagesIndex.Png.connplexLogo}
                alt="logo"
                className="ticket-logo"
              // style={{ width: 'auto', height: '50px', objectFit: 'fill ' }}
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
                THE ENTRANCE OF THE{" "}
                {bookingDetails?.cinemaId?.cinemaName
                  ? bookingDetails?.cinemaId?.cinemaName
                  : "SMART THEATRE"}
              </Index.Typography>
              <Index.Box className="flex-movie-content">
                <Index.Box className="ticket-qr-main cus-center start-cust">
                  <Index.Box className="ticket-qr-sec">
                    <PagesIndex.QRCode
                      // value={`https://ticketing.theconnplex.com/download-ticket?transId=${bookingDetails?.initTransId}`}
                      value={`${bookingDetails?.addSeatData?.strBookId}`}
                      // value={`${bookingDetails?.initTransId}`}
                      renderAs="canvas"
                      bgColor={"#fff"}
                      fgColor={"#000"}
                      size={105}
                    />

                    {/* <img src={PagesIndex.Svg.qrCode} alt="qr" className="qr-img" /> */}
                  </Index.Box>
                  <Index.Typography
                    component="p"
                    variant="p"
                    className="welcome-title book-id-text"
                  >
                    BOOKING ID : {bookingDetails?.addSeatData?.strBookId}
                    <br /> INVOICE NO. : {bookingDetails?.initTransId}
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="moview-name-show">
                  <Index.Box className="movie-details-box mb-20">
                    <Index.Box className="movie-sec cus-center align-start">
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
                      {
                        bookingDetails?.showId?.sessionRealShow ? (
                          <>
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
                      </>
                        ) : "-"
                      }

                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="movie-details-box ">
                    <Index.Box className="movie-tabflex">
                      <Index.Box className="movie-sec cus-center align-start">
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
                      <Index.Box className="movie-sec cus-center align-start">
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
                    </Index.Box>
                    <Index.Box className="movie-details-box br-bottom seat-movie-details">
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
                </Index.Box>
              </Index.Box>

              <Index.Box className="movie-details">
                <Index.Box className="ticket-detail-sec">
                  {/* <Index.Box className="ticket-round ticket-round-left"></Index.Box> */}
                  {/* <Index.Box className="ticket-round ticket-round-right"></Index.Box> */}
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


                  <Index.Box className="ticking-show-details">
                    <Index.Box className="ticket-flex-gst">
                      <Index.Box className="ticket-details-book-confirm">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-label bold-confirm-details"
                        >
                          TICKET PRICE :
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-value  bold-confirm-details"
                        >
                          ₹
                          {finalBookingCalculation?.ticketCart?.ticketTotal
                            ? parseFloat(
                              finalBookingCalculation?.ticketCart?.ticketTotal
                            ).toFixed(2) :"0.00"}
                        </Index.Typography>
                      </Index.Box>

{
  finalBookingCalculation?.foodCart?.fnbTotal > 0 && (
    <Index.Box className="ticket-details-book-confirm">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-label bold-confirm-details"
                        >
                          FOOD AND BEVERAGES PRICE :
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-value bold-confirm-details"
                        >
                          ₹{finalBookingCalculation?.foodCart?.fnbTotal
                            ? parseFloat(
                              finalBookingCalculation?.foodCart?.fnbTotal
                            ).toFixed(2)
                            : "0.00"}
                        </Index.Typography>
                      </Index.Box>
  )
}
                      
                    </Index.Box>


                    {bookingDetails?.fAndBDetails?.length > 0 ? (
                      <Index.Box className="book-details-beverage">
                        <Index.Box className="book-beverage-contain">

                          <Index.Box className="">
                            {bookingDetails?.fAndBDetails?.map((item) => {
                              return (

                                <Index.Box className="ticket-flex-gst">
                                  <Index.Box className="ticket-details-book-confirm">
                                    <Index.Typography
                                      variant="p"
                                      component="p"
                                      className="booking-detail-label bold-confirm-details"
                                    >
                                      {`${item?.name} (x${item?.quantity})`} :
                                    </Index.Typography>
                                    <Index.Typography
                                      component="p"
                                      variant="p"
                                      className="booking-detail-value  bold-confirm-details"
                                    >
                                      ₹
                                      {parseFloat(item?.price).toFixed(2)}
                                    </Index.Typography>
                                  </Index.Box>
                                </Index.Box>
                              );
                            })}
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    ) : (
                      ""
                    )}
                  </Index.Box>



                  {bookingDetails?.fAndBDetails?.length > 0 ?
                    <>
                      <Index.Box className="ticking-show-details">
                        <Index.Box className="ticket-flex-gst">
                          {/* <Index.Box className="ticket-details-book-confirm">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-detail-label bold-confirm-details"
                            >
                              Food And Beverages Price :
                            </Index.Typography>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-detail-value bold-confirm-details"
                            >
                              ₹{" "}
                              {finalBookingCalculation?.foodCart?.total
                                ? parseFloat(
                                  bookingDetails?.foodAndBvgResponse
                                    ?.curFoodTotal +
                                  (bookingDetails?.foodAndBvgResponse
                                    ?.curFoodTotal *
                                    5) /
                                  100
                                ).toFixed(2)
                                : 0}
                            </Index.Typography>
                          </Index.Box> */}
                          {bookingDetails?.fAndBDetails?.length > 0 ?
                            finalBookingCalculation &&
                              Object?.keys(finalBookingCalculation)?.length > 0 ? (
                              <>
                                {/* {finalBookingCalculation?.foodCart
                                  ?.membershipDiscount ? (
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
                                      ₹
                                      {finalBookingCalculation?.foodCart
                                        ?.membershipDiscount
                                        ? finalBookingCalculation?.foodCart?.membershipDiscount?.toFixed(
                                          2
                                        )
                                        : 0}
                                    </Index.Typography>
                                  </Index.Box>
                                ) : ""}
                                {finalBookingCalculation?.foodCart
                                  ?.discountAmount ? (
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
                                      ₹
                                      {finalBookingCalculation?.foodCart
                                        ?.discountAmount
                                        ? finalBookingCalculation?.foodCart?.discountAmount?.toFixed(
                                          2
                                        )
                                        : 0}
                                    </Index.Typography>
                                  </Index.Box>
                                ) : ""}
                                {finalBookingCalculation?.foodCart
                                  ?.totalAfterDiscount ? (
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
                                      {finalBookingCalculation?.foodCart
                                        ?.totalAfterDiscount
                                        ? parseFloat(
                                          finalBookingCalculation?.foodCart
                                            ?.totalAfterDiscount
                                        )?.toFixed(2)
                                        : 0}
                                    </Index.Typography>
                                  </Index.Box>
                                ) : ""} */}


                                {/* 
                                  <Index.Box className="payment-summary-row">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label flex-gst-details"
                    >
                      GST
                      <Index.ClickAwayListener
                        // onClickAway={handleFoodCartGSTToolTip}
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
                      {parseFloat(finalBookingCalculation?.foodCart?.cgst + finalBookingCalculation?.foodCart?.sgst).toFixed(
                        2
                      ) !== "NaN"
                        ? `₹${parseFloat(
                            finalBookingCalculation?.foodCart?.cgst + finalBookingCalculation?.foodCart?.sgst
                          ).toFixed(2)}`
                        : 0}
                    </Index.Typography>
                                  </Index.Box> 
                                */}

                                {/* 
                                    <Index.Box className="payment-summary-row">
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="payment-summary-label"
                              >
                                Sub Total :
                              </Index.Typography>
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="payment-summary-price"
                              >
                                ₹{" "}
                                {finalBookingCalculation?.foodCart?.total
                                  ? finalBookingCalculation?.foodCart?.total?.toFixed(
                                      2
                                    )
                                  : 0}
                              </Index.Typography>
                                    </Index.Box> 
                                */}
                              </>
                            ) : "" : ""}
                        </Index.Box>
                      </Index.Box>
                    </>
                    : null}

                  {/* <Index.Box className="ticking-show-details">
                    <Index.Box className="ticket-flex-gst">
                      <Index.Box className="ticket-details-book-confirm">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-label bold-confirm-details"
                        >
                          Coupon :
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-value bold-confirm-details"
                        >
                          ₹ 549.00
                        </Index.Typography>
                      </Index.Box>

                      <Index.Box className="payment-summary-row">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="payment-summary-label"
                        >
                          <span>Coupon Title : </span>{" "}
                          <span>CNPX - 0000030</span>
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="payment-summary-price"
                        >
                          ₹
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box> */}

                  {/* <Index.Box className="ticking-show-details">
                    <Index.Box className="ticket-flex-gst">
                      <Index.Box className="ticket-details-book-confirm">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-label bold-confirm-details"
                        >
                          Service Charge :
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-value bold-confirm-details"
                        >
                          ₹ 0.00
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box> */}

                  <Index.Box className="ticking-show-details">
                    <Index.Box className="ticket-flex-gst">
                    {finalBookingCalculation?.ticketCart?.membershipDiscount || finalBookingCalculation?.foodCart?.membershipDiscount
                               ? (
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
                                  {parseFloat(
                                        +finalBookingCalculation?.ticketCart
                                          ?.membershipDiscount + +finalBookingCalculation?.foodCart?.membershipDiscount
                                      )?.toFixed(2)}
                                   
                                </Index.Typography>
                              </Index.Box>
                            ):""}

                             {finalBookingCalculation?.rewardCoinsRedeemed
                               ? (
                              <Index.Box className="payment-summary-row">
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-label"
                                >
                                  Reward Points Applied ({finalBookingCalculation?.rewardCoinsRedeemed || 0} pts) :
                                </Index.Typography>
                                <Index.Typography
                                  variant="p"
                                  component="p"
                                  className="payment-summary-price"
                                >
                                  - ₹
                                  {parseFloat(finalBookingCalculation?.rewardDiscountApplied)?.toFixed(2)}
                                   
                                </Index.Typography>
                              </Index.Box>
                            ):""}
                            {finalBookingCalculation?.ticketCart?.discountAmount
                               || finalBookingCalculation?.foodCart?.discountAmount
                               ? (
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
                                  ₹
                                  {parseFloat(
                                        +finalBookingCalculation?.ticketCart?.discountAmount + +finalBookingCalculation?.foodCart?.discountAmount
                                    )?.toFixed(2)
                                  }
                                </Index.Typography>
                              </Index.Box>
                            ): ""}
                    </Index.Box>
                  </Index.Box>


                  <Index.Box className="ticking-show-details">
                    <Index.Box className="ticket-flex-gst">
                      <Index.Box className="ticket-details-book-confirm">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-label bold-confirm-details"
                        >
                          CONVENIENCE FEE :
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-detail-value bold-confirm-details"
                        >
                          ₹
                          {finalBookingCalculation?.convenienceFeesObject?.total > 0 ? parseFloat(finalBookingCalculation?.convenienceFeesObject?.total).toFixed(2)
                            : "0.00"}

                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>

                  <Index.Box className="ticking-total-show">
                    <Index.Box className="total-title-tick final-amount">
                      <span>TOTAL AMOUNT PAID : </span>{" "}
                      <span>
                        {/*₹{" "}
                         {finalBookingCalculation?.finalAmount
                          ? parseFloat(
                            finalBookingCalculation?.finalAmount
                          )?.toFixed(2)
                          : parseFloat(
                            typeof bookingDetails?.paymentResponse?.amount ===
                              "string"
                              ? bookingDetails?.paymentResponse?.amount
                              : bookingDetails?.paymentResponse?.amount /
                              100 || 0
                          ).toFixed(2)} */}

                        ₹
                        {/* {parseFloat(
                          typeof bookingDetails?.paymentResponse?.amount === "string"
                            ? bookingDetails?.paymentResponse?.amount
                            : bookingDetails?.paymentResponse?.amount / 100 || 0
                        ).toFixed(2)} */}
                          {parseFloat(
                              bookingDetails?.finalBookingCalculation?.finalAmount
                              ? bookingDetails?.finalBookingCalculation?.finalAmount
                              : bookingDetails?.paymentResponse?.amount
                          ).toFixed(2)}
                      </span>
                    </Index.Box>
                  </Index.Box>

                  {/* 
                  <Index.Box className="coupon-details">
                    <Index.Box className="foodItem mb-20px ">
                      <Index.Typography
                        component="p"
                        variant="p"
                        className="heading-fb"
                      >
                        Coupon Code
                      </Index.Typography>
                      <Index.Box className="bg-coupon-contain">
                        <Index.Box className="ticket-con-sec">
                          <Index.Typography
                            component="p"
                            variant="p"
                            className="title-con-text"
                          >
                            CNPX - 0000030
                          </Index.Typography>
                          <Index.Typography
                            component="p"
                            variant="p"
                            className="title-con-text"
                          >
                            Get 10% OFF
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box> */}
                </Index.Box>
              </Index.Box>
            </Index.Box>
            <Index.Box className="ticket-footer-sec">
              <Index.Typography component="p" variant="p" className="gst-text">
                GSTIN: <span>{bookingDetails?.cinemaId?.GSTNumber}</span>
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </>
  );
}
