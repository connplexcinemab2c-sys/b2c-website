import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import ComingSoon from "../comingSoon/ComingSoon";
import PagesIndex from "../../../PagesIndex";
import MembershipCouponModal from "./MembershipCouponModal";

const membershipDurationConstant = {
  30: "1 Month",
  90: "3 Month",
  365: "1 Year",
};

function Membership() {
  const [membershipItem, setMembershipItem] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [open, setOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState("");
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [btnLoading, setbtnLoading] = useState(false);
  const navigate = PagesIndex.useNavigate();
  const { userToken, isLoggedIn } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const dispatch = PagesIndex.useDispatch();
  const [toggle, setToggle] = useState(false);

  console.log(isLoggedIn, "qwqwqwqwq");
  const signInOpen = () => {
    setToggle(true);
  };
  const signInClose = () => setToggle(false);

  const handleClose = () => {
    setOpen(false);
    setSelectedMembership(null);
  };
  const handleOpen = (data) => {
    setOpen(true);
    setSelectedMembership(data);
  };
  const getMembershipDetails = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_MEMBERSHIP_LIST)
      .then((res) => {
        dispatch(PagesIndex.hideLoader());

        if (res?.status === 200) {
          // Sort the membership items by price in ascending order (lowest to highest)
          let sortedItems = res?.data.sort((a, b) => a.price - b.price);

          sortedItems = sortedItems.filter((item) => item.isPublished === true);

          setMembershipItem(sortedItems);
        }
      })
      .catch((error) => {
        dispatch(PagesIndex.hideLoader());
        PagesIndex.toast.error("Failed to load membership details");
      });
  };

  const getMembershipList = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_MEMBERSHIP_TRANSACTION_LIST,
      "",
      userToken
    )
      .then((res) => {
        dispatch(PagesIndex.hideLoader());

        if (res?.status === 200) {
          // Filter to get the active plan
          const activePlan = res?.data.find((data) => data?.isActive === true);
          setActivePlan(activePlan?.subscriptionId);
          console.log(res?.data, "res?.data ");
        }
      })
      .catch((error) => {
        dispatch(PagesIndex.hideLoader());
        PagesIndex.toast.error("Failed to load active membership");
      });
  };

  useEffect(() => {
    getMembershipDetails();
    getMembershipList();
  }, [userToken]);

  /**
   * Loads the Razorpay checkout script once and returns a promise that
   * resolves to true when ready, false on error.
   */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const existingScript = document.getElementById("razorpay-checkout-js");
      if (existingScript) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const displayRazorpay = async (item) => {
    setbtnLoading(true);

    // Step 1 — Create Razorpay order for subscription
    const urlencoded = new URLSearchParams();
    urlencoded.append("subscriptionId", item?.membershipId);
    if (appliedCoupon) {
      urlencoded.append("couponCode", item?.couponCode || "");
    }

    const orderRes = await PagesIndex.apiPostHandler(
      PagesIndex.Api.BUY_MEMBERSHIP,
      urlencoded,
      userToken
    ).catch(() => null);

    // --- CCAvenue path: backend returns raw HTML form ---
    if (typeof orderRes === "string") {
      setbtnLoading(false);
      const paymentDiv = document.getElementById("payment_html");
      paymentDiv.innerHTML = orderRes;
      const scripts = paymentDiv.getElementsByTagName("script");
      for (let elem of scripts) {
        eval(elem.innerHTML);
      }
      return;
    }

    // --- Razorpay path: backend returns JSON order details ---
    if (!orderRes || orderRes?.status !== 200) {
      PagesIndex.toast.error(
        orderRes?.message || "Something went wrong",
        { toastId: "membershipError" }
      );
      setbtnLoading(false);
      return;
    }

    // Free plan activated directly — backend returns redirect URL
    if (orderRes?.redirectUrl) {
      setbtnLoading(false);
      navigate(orderRes.redirectUrl);
      return;
    }

    const {
      razorpayOrderId,
      amount,
      keyId,
      prefill,
      transId,
      userId,
      subscriptionId,
      couponCode,
      totalDiscount,
    } = orderRes.data;

    // Step 2 — Load Razorpay checkout script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      PagesIndex.toast.error("Failed to load payment gateway. Please try again.");
      setbtnLoading(false);
      return;
    }

    // Step 3 — Open Razorpay popup
    const options = {
      key: keyId,
      amount,
      currency: "INR",
      name: "Connplex Smart Theatre",
      description: "Membership Subscription",
      order_id: razorpayOrderId,
      prefill,
      theme: { color: "#FF6B35" },
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI",
              instruments: [{ method: "upi" }],
            },
            other: {
              name: "Other Payment Methods",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" },
              ],
            },
          },
          sequence: ["block.upi", "block.other"],
          preferences: { show_default_blocks: true },
        },
      },

      handler: async (paymentResult) => {
        // Step 4 — Verify payment with backend
        setbtnLoading(true);
        const verifyPayload = new URLSearchParams();
        verifyPayload.append("razorpay_payment_id", paymentResult.razorpay_payment_id);
        verifyPayload.append("razorpay_order_id", paymentResult.razorpay_order_id);
        verifyPayload.append("razorpay_signature", paymentResult.razorpay_signature);
        verifyPayload.append("transId", transId);
        verifyPayload.append("userId", userId);
        verifyPayload.append("subscriptionId", subscriptionId);
        verifyPayload.append("couponCode", couponCode || "");
        verifyPayload.append("totalDiscount", totalDiscount || "0");
        verifyPayload.append("amount", amount);
        verifyPayload.append("paymentStatus", "success");

        const verifyRes = await PagesIndex.apiPostHandler(
          PagesIndex.Api.SUBSCRIPTION_RAZORPAY_VERIFY,
          verifyPayload,
          userToken
        ).catch(() => null);
        setbtnLoading(false);

        if (verifyRes?.redirectUrl) {
          navigate(verifyRes.redirectUrl);
        } else {
          navigate(`/membership-failed?transId=${transId}`);
        }
      },

      modal: {
        ondismiss: () => {
          setbtnLoading(false);
          navigate(`/membership-failed?transId=${transId}`);
        },
      },
    };

    setbtnLoading(false);
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      navigate(`/membership-failed?transId=${transId}`);
    });
    rzp.open();
  };

  return (
    <Index.Box className="main-membership">
      <Index.Box className="cus-container">
        <Index.Box className="membership-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="membership-header-title"
          >
            Membership
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="membership-header-subtitle"
          >
            Join membership by choosing your perfect option below
          </Index.Typography>
        </Index.Box>
        {membershipItem.length > 0 ? (
          <Index.Box className="membership-body">
            <Index.Box className="membership-item-box">
              {membershipItem?.map((item, key) => (
                <Index.Box key={key} className="membership-item">
                  <Index.Typography className="membership-title">
                    {item.title}
                  </Index.Typography>
                  <Index.Typography className="small-member-text">
                    {item.title === "platinum"
                      ? "Enjoy exclusive benefits like free tickets and VIP access"
                      : item.title === "gold"
                      ? "Unlock special discounts and perks for a premium movie experience"
                      : "Get started with basic savings and rewards"}
                  </Index.Typography>
                  {/* Show Active Plan text if this is the active plan  */}
                  {/* {activePlan && activePlan.title === item.title && (
                    <Index.Typography className="small-member-text active-plan">
                      Active Plan
                    </Index.Typography>
                  )} */}

                  <Index.Box className="button-inner-memberlist">
                    <Index.Box className="membership-price line-cross-prices">
                      <Index.Typography className="membership-price-inner">
                        Rs.
                        {item?.isDiscounted ? (
                          <>
                            <span className="line-add-prices">
                              {item?.price}{" "}
                            </span>{" "}
                            <span>
                              {" "}
                              / <span>{item?.discountedPrice}</span>
                            </span>{" "}
                          </>
                        ) : (
                          item?.price
                        )}
                        <br />
                        <span className="yearly-title">
                          {" "}
                          {item?.membershipDuration && (
                            <Index.Typography className="">
                              {membershipDurationConstant?.[
                                item?.membershipDuration
                              ] || ""}
                            </Index.Typography>
                          )}
                        </span>
                      </Index.Typography>
                    </Index.Box>

                    <Index.Box className="list-center-member">
                     
                      <Index.Box className="membership-content-box">
                        <Index.Typography
                          className={
                            item?.discountOnTicketUpTo === ""
                              ? "membership-content disable"
                              : "membership-content active"
                          }
                        >
                          {item?.discountOnTicketUpTo === "" ? (
                            <Index.ClearIcon />
                          ) : (
                            <Index.CheckIcon />
                          )}

                          <Index.Box className="membership-content-box">
                            {item?.discountOnTicketUpTo === ""
                              ? "No Discount on Tickets"
                              : `Upto ${item?.discountOnTicketUpTo}% Discount on Tickets: Get
                            more movies for your money`}
                          </Index.Box>
                        </Index.Typography>
                      </Index.Box>
                     
                      <Index.Box className="membership-content-box">
                        <Index.Typography
                          className={
                            item?.coins === ""
                              ? "membership-content disable"
                              : "membership-content active"
                          }
                        >
                          {item?.coins === "" ? (
                            <Index.ClearIcon />
                          ) : (
                            <Index.CheckIcon />
                          )}
                          <Index.Box className="membership-content-box">
                            {item?.coins === ""
                              ? "No Coins to Earn Rewards"
                              : `Upto ${item?.coins}% Coins: Earn rewards redeemable for
                            tickets.`}
                          </Index.Box>
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="membership-content-box">
                        <Index.Typography
                          className={
                            item?.welcomeGift === "Yes"
                              ? "membership-content active"
                              : "membership-content disable"
                          }
                        >
                          {item?.welcomeGift === "Yes" ? (
                            <Index.CheckIcon />
                          ) : (
                            <Index.ClearIcon />
                          )}

                          {item?.welcomeGift === "Yes" ? (
                            <Index.Box className="membership-content-box">
                              Welcome Gift: Receive a special surprise when you
                              join.
                            </Index.Box>
                          ) : (
                            <Index.Box className="membership-content-box">
                              No Welcome Gift
                            </Index.Box>
                          )}
                        </Index.Typography>
                      </Index.Box>
                      {/* Show Buy Now button only if there is no active plan or if this plan is different */}
                      {!activePlan || activePlan.title !== item.title ? (
                        <Index.Box className="membership-btn-box">
                          <PagesIndex.Button
                            secondary
                            className="membership-btn"
                            onClick={() => {
                              if (isLoggedIn) {
                                handleOpen(item);
                                // displayRazorpay(item);
                              } else {
                                signInOpen();
                              }
                            }}
                          >
                            Buy Now
                          </PagesIndex.Button>
                        </Index.Box>
                      ) : (
                        <>
                          <Index.Box className="membership-btn-box">
                            <PagesIndex.Button
                              secondary
                              className="membership-btn"
                              disabled
                            >
                              <Index.Typography className="small-member-text active-plan">
                                Active Plan
                              </Index.Typography>
                            </PagesIndex.Button>
                          </Index.Box>
                          {item?.membershipDuration && (
                            <Index.Typography className="membership-buration-text">
                              {membershipDurationConstant?.[
                                item?.membershipDuration
                              ] || ""}
                            </Index.Typography>
                          )}
                        </>
                      )}
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              ))}
            </Index.Box>
          </Index.Box>
        ) : (
          <ComingSoon />
        )}

        <Index.Box className="membership-term-box">
          <Index.Typography
            onClick={() => {
              navigate("/membership-terms-condition");
            }}
            className="terms-condition-title"
          >
            Terms & Conditions
          </Index.Typography>
        </Index.Box>
        {/* <ComingSoon />)  */}
      </Index.Box>
      <Index.Modal
        open={toggle}
        onClose={signInClose}
        aria-labelledby="signin-modal-title"
        aria-describedby="signin-modal-description"
        className="signin-modal"
      >
        <PagesIndex.Login signInClose={signInClose} />
      </Index.Modal>
    
      <MembershipCouponModal
        open={open}
        handleClose={handleClose}
        selectedMembership={selectedMembership}
        displayRazorpay={displayRazorpay}
        btnLoading={btnLoading}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        setbtnLoading={setbtnLoading}
      />
    </Index.Box>
  );
}

export default Membership;
