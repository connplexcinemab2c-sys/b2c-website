import { useEffect, useState } from "react";
// import { getUserToken } from "../../../../redux/user/action";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

function MembershipConfirmationScreen() {
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const [membershipItem, setMembershipItem] = useState([]);
  const transId = new URLSearchParams(location.search).get("transId");
  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);

  useEffect(() => {
    dispatch(PagesIndex.showLoader());
    if (transId) {
      getMembershipList();
    }
  }, [dispatch, transId]);

  //   console.log(location, ":location");
  useEffect(() => {
    if (membershipItem.length > 0) {
      const timeoutId = setTimeout(() => {
        dispatch(PagesIndex.hideLoader());
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
    // Cleanup the timeout if the component unmounts before the timeout finishes
  }, [membershipItem]);

  const getMembershipList = () => {
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_MEMBERSHIP_TRANSACTION_LIST,
      "",
      userToken
    )
      .then((res) => {
        if (res?.status === 200) {
          const filterData = res?.data.filter((data) => {
            return data?.initTransId === transId;
          });
          // Set the membership data after hiding the loader
          setMembershipItem(filterData);
        }
      })
      .catch((error) => {
        // Hide the loader in case of an error
        // dispatch(PagesIndex.hideLoader());
        console.error("Error fetching membership list:", error);
      });
  };


  return (
    <Index.Box>
      <Index.Box
        className={`main-confirmation-screen ${
          location.pathname === "/my-booked-ticket"
            ? "my-booking-ticket-screen"
            : ""
        }`}
      >
        {membershipItem.length > 0 && (
          <Index.Box className="cus-container">
            {location.pathname === "/membership-success" && (
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
                    {/* ₹ {membershipItem?.[0]?.subscriptionId?.price} */}
                    ₹ {membershipItem?.[0]?.payments?.[0]?.paymentResponse?.amount}
                    
                  </Index.Typography>{" "}
                  Successful
                </Index.Typography>
              </Index.Box>
            )}
            <Index.Box className="confirmation-screen-body">
              <Index.Box className="booking-id-box">
                <Index.Typography className="booking-confirm-text">
                  {location.pathname === "/my-booked-ticket"
                    ? "YOUR MEMBERSHIP DETAILS!"
                    : `Thank you for becoming a ${membershipItem?.[0]?.subscriptionId?.title &&  membershipItem?.[0]?.subscriptionId?.title
                      .charAt(0)
                      .toUpperCase() +
                      membershipItem?.[0]?.subscriptionId?.title.slice(1).toLowerCase()} member!`}
                </Index.Typography>
              </Index.Box>
              <Index.Box className="booking-detail-box confirmation-details-box">
                <Index.Box className="booking-detail-left">
                  <img
                    className="movie-img"
                    src={PagesIndex.Png.MembershipSuccess}
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
                          {membershipItem?.[0]?.subscriptionId?.title && `${membershipItem?.[0]?.subscriptionId?.title
                      .charAt(0)
                      .toUpperCase() +
                      membershipItem?.[0].subscriptionId?.title.slice(1).toLowerCase()} benefits`}
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="booking-summary-bottom">
                      <Index.Box className="book-membership-list">
                        <Index.Box className="list-center-member mt-zero-member">
                         
                          <Index.Box className="membership-content-box">
                            <Index.Typography className="membership-content active">
                              {membershipItem?.[0]?.subscriptionDetails
                                ?.discountOnTicket === "" ? (
                                ""
                              ) : (
                                <Index.CheckIcon />
                              )}

                              <Index.Box className="membership-content-box">
                                {membershipItem?.[0]?.subscriptionDetails
                                  ?.discountOnTicket === ""
                                  ? ""
                                  : `Upto ${membershipItem?.[0]?.subscriptionDetails?.discountOnTicketUpTo}% Discount on Tickets: Get more movies for your
                                money.`}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                         
                          <Index.Box className="membership-content-box">
                            <Index.Typography className="membership-content active">
                              {membershipItem?.[0]?.subscriptionDetails
                                ?.coins === "" ? (
                                ""
                              ) : (
                                <Index.CheckIcon />
                              )}

                              <Index.Box className="membership-content-box">
                                {membershipItem?.[0]?.subscriptionDetails
                                  ?.coins === ""
                                  ? ""
                                  : `Upto ${membershipItem?.[0]?.subscriptionDetails?.coins}%
                                Coins: Earn rewards redeemable for tickets.`}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box className="membership-content-box">
                            <Index.Typography className="membership-content active">
                              {membershipItem?.[0]?.subscriptionDetails
                                ?.welcomeGift === "Yes" ? (
                                <Index.CheckIcon />
                              ) : (
                                ""
                              )}

                              <Index.Box className="membership-content-box">
                                {membershipItem?.[0]?.subscriptionDetails
                                  ?.welcomeGift === "Yes"
                                  ? "Welcome Gift: Receive a special surprise when you join."
                                  : ""}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        )}

        <Index.Box className="confirmation-screen-footer">
          <Index.Box className="confirmation-screen-footer-btn confirmation-screen-footer-btn-flex">
            <Index.Link to="/membership" className="btn btn-primary">
              Back To Membership
            </Index.Link>
            <Index.Link to="/" className="btn btn-primary">
              Explore Connplex Cinema
            </Index.Link>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default MembershipConfirmationScreen;
