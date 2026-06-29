import React, { useState, useEffect } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import ShowTicketCalculation from "../../../../components/common/ShowTicketCalculation";

function BookingTab({ bookingList }) {
  const navigate = PagesIndex.useNavigate();

  const [page, setPage] = useState(1);
  const [openReportIssueModal, setOpenReportIssueModal] = useState(false);

  const [openTicketCartGST, setOpenTicketCartGST] = useState(false);
  const [openFoodCartGST, setOpenFoodCartGST] = useState(false);

  const handleTicketCartGSTToolTip = () => {
    setOpenTicketCartGST(!openTicketCartGST);
  };
  const handleFoodCartGSTToolTip = () => {
    setOpenFoodCartGST(!openFoodCartGST);
  };

  const handleChange = (event, value) => {
    setPage(value);
  };
  const handleOpenReportIssue = () => setOpenReportIssueModal(true);
  const handleCloseReportIssue = () => setOpenReportIssueModal(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <Index.Box className="account-tab-booking-main">
      <Index.Box className="account-tab-heading-box">
        <Index.Typography component="span" className="account-tab-heading">
          My Booking
        </Index.Typography>
      </Index.Box>
      {bookingList?.length ? (
        <>
          <Index.Box className="account-tab-booking">
            {bookingList
              ?.slice((page - 1) * 4, (page - 1) * 4 + 4)
              ?.map((item, key) => {
                let finalcalculation = item?.finalBookingCalculation;
                return (
                  <Index.Box key={key} className="your-booking-card">
                    <Index.Box className="flex-card">
                      <Index.Box
                        className="your-booking-img-box"
                        onClick={() => {
                          navigate({
                            pathname: `/my-booked-ticket`,
                            search: PagesIndex?.createSearchParams({
                              transId: item?.initTransId,
                            }).toString(),
                          });
                        }}
                      >
                        <img
                          src={
                            item?.movieId?.poster
                              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.movieId?.poster}`
                              : PagesIndex.Png.NoImage
                          }
                          width="585"
                          height="800"
                          alt="movie"
                        />
                        <Index.Box className="booking-cancel-main">
                      {item.commitStatus ? <span className="booking-success-status">BOOKED</span> : <span className="booking-failed-status">FAILED</span>}
                    </Index.Box>
                      </Index.Box>
                      <Index.Box className="booking-card-summary">
                        <Index.Box className="booking-card-header">
                          <Index.Typography
                            variant="p"
                            component="p"
                            className="booking-card-title"
                          >
                            {item?.movieId?.name}
                          </Index.Typography>
                          <Index.Link
                            to={`/download-ticket?transId=${item?.initTransId}&isDownload=true`}
                            target="_blank"
                          >
                            <Index.Typography
                              variant="span"
                              component="span"
                              className="booking-card-download"
                              // onClick={() => {
                              //   // setSelectTicket(item?.initTransId);
                              //   localStorage.setItem("DownloadTicket", true);
                              //   navigate({
                              //     pathname: `/download-ticket`,
                              //     target: "_blank",
                              //     search: PagesIndex?.createSearchParams({
                              //       transId: item?.initTransId,
                              //       isDownload: true,
                              //     }).toString(),
                              //   });
                              // }}
                            >
                              <Index.CloudDownloadIcon />
                            </Index.Typography>
                          </Index.Link>
                        </Index.Box>
                        <Index.Box
                          className=""
                          onClick={() => {
                            navigate({
                              pathname: `/my-booked-ticket`,
                              search: PagesIndex?.createSearchParams({
                                transId: item?.initTransId,
                              }).toString(),
                            });
                          }}
                        >
                          <Index.Box className="booking-card-row">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-label"
                            >
                              Genre :
                            </Index.Typography>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-value"
                            >
                              {item?.movieId?.category ?? "-"}
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box className="booking-card-row">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-label"
                            >
                              Date / Time :
                            </Index.Typography>
                          
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-value"
                            >
                            {  item?.showId?.sessionRealShow ?(
                              <>
                              {PagesIndex.moment(
                                item?.showId?.sessionRealShow
                              ).format("MMM DD, YYYY")}{" "}
                              |{" "}
                              {PagesIndex.moment(
                                item?.showId?.sessionRealShow
                              ).format("hh:mm A")}</>
                            ): "-"}
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box className="booking-card-row">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-label"
                            >
                              Screen :
                            </Index.Typography>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-value"
                            >
                              {item?.showId?.screenName ?? "-"}
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box className="booking-card-row">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-label"
                            >
                              Seat :
                            </Index.Typography>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-value"
                            >
                              {item?.setSeatData?.strSeatInfo ?? "-"}
                            </Index.Typography>
                          </Index.Box>
                          {/* <Index.Box className="booking-card-row">
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-card-label"
                        >
                          Amount :
                        </Index.Typography>
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="booking-card-value"
                        >
                          ₹
                          {parseFloat(
                            typeof item?.paymentResponse?.amount === "string"
                              ? item?.paymentResponse?.amount
                              : item?.paymentResponse?.amount / 100 || 0
                          ).toFixed(2)}
                        </Index.Typography>
                      </Index.Box> */}
                          <Index.Box className="booking-card-row">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-label"
                            >
                              Payment Mode :
                            </Index.Typography>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="booking-card-value"
                            >
                              {item?.paymentResponse?.method
                                ? item?.paymentResponse?.method === "upi"
                                  ? item?.paymentResponse?.method.toUpperCase()
                                  : item?.paymentResponse?.method
                                      ?.charAt(0)
                                      .toUpperCase() +
                                    item?.paymentResponse?.method
                                      ?.slice(1)
                                      .toLowerCase()
                                : item?.paymentResponse?.payment_mode
                                    ?.charAt(0)
                                    .toUpperCase() +
                                    item?.paymentResponse?.payment_mode
                                      ?.slice(1)
                                      .toLowerCase() || "-"}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>

                    <Index.Box className="main-confirmation-screen remove-padding res-left-amount">
                      <Index.Box className="booking-detail-box">
                        <Index.Box className="booking-summary-bottom">
                        <ShowTicketCalculation bookingDetails={item} finalBookingCalculation={finalcalculation}/>
                          
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                );
              })}
          </Index.Box>
          <Index.Pagination
            count={Math.ceil(bookingList?.length / 4)}
            page={page}
            onChange={handleChange}
          />
        </>
      ) : (
        <Index.Box className="no-found-svg-box">
          <Index.ConfirmationNumberIcon />
          You don't seem to have any recent booking.
        </Index.Box>
      )}

      <Index.Box className="any-issues">
        <Index.Typography className="any-query-text">
          If you have any questions or need assistance.
          <br /> You can also report any issues you encounter.
          <span onClick={handleOpenReportIssue} className="span-issue">
            Report Issue
          </span>
        </Index.Typography>
      </Index.Box>

      <PagesIndex.ReportIssueModal
        open={openReportIssueModal}
        onClose={handleCloseReportIssue}
      />
    </Index.Box>
  );
}

export default BookingTab;
