import React, { useEffect, useState } from "react";
import PagesIndex from "../../../PagesIndex";
import Index from "../../../Index";
import { encryptAndSignData } from "../../../../components/common/EncryptData";

const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).slice(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

const BookingCart = ({
  selectedFood,
  snackPrice,
  regionId,
  handleAddRemoveItem,
  handleRemoveItem,
  setOpenMobileModal,
  handleRollbackCoupon,
  isRemovingCoupon,
  setIsRemovingCoupon,
  bookingSession,
}) => {
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const navigate = PagesIndex.useNavigate();
  const { userDetails, userToken, region } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const stateData = PagesIndex.useSelector((state) => state.UserReducer);
console.log({selectedFood});
  const [expanded, setExpanded] = useState("panel1"); // state for open couponList
  const [coupenCode, setCoupenCode] = useState("");
  const [autoApply, setAutoApply] = useState(true);
  const [couponDrawer, setCouponDrawer] = useState(false);
  const [isFoodAccordionOpen, setIsFoodTotalAccordionOpen] = useState(true);
  const [isTotalAccordionOpen, setIsTotalAccordionOpen] = useState(false);

  const [coupenCodeError, setCoupenCodeError] = useState();

  const [ticketBasePrice, setTicketBasePrice] = useState(
    +parseFloat(
      stateData?.cinemaData?.ticketPriceDetails?.total -
        stateData?.cinemaData?.ticketPriceDetails?.tax1 -
        stateData?.cinemaData?.ticketPriceDetails?.tax2
    ).toFixed(2)
  );
  const [ticketQuantity, setTicketQuantity] = useState(
    stateData?.cinemaData?.selectedSeats?.length || 0
  );

  const [publicCouponList, setPublicCouponList] = useState([]);
  const [openTicketCartGST, setOpenTicketCartGST] = useState(false);
  const [openFoodCartGST, setOpenFoodCartGST] = useState(false);
  const [convenienceFeesDetails, setConvenienceFeesDetails] = useState({});

  const handleTicketCartGSTToolTip = () => {
    setOpenTicketCartGST(!openTicketCartGST);
  };
  const handleFoodCartGSTToolTip = () => {
    setOpenFoodCartGST(!openFoodCartGST);
  };

  const [appliedCoupon, setAppliedCoupon] = useState([]);
  const [totalAppliedCoupon, setTotalAppliedCoupon] = useState(0);
  const [ticketCart, setTicketCart] = useState({
    discountAmount: 0,
    basePrice: ticketBasePrice,
    qty: ticketQuantity,
    cgst: 0,
    sgst: 0,
    coupons: [],
    total: 0,
    totalAfterDiscount: 0,
  });
  const [foodCart, setFoodCart] = useState({
    discountAmount: 0,
    basePrice: 0,
    cgst: 0,
    sgst: 0,
    coupons: [],
    total: 0,
    mainPrice: 0,
    totalAfterDiscount: 0,
  });

  const [counponCartDetails, setCouponCartDetails] = useState({});

  // Reward redemption
  const [rewardBalance, setRewardBalance] = useState({
    availableCoins: 0,
    conversionPoints: 100,
    conversionValue: 10,
    maxRedemptionCap: 1000,
  });
 
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [appliedRewardPoints, setAppliedRewardPoints] = useState(0);

  const { availableCoins, conversionPoints, conversionValue, maxRedemptionCap } = rewardBalance;
  const sliderMax = Math.min(maxRedemptionCap, availableCoins);
  const previewDiscount = Math.floor(pointsToUse / conversionPoints) * conversionValue;
  const appliedDiscount = counponCartDetails?.rewardDiscount || 0;

  useEffect(() => {
    if (userToken) {
      PagesIndex.apiGetHandler(PagesIndex.Api.REWARD_BALANCE, "", userToken)
        .then((res) => { if (res?.status === 200) setRewardBalance(res.data); })
        .catch(() => {});
    }
  }, [userToken]);

  const handleTotalAccordionChange = () => {
    setIsTotalAccordionOpen(!isTotalAccordionOpen);
  };

  const handleFoodAccordionChange = () => {
    setIsFoodTotalAccordionOpen(!isFoodAccordionOpen);
  };

  const handleExpanded = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  // console.log(
  //   stateData?.cinemaData?.movieData.filmCategoryShortName,
  //   ":stateData?.cinemaData?.movieData"
  // );
  const fetchCouponList = async () => {
    dispatch(PagesIndex.showLoader());

    const payload = {
      cinemaObjectId: stateData?.cinemaData?.cinemaData?._id,
      cityId: regionId,
      // movieLanguage: stateData?.cinemaData?.movieData?.languages,
      movieLanguage: "Hindi",
      deviceType: "website",
    };

    await PagesIndex.apiPostHandler(
      PagesIndex.Api.GET_COUPON_LIST,
      payload,
      userToken
    ).then((response) => {
      setPublicCouponList(response?.data);
      dispatch(PagesIndex.hideLoader());
    });
  };

  useEffect(() => {
    fetchCouponList();
  }, [regionId]);

  const CouponCartApi = async (couponArr, isAutoApply, isCoupan) => {
    // dispatch(PagesIndex.showLoader());
    // const totalFoodAmount = selectedFood
    //   .map((item) => {
    //     const truncatedPrice = Math.trunc(item.itemPrice * 100) / 100;
    //     return truncatedPrice * item.quantity;
    //   })
    //   // .map((item) => (Math.floor(item.itemPrice * 100) / 100).toFixed(2) * item.quantity)
    //   .reduce((a, b) => a + b, 0);
    const truncateToTwo = (num) => {
      return parseFloat((Math.trunc(num * 100) / 100).toFixed(2));
    };

    const totalFoodAmount = truncateToTwo(
      selectedFood
        .map((item) => truncateToTwo(item?.itemPrice) * item?.quantity)
        .reduce((a, b) => a + b, 0)
    );

    // console.log({ totalFoodAmount });
    const totalFoodCount = selectedFood
      .map((item) => item.quantity)
      .reduce((a, b) => a + b, 0);

    const coupanPayload = {
      // cinema_id: "0001",
       cinema_id:  stateData?.cinemaData?.cinemaData?._id,
      area_category_code: stateData?.cinemaData?.selectedAreaData?.areaCatCode,
      show_date_time:
        stateData?.cinemaData?.showDate +
        " " +
        stateData?.cinemaData?.selectedShowTiming,
      number_of_tickets: stateData?.cinemaData?.selectedSeats.length,
      customer_name:
        stateData?.userDetails?.firstName +
        " " +
        stateData?.userDetails?.lastName,
      filme_ho_code: stateData?.cinemaData?.movieData?.filmCode,
      coupan_code: appliedCoupon,
      sale_channel: 1234,
      total_ticket_amount: stateData?.cinemaData?.ticketPriceDetails?.total,
      total_concession_amount: totalFoodAmount,
      total_inventory: totalFoodCount,
      work_station_code: "W001",
      user_id: "005",
      post_date_time: PagesIndex.moment().format("YYYY-MM-DD HH:mm:ss"),
      type: "VOUCHER",
      customer_number: userDetails?.mobileNumber || "",
    };

    // const ticketBasePriceFromVista = stateData?.cinemaData?.ticketPriceDetails?.total -  stateData?.cinemaData?.ticketPriceDetails?.tax1 - stateData?.cinemaData?.ticketPriceDetails?.tax2

    // console.log(ticketCart?.totalAfterDiscount , ":ticketCart?.totalAfterDiscount", ticketBasePriceFromVista , stateData?.cinemaData?.ticketPriceDetails)
    let Payload = {
      isCoupan: isCoupan,
      couponDetails: coupanPayload,
      coupons: appliedCoupon,
      selectedFood: selectedFood,
      ticketTotal: stateData?.cinemaData?.ticketPriceDetails?.total,
      // ticketTotal: ticketCart?.total,
      fnbprice: snackPrice ? snackPrice : 0,
      cityId: regionId,
      cinemaObjectId: stateData?.cinemaData?.cinemaData?._id,
      movieLanguage: stateData?.cinemaData?.movieData?.languages,
      autoApply: isAutoApply,
      transId: stateData?.cinemaData?.transactionId,
      deviceType: "website",
      userTicketSpentAmount: Number(ticketCart?.totalAfterDiscount.toFixed(2)),
      quantity: stateData?.cinemaData?.selectedSeats.length,
      rewardCoins: appliedRewardPoints,
    };
    //     const Payload={
    //   "autoApply": false,
    //   "cinemaObjectId": "680764c911afc8f0e14fbef7",
    //   "cityId": "65c1da3d65d1f285d00320d0",
    //   "coupons": [
    //     "TEST1U6RQ"
    //   ],
    //   "couponsDetails": {
    //     "area_category_code": "0000000005",
    //     "cinema_id": "680764c911afc8f0e14fbef7",
    //     "coupan_code": [
    //       "TEST1U6RQ"
    //     ],
    //     "customer_name": "Yash Nandha",
    //     "customer_number": "+919510473354",
    //     "filme_ho_code": "CN95HO00000044",
    //     "number_of_tickets": 2,
    //     "post_date_time": "2025-05-28 13:02:30",
    //     "sale_channel": 1234,
    //     "show_date_time": "2025-05-28 15:25 PM",
    //     "total_concession_amount": 1050.462,
    //     "total_inventory": 5,
    //     "total_ticket_amount": 340,
    //     "type": "VOUCHER",
    //     "user_id": "005",
    //     "work_station_code": "W001"
    //   },
    //   "deviceType": "website",
    //   "fnbprice": "1050",
    //   "movieLanguage": "Hindi",
    //   "quantity": 2,
    //   "ticketTotal": "340",
    //   "transId": "20000000716",
    //   "userFNBSpentAmount": 1050,
    //   "userTicketSpentAmount": 340
    // }
 const encryptedPayload = await crypt("testText123",JSON.stringify(Payload))
    await PagesIndex.apiPostHandler(
      PagesIndex.Api.COUPON_CART,
      // Payload,
    { data: encryptedPayload},
      userToken
    )
      .then((response) => {
        setAutoApply(false);

        if (response.status == 403) {
          PagesIndex.toast.error(response?.message);
        }

        let couponsList = [];

        let isApplied = false;

        response?.data?.ticketCart?.coupons.forEach((element) => {
          // let alreadyExis = couponArr.includes(element.couponTitle);
          // if (!alreadyExis) {
          couponsList.push(element);
          if (coupenCode == element.couponTitle || coupenCode == element) {
            isApplied = true;
          }
          // }
        });

        response?.data?.foodCart?.coupons.forEach((element) => {
          // let alreadyExis = couponArr.includes(element.couponTitle);
          // if (!alreadyExis) {
          couponsList.push(element.couponTitle);
          if (coupenCode == element.couponTitle) {
            isApplied = true;
          }
          // }
        });

        if (coupenCode != "" && isApplied == false) {
          PagesIndex.toast.error(response?.message);
        }
        if (coupenCode != "" && isApplied == true) {
          PagesIndex.toast.success(response?.message);
        }
        setCoupenCode("");

        setTotalAppliedCoupon(couponsList);

        // let symDifference = couponsList
        //   .filter((x) => !appliedCoupon.includes(x))
        //   .concat(appliedCoupon.filter((x) => !couponsList.includes(x)));

        // coupons
        // console.log(response?.data?.ticketCart, ":response?.data?.ticketCart");
        // console.log(response?.data?.foodCart, ":response?.data?.foodCart");
        setCouponCartDetails(response.data);
        setTicketCart(response?.data?.ticketCart);
        setFoodCart(response?.data?.foodCart);
        setConvenienceFeesDetails(response?.data?.convenienceFeesObject);

        dispatch(PagesIndex.hideLoader());
      })
      .catch((error) => {
        console.log(error);
        dispatch(PagesIndex.hideLoader());
      })
      .finally(() => {
        setIsRemovingCoupon((prev) => ({ ...prev, isRemoving: false }));
      });
  };

  useEffect(() => {
    // console.log(appliedCoupon, ":appliedCoupon184");
    setExpanded("panel1");
    CouponCartApi(appliedCoupon, autoApply, false);
  }, [selectedFood, snackPrice]);
  // console.log(selectedFood, ":selectedFood");
  useEffect(() => {
    // console.log(appliedCoupon, ":appliedCoupon184");
    setExpanded("panel1");
    CouponCartApi(appliedCoupon, autoApply, true);
  }, [appliedCoupon]);

  useEffect(() => {
    CouponCartApi(appliedCoupon, autoApply, false);
  }, [appliedRewardPoints]);

  // console.log(appliedCoupon, ":appliedCoupon");
  const handleRemoveCoupon = async (coupon) => {
    // console.log(coupon, ":coupon");
    if (isRemovingCoupon?.isRemoving) return;

    try {
      // console.log("Removing coupon:", coupon);
      await handleRollbackCoupon(coupon, stateData?.cinemaData?.transactionId);
      const remainingCoupon = totalAppliedCoupon?.filter(
        (item) => item !== coupon
      );

      setAppliedCoupon(remainingCoupon);
    } catch (error) {
      console.error("Error removing coupon:", error);
    }
  };

  const handleApplyCoupon = async (
    couponCode,
    autoApply,
    fromText,
    couponType
  ) => {
    // appliedCoupon.push(couponCode);
    setIsRemovingCoupon({ couponCode: couponCode, isRemoving: true });
    if (!totalAppliedCoupon.includes(couponCode)) {
      let newCouponAdded = [...totalAppliedCoupon, couponCode];
      setAppliedCoupon(newCouponAdded);

      // console.log(selectedFood, "FOOD");

      const totalFoodAmount = selectedFood
        .map((item) => Number(item.itemPrice.toFixed(2)) * item.quantity)
        .reduce((a, b) => a + b, 0);
      const totalFoodCount = selectedFood
        .map((item) => item.quantity)
        .reduce((a, b) => a + b, 0);

      const coupanPayload = {
        // cinema_id: "0001",
        cinema_id:  stateData?.cinemaData?.cinemaData?._id,
        area_category_code:
          stateData?.cinemaData?.selectedAreaData?.areaCatCode,
        show_date_time:
          stateData?.cinemaData?.showDate +
          " " +
          stateData?.cinemaData?.selectedShowTiming,
        number_of_tickets: stateData?.cinemaData?.selectedSeats.length,
        customer_name:
          stateData?.userDetails?.firstName +
          " " +
          stateData?.userDetails?.lastName,
        filme_ho_code: stateData?.cinemaData?.movieData?.filmCode,
        coupan_code: couponCode,
        sale_channel: 1234,
        total_ticket_amount: stateData?.cinemaData?.ticketPriceDetails?.total,
        total_concession_amount: totalFoodAmount,
        total_inventory: totalFoodCount,
        work_station_code: "W001",
        user_id: "005",
        post_date_time: PagesIndex.moment().format("YYYY-MM-DD HH:mm:ss"),
        type: "VOUCHER",
         customer_number: userDetails?.mobileNumber || "",
      };

      // const resp = await PagesIndex.apiPostHandler(
      //   PagesIndex.Api.APPLY_COUPON,
      //   coupanPayload,
      //   userToken
      // );

      // if (resp.data.blnSuccess.includes("false")) {
      //   PagesIndex.toast.error(resp.data.strException[0]);
      // }
      // if (resp.data.blnSuccess.includes("true")) {
      //   PagesIndex.toast.success(resp.data.strMessage[0]);
      // }

      // if(resp.data.blnSuccess.includes('false')){
      //   PagesIndex.toast.error(resp.data.strException)
      // }

      // if(resp.data.blnSuccess[0] == "true"){
      //   PagesIndex.toast.success("Coupon applied successfully")
      // }
    } else {
      PagesIndex.toast.error("Already coupon applied");
      setCoupenCode("");
    }
    setCouponDrawer(false);
  };


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

  const displayRazorpay = async (transactionId) => {
    setCoupenCodeError("");

    // Step 1 — Create Razorpay order on backend
    const urlencoded = new URLSearchParams();
    const payLoadString = `${stateData?.cinemaData?.transactionId}|${
      stateData?.cinemaData?.cinemaData?.cinemaId
    }|${stateData?.cinemaData?.selectedSessionId}|${userDetails?._id}|${
      stateData?.cinemaData?.selectedAreaData?.areaCatCode
    }|${stateData?.cinemaData?.selectedSeats?.length}|${
      stateData?.cinemaData?.pGroupCode
    }|${selectedFood.length ? true : false}|${appliedRewardPoints}|Web`;
    urlencoded.append("id", crypt("testText123", payLoadString));

    dispatch(PagesIndex.showLoader());
    const orderRes = await PagesIndex.apiPostHandler(
      PagesIndex.Api.INIT_PAYMENT_HDFC,
      urlencoded
    ).catch(() => null);
    dispatch(PagesIndex.hideLoader());
    console.log(orderRes, ":orderRes")

    // --- CCAvenue path: backend returns raw HTML form ---
    if (typeof orderRes === "string") {
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

      if (orderRes?.status !== 503) {
        PagesIndex.toast.error(orderRes?.message || "Something went wrong");
      }
      return;
    }

    const {
      razorpayOrderId,
      amount,
      keyId,
      prefill,
      transId,
      cinemaId,
      sessionId,
      userId,
    } = orderRes.data;
    console.log(orderRes.data, ":orderRes.data")

    // Step 2 — Load Razorpay checkout script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      PagesIndex.toast.error("Failed to load payment gateway. Please try again.");
      return;
    }

    // Step 3 — Open Razorpay popup
    const options = {
      key: keyId,
      amount,
      currency: "INR",
      name: "Connplex Smart Theatre",
      description: "Movie Ticket Booking",
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
        console.log(paymentResult , ":paymentResult")
        // Step 4 — Verify payment with backend
        dispatch(PagesIndex.showLoader());
        const verifyPayload = new URLSearchParams();
        verifyPayload.append("razorpay_payment_id", paymentResult.razorpay_payment_id);
        verifyPayload.append("razorpay_order_id", paymentResult.razorpay_order_id);
        verifyPayload.append("razorpay_signature", paymentResult.razorpay_signature);
        verifyPayload.append("transId", transId);
        verifyPayload.append("cinemaId", cinemaId);
        verifyPayload.append("sessionId", sessionId);
        verifyPayload.append("userId", userId);
        verifyPayload.append("appliedRewardPoints", appliedRewardPoints);
        verifyPayload.append("paymentStatus", "success");

        const verifyRes = await PagesIndex.apiPostHandler(
          PagesIndex.Api.RAZORPAY_VERIFY_PAYMENT,
          verifyPayload
        ).catch(() => null);
        dispatch(PagesIndex.hideLoader());

        console.log(verifyRes, ":verifyRes")
        if (verifyRes?.redirectUrl) {
          navigate(verifyRes.redirectUrl);
        } else {
          navigate(`/transaction-failed?transId=${transId}`);
        }
      },

      modal: {
        ondismiss: () => {
          navigate(`/transaction-failed?transId=${transId}`);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      navigate(`/transaction-failed?transId=${transId}`);
    });
    rzp.open();
  };

  const addConssesionForItems = (transactionId) => {
    setCoupenCodeError("");
    dispatch(PagesIndex.showLoader());
    const payLoadString = `|${selectedFood?.length}${selectedFood
      ?.map((detail) => `|${detail.itemId}|${detail.quantity}|-1`)
      .join("")}|`;
    const selectedFoodList = selectedFood?.map((data) => {
      return {
        itemId: data?.itemId,
        name: data?.itemDescription,
        quantity: data?.quantity,
        price: parseFloat(parseFloat(data?.itemPrice).toFixed(2)) * data?.quantity
      };
    });
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("cinemaId", stateData?.cinemaData?.cinemaData?.cinemaId);
    urlEncoded.append("strTransId", stateData?.cinemaData?.transactionId);
    urlEncoded.append("strItemsOrder", payLoadString);
    urlEncoded.append("itemData", JSON.stringify(selectedFoodList));

// const payload = crypt("testText123", urlEncoded.toString());
    // PagesIndex.apiPostHandler(PagesIndex.Api.ADD_ITEMS, {data: payload})
    PagesIndex.apiPostHandler(PagesIndex.Api.ADD_ITEMS, urlEncoded)
      .then(async (res) => {
        dispatch(PagesIndex.hideLoader());
        if (res?.status === 200) {
          displayRazorpay(stateData?.cinemaData?.transactionId);
        } else {
          PagesIndex.toast.error("Something went wrong");
        }
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
      });
  };

  return (
    <>
      {" "}
      {!couponDrawer ? (
        <Index.Box className="summary-box-wrapper">
          <Index.Typography
            variant="p"
            component="p"
            className="summary-main-title"
          >
            Your Booking
          </Index.Typography>
          <Index.Box className="summary-box-inner remover-booking-scroll">
            <Index.Box className="booking-summary">
              <Index.Box className="selected-movie summary-box-row">
                <img
                  src={
                    stateData?.cinemaData?.movieData?.poster
                      ? PagesIndex.IMAGES_API_ENDPOINT +
                        "/" +
                        stateData?.cinemaData?.movieData?.poster
                      : PagesIndex.Png.NoImage
                  }
                  width="1280"
                  height="80"
                  alt="movie detail"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = PagesIndex.Png.NoImage;
                  }}
                />
                <Index.Typography>
                  <Index.Typography className="summary-title">
                    {stateData?.cinemaData?.movieData?.name}
                  </Index.Typography>
                  <Index.Typography className="summary-subtitle">
                    ({" "}
                    {stateData?.cinemaData?.movieData?.category &&
                      `${stateData?.cinemaData?.movieData?.category?.replace(
                        ", ",
                        " | "
                      )} |`}
                    {stateData?.cinemaData?.movieData?.censorRating &&
                      stateData?.cinemaData?.movieData?.censorRating}{" "}
                    )
                  </Index.Typography>
                </Index.Typography>
              </Index.Box>
              <Index.Box className="selected-seat summary-box-row">
                <PagesIndex.SeatIcon selected />
                <Index.Typography
                  variant="span"
                  component="span"
                  className="summary-title"
                >
                  {stateData?.cinemaData?.selectedSeats.length} Seats{" "}
                  {`(${stateData?.cinemaData?.selectedSeats
                    ?.toString()
                    ?.replaceAll(",", ", ")})`}
                </Index.Typography>
              </Index.Box>
              <Index.Box className="selected-cinema summary-box-row">
                <Index.FmdGoodIcon />
                <Index.Box>
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="summary-title"
                  >
                    {stateData?.cinemaData?.cinemaData?.displayName}
                  </Index.Typography>
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="summary-subtitle"
                  >
                    {stateData?.cinemaData?.cinemaData?.address}
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
              <Index.Box className="selected-time summary-box-row">
                <Index.WatchLaterIcon />
                <Index.Typography
                  variant="span"
                  component="span"
                  className="summary-title"
                >
                  {PagesIndex.moment(location?.state?.showDate).format(
                    "DD/MM/YYYY"
                  ) +
                    " " +
                    stateData?.cinemaData?.selectedShowTiming}
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box>

          {totalAppliedCoupon?.length < 2 && (
            <>
              <Index.Box className="apply-promocode-box">
                <Index.TextField
                  fullWidth
                  id="promoCode"
                  type="text"
                  className="form-control"
                  placeholder="Enter your Promocode"
                  name="coupencode"
                  value={coupenCode}
                  disabled={ticketCart?.coupons?.length > 0}
                  onChange={(e) => {
                    const newValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");

                    if (newValue.length <= 12) {
                      setCoupenCode(newValue);
                    }
                  }}
                />

                <PagesIndex.Button
                  primary
                  disabled={
                    ticketCart?.coupons?.length > 0 ||
                    isRemovingCoupon?.isRemoving
                  }
                  onClick={() => {
                    if (coupenCode == "") {
                      setCoupenCodeError("Please enter promocode");
                    } else {
                      setCoupenCodeError("");
                      setCoupenCode(coupenCode);
                      handleApplyCoupon(coupenCode, "", "fromText", "");
                    }
                  }}
                >
                  {ticketCart?.coupons?.length > 0 ? "Applied" : "Apply"}
                </PagesIndex.Button>
              </Index.Box>
              <p style={{ color: "red" }}>
                {!coupenCode && coupenCodeError ? coupenCodeError : "\u00A0"}
              </p>

              {/* <Index.Box className="summary-box-button margin-box">
                <PagesIndex.Button
                  secondary
                  className="book-now-btn cus-icon-btn"
                  onClick={() => {
                    setCouponDrawer(true);
                  }}
                  endIcon={<Index.ArrowForwardIosIcon />}
                >
                  Apply Coupon
                </PagesIndex.Button>
              </Index.Box> */}
            </>
          )}
          {ticketCart?.coupons?.length > 0 &&
            ticketCart?.coupons?.map((item, index) => {
              return (
                <>
                  <Index.Box key={index} className="coupon-applied-box">
                    <Index.Typography className="coupon-applied-text">
                      {`'${item}' applied`}
                    </Index.Typography>
                    <Index.Typography
                      className="remove-text image-cursor"
                      onClick={() => handleRemoveCoupon(item)}
                    >
                      Remove
                    </Index.Typography>
                  </Index.Box>
                </>
              );
            })}

          {foodCart?.coupons?.length > 0 &&
            foodCart?.coupons?.map((item, index) => {
              return (
                <>
                  <Index.Box key={index} className="coupon-applied-box">
                    <Index.Typography className="coupon-applied-text">
                      {`'${item.couponTitle}' applied`}
                    </Index.Typography>
                    <Index.Typography
                      className="remove-text image-cursor"
                      onClick={() => handleRemoveCoupon(item)}
                    >
                      Remove
                    </Index.Typography>
                  </Index.Box>
                </>
              );
            })}

          {/* Redeem Points trigger */}
          {availableCoins > 0 && (
            <Index.Box className="redeem-points-trigger-wrap">
              <button
                className={`redeem-points-trigger-btn${appliedRewardPoints > 0 ? " applied" : ""}`}
                onClick={() => {
                  if (appliedRewardPoints > 0) {
                    setAppliedRewardPoints(0);
                    setPointsToUse(0);
                  } else {
                    setPointsToUse(0);
                    setRewardModalOpen(true);
                  }
                }}
              >
                <span className="rp-trigger-left">
                  <Index.MonetizationOnIcon className="rp-coin-icon" />
                  <span className="rp-trigger-text">
                    {appliedRewardPoints > 0
                      ? "Reward Points Applied"
                      : "Redeem Reward Points"}
                  </span>
                </span>
                <span className="rp-trigger-right">
                  {appliedRewardPoints > 0 ? (
                    <span className="rp-discount-badge">{pointsToUse.toLocaleString()} pts </span>
                  ) : (
                    <span className="rp-pts-label">{availableCoins.toLocaleString()} pts</span>
                  )}
                  {appliedRewardPoints > 0 ? (
                    <Index.ClearIcon className="rp-clear-icon" />
                  ) : (
                    <span className="rp-chevron">›</span>
                  )}
                </span>
              </button>
            </Index.Box>
          )}

          <Index.Box className="payment-scroll-ticket cus-scrollbar">
            <Index.Box className="payment-summary ">
              <Index.Box className="payment-ticket-subtotal">
                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label"
                  >
                    <Index.Typography variant="p" component="p">
                      Tickets
                    </Index.Typography>
                    {/* <Index.Typography variant="p" component="p">
                      ( {ticketQuantity} x ₹
                      {(ticketCart?.basePrice / ticketQuantity)?.toFixed(2)})
                    </Index.Typography> */}
                    <Index.Typography variant="p" component="p">
                      {ticketQuantity} x {stateData?.cinemaData?.ticketType}
                    </Index.Typography>
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-price"
                  >
                    {parseFloat(ticketCart?.ticketTotal).toFixed(2) !== "NaN"
                      ? `₹${parseFloat(ticketCart?.ticketTotal).toFixed(2)}`
                      : 0.0}
                  </Index.Typography>
                </Index.Box>

                {selectedFood?.length > 0 && (
                  <Index.Box className="selected-snacks-box">
                    <Index.Accordion
                      expanded={expanded === "panel1"}
                      onChange={() => {
                        handleExpanded("panel1");
                        handleFoodAccordionChange();
                      }}
                    >
                      <Index.AccordionSummary
                        // expandIcon={<Index.ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        {/* <Index.Typography
                          variant="span"
                          component="span"
                          className="summary-title"
                        >
                          Food and Beverages
                        </Index.Typography> */}

                        <Index.Box className="accro-down-content">
                          <Index.Typography className="acrro-title-tax-details">
                            Food and Beverages
                          </Index.Typography>
                          <Index.Box className="down-up-acrro-icon">
                            {isFoodAccordionOpen ? (
                              <Index.ExpandLessIcon />
                            ) : (
                              <Index.ExpandMoreIcon />
                            )}
                          </Index.Box>
                        </Index.Box>
                        <Index.Typography style={{ marginLeft: "auto" }}>
                          ₹{parseFloat(foodCart?.fnbTotal).toFixed(2)}
                        </Index.Typography>
                      </Index.AccordionSummary>
                      <Index.AccordionDetails>
                        {isFoodAccordionOpen &&
                          selectedFood?.map((item) => {
                            const itemPrice = Number(
                              (Math.trunc(item.itemPrice * 100) / 100).toFixed(
                                2
                              )
                            );
                            // const itemPrice = (Math.floor(item.itemPrice * 100) / 100).toFixed(2)
                            return (
                              <Index.Box
                                className="selected-snacks summary-box-row"
                                key={item?.index}
                              >
                                <img
                                  src={
                                    item?.poster
                                      ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                      : PagesIndex.Jpg.snackImg1
                                  }
                                  width="233"
                                  height="173"
                                  alt="snacks"
                                />
                                <Index.Box className="snacks-summary">
                                  <Index.Typography
                                    variant="p"
                                    component="p"
                                    className="snacks-desc"
                                  >
                                    {item?.itemDescription}
                                  </Index.Typography>
                                  <Index.Typography
                                    variant="p"
                                    component="p"
                                    className="snacks-price"
                                  >
                                    ₹{(itemPrice * item?.quantity).toFixed(2)}
                                    {/* {parseFloat(
                                     (item.itemPrice).toFixed(2) * item?.quantity
                                    ).toFixed(2)} */}
                                  </Index.Typography>
                                  <Index.Box className="selected-snacks-bottom">
                                    <Index.Box className="snacks-qty">
                                      <PagesIndex.Button
                                        onClick={() => {
                                          handleRollbackCoupon(
                                            ticketCart?.coupons?.[0] || "",
                                            stateData?.cinemaData?.transactionId
                                          );
                                          handleAddRemoveItem(
                                            item?.index,
                                            -1,
                                            0,
                                            item?.itemId
                                          );
                                        }}
                                      >
                                        -
                                      </PagesIndex.Button>
                                      <Index.Typography
                                        variant="span"
                                        component="span"
                                        className="snacks-input"
                                      >
                                        {item?.quantity}
                                      </Index.Typography>
                                      <PagesIndex.Button
                                        onClick={() => {
                                          handleRollbackCoupon(
                                            ticketCart?.coupons?.[0] || "",
                                            stateData?.cinemaData?.transactionId
                                          );
                                          handleAddRemoveItem(
                                            item?.index,
                                            1,
                                            10,
                                            item?.itemId
                                          );
                                        }}
                                      >
                                        +
                                      </PagesIndex.Button>
                                    </Index.Box>
                                    <Index.Button
                                      className="snacks-remove"
                                      onClick={() => {
                                        handleRollbackCoupon(
                                          ticketCart?.coupons?.[0] || "",
                                          stateData?.cinemaData?.transactionId
                                        );
                                        handleRemoveItem(item?.index);
                                      }}
                                    >
                                      Remove
                                    </Index.Button>
                                  </Index.Box>
                                </Index.Box>
                              </Index.Box>
                            );
                          })}
                      </Index.AccordionDetails>
                    </Index.Accordion>
                  </Index.Box>
                )}
                {ticketCart?.membershipDiscount ||
                foodCart?.membershipDiscount ? (
                  <Index.Box className="payment-summary-row">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label"
                    >
                      <Index.Typography variant="p" component="p">
                        Membership Discount:
                      </Index.Typography>
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-price"
                    >
                      ₹
                      {ticketCart?.membershipDiscount ||
                      foodCart?.membershipDiscount
                        ? Number(
                            +ticketCart?.membershipDiscount +
                              +foodCart?.membershipDiscount
                          )?.toFixed(2)
                        : 0.0}
                      {console.log(
                        ticketCart.membershipDiscount,
                        foodCart.membershipDiscount,
                        "membershipDiscount"
                      )}
                    </Index.Typography>
                  </Index.Box>
                ) : (
                  ""
                )}


                {appliedDiscount > 0 ? (
                  <Index.Box className="payment-summary-row">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label"
                    >
                      <Index.Typography variant="p" component="p">
                        Reward Discount:
                      </Index.Typography>
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-price"
                    >
                     ₹{appliedDiscount.toFixed(2)}
                    </Index.Typography>
                  </Index.Box>
                ) : (
                  ""
                )}

                {ticketCart?.discountAmount || foodCart?.discountAmount ? (
                  <Index.Box className="payment-summary-row">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label"
                    >
                      <Index.Typography variant="p" component="p">
                        Discount:
                      </Index.Typography>
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-price"
                    >
                      ₹
                      {ticketCart?.discountAmount || foodCart?.discountAmount
                        ? Number(
                            +ticketCart?.discountAmount +
                              +foodCart?.discountAmount
                          )?.toFixed(2)
                        : 0.0}
                    </Index.Typography>
                  </Index.Box>
                ) : (
                  ""
                )}
          

                <Index.Box className="payment-summary-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-label"
                  >
                    <Index.Typography variant="p" component="p">
                      Sub Total:
                    </Index.Typography>
                  </Index.Typography>

                  <Index.Typography
                    variant="p"
                    component="p"
                    className="payment-summary-price"
                  >
                    ₹{counponCartDetails?.finalAmount > 0 ? parseFloat(Number(counponCartDetails?.finalAmount).toFixed(2) - Number(convenienceFeesDetails?.total).toFixed(2))?.toFixed(2) : 0.00}
                   
                    {/* {ticketCart?.total + foodCart?.total
                      ? parseFloat(
                          ticketCart?.total +
                            foodCart?.total -
                            Number(counponCartDetails?.totalDiscount).toFixed(2) - Number(appliedDiscount).toFixed(2)
                        )?.toFixed(2)
                      : 0.0} */}
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
             

              <Index.Box className="payment-summary-row-tax">
                <Index.Box className="selected-snacks-box">
                  {/* Taxes & Fees Accordion */}
                  <Index.Accordion onChange={handleTotalAccordionChange}>
                    <Index.AccordionSummary
                      // expandIcon={<Index.ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Index.Box className="accro-down-content">
                        <Index.Typography className="acrro-title-tax-details">
                          Taxes & Fees
                        </Index.Typography>
                        <Index.Box className="down-up-acrro-icon">
                          {isTotalAccordionOpen ? (
                            <Index.ExpandLessIcon />
                          ) : (
                            <Index.ExpandMoreIcon />
                          )}
                        </Index.Box>
                      </Index.Box>
                      <Index.Typography style={{ marginLeft: "auto" }}>
                        ₹
                        {convenienceFeesDetails?.total
                          ? parseFloat(convenienceFeesDetails?.total).toFixed(2)
                          : "0.00"}
                      </Index.Typography>
                    </Index.AccordionSummary>
                    <Index.AccordionDetails className="acrro-details-tax">
                      <Index.Grid
                        container
                        justifyContent="space-between"
                        className="space-accro-bottom"
                      >
                        <Index.Typography
                          variant="body2"
                          className="acrro-title-tax-details"
                        >
                          Convenience Fee <br /> (SAC CODE: 995212)
                        </Index.Typography>
                        <Index.Typography
                          variant="body2"
                          className="acrro-title-taxamount"
                        >
                          ₹
                          {convenienceFeesDetails?.convenienceFees
                            ? parseFloat(
                                convenienceFeesDetails?.convenienceFees
                              ).toFixed(2)
                            : "0.00"}
                        </Index.Typography>
                      </Index.Grid>
                      <Index.Grid
                        container
                        justifyContent="space-between"
                        className="space-accro-bottom"
                      >
                        <Index.Typography
                          variant="body2"
                          className="acrro-title-tax-details"
                        >
                          GST
                        </Index.Typography>
                        <Index.Typography
                          variant="body2"
                          className="acrro-title-taxamount"
                        >
                          ₹
                          {convenienceFeesDetails?.gst
                            ? parseFloat(convenienceFeesDetails?.gst).toFixed(2)
                            : "0.00"}
                        </Index.Typography>
                      </Index.Grid>
                      <Index.Grid
                        container
                        justifyContent="space-between"
                        className="space-accro-bottom"
                      >
                        <Index.Typography
                          variant="body2"
                          className="acrro-title-tax-details"
                        >
                          GST Number:
                        </Index.Typography>
                        <Index.Typography
                          variant="body2"
                          className="acrro-title-taxamount"
                        >
                          {stateData?.cinemaData?.cinemaData?.GSTNumber}
                        </Index.Typography>
                      </Index.Grid>
                    </Index.AccordionDetails>
                  </Index.Accordion>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        

          <Index.Box className="total-payment-row">
            <Index.Typography variant="p" component="p" className="total-payment">
              Total Amount
            </Index.Typography>
            <Index.Typography variant="p" component="p" className="total-payment">
              ₹{counponCartDetails?.finalAmount > 0
                ? parseFloat(counponCartDetails?.finalAmount).toFixed(2)
                : 0.0}
            </Index.Typography>
          </Index.Box>
          <Index.Box className="summary-box-button">
            <PagesIndex.Button
              primary
              className="book-now-btn"
              onClick={() => {
                if (userDetails?.mobileNumber == null) {
                  setOpenMobileModal(true);
                } else if (selectedFood?.length) {
                  addConssesionForItems(stateData?.cinemaData?.transactionId);
                } else {
                  displayRazorpay(stateData?.cinemaData?.transactionId);
                }
              }}
              disabled={!bookingSession}
              // onClick={() => {

              //     setOpenMobileModal(true);
              //   } else if (selectedFood?.length) {
              //     addConssesionForItems(stateData?.cinemaData?.transactionId);
              //   } else {
              //     displayRazorpay(stateData?.cinemaData?.transactionId);
              //   }
              // }}
            >
              Proceed to Pay
            </PagesIndex.Button>
          </Index.Box>
        </Index.Box>
      ) : (
        <Index.Box className="summary-box-wrapper">
          <Index.Box className="apply-coupon-flex-box cus-margin">
            <img
              src={PagesIndex.Png.backArrow}
              onClick={() => {
                setCouponDrawer(false);
              }}
              className="image-cursor"
            />

            <Index.Typography className="apply-promocode-text">
              Apply Coupon
            </Index.Typography>
          </Index.Box>

          <Index.Box className="summary-box-inner cus-scrollbar">
            {publicCouponList?.length ? (
              publicCouponList?.map((row) => {
                const isCouponApplied = totalAppliedCoupon?.includes(
                  row.couponTitle
                );
                const checkSpentAmount = !(
                  ticketCart.totalAfterDiscount >
                    row?.assignCoupon.rangeOfSpent.spentForm &&
                  ticketCart.totalAfterDiscount <
                    row?.assignCoupon.rangeOfSpent.spentTo
                );
                return (
                  <>
                    <Index.Box className="card-container-flex coupon-show-fixed-snacks">
                      <Index.Box className="card-left-side">
                        <Index.Typography className="offer-text">
                          Flat{" "}
                          {row?.discountType == "flat"
                            ? `₹${row?.discount}`
                            : `${row?.discount}%`}{" "}
                          off
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="card-right-side snacks-card-main">
                        <Index.Box className="card-right-side-top">
                          <Index.Box className="card-right-side-top-flex">
                            <Index.Typography className="coupon-code">
                              {row?.couponTitle}
                            </Index.Typography>

                            <Index.Button
                              className="apply-btn image-cursor apply-btn-snack btn-snack"
                              onClick={() => {
                                handleApplyCoupon(
                                  row?.couponTitle,
                                  "",
                                  "",
                                  row?.couponType
                                );
                              }}
                              disabled={isCouponApplied || checkSpentAmount}
                            >
                              <span>
                                {isCouponApplied ? "Applied" : "Apply"}
                              </span>
                            </Index.Button>
                          </Index.Box>
                          <Index.Box className="card-right-top-bottom-flex">
                            <Index.Typography className="coupon-description">
                              Save{" "}
                              {row?.discountType == "flat"
                                ? `₹${row?.discount}`
                                : `${row?.discount}%`}{" "}
                              on total
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="section-line"></Index.Box>
                        <Index.Box className="card-right-side-bottom">
                          <Index.Typography className="coupon-right-side-description">
                            {row?.couponDescription}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </>
                );
              })
            ) : (
              <Index.Box className="no-found-img-box">
                No Coupon Available
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      )}
      {/* Redeem Reward Points Modal */}
      <Index.Modal
        open={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        className="reward-redeem-modal"
      >
        <Index.Box className="reward-modal-inner">
          {/* Header */}
          <Index.Box className="reward-modal-header">
            <Index.Box className="reward-redeem-title-row">
              <Index.MonetizationOnIcon className="reward-coin-icon" />
              <Index.Typography className="reward-redeem-title">
                Redeem Reward Points
              </Index.Typography>
            </Index.Box>
            <Index.Box className="reward-pts-badge">
              {availableCoins.toLocaleString()} pts available
            </Index.Box>
          </Index.Box>

          {/* Subtitle */}
          <Index.Typography className="reward-redeem-subtitle">
            {conversionPoints} points = ₹{conversionValue}&nbsp;·&nbsp;Max{" "}
            {maxRedemptionCap.toLocaleString()} points per transaction
          </Index.Typography>

          {/* Slider + Input */}
          <Index.Box className="reward-slider-row">
            <Index.Box className="reward-slider-wrap">
              <input
                type="range"
                className="reward-range-slider"
                value={pointsToUse}
                min={0}
                max={sliderMax || 1}
                step={1}
                onChange={(e) => setPointsToUse(Number(e.target.value))}
                style={{
                  "--progress": `${sliderMax > 0 ? (pointsToUse / sliderMax) * 100 : 0}%`,
                }}
              />
              <Index.Box className="reward-slider-labels">
                <span>0</span>
                <span>{sliderMax.toLocaleString()}</span>
              </Index.Box>
            </Index.Box>

            <Index.Box className="reward-input-box">
              <span className="reward-input-label">POINTS TO USE</span>
              <input
                className="reward-points-input"
                value={pointsToUse}
                onChange={(e) => {
                  const val = Math.min(
                    Math.max(0, Number(e.target.value.replace(/\D/g, ""))),
                    sliderMax
                  );
                  setPointsToUse(val);
                }}
                inputMode="numeric"
              />
            </Index.Box>
          </Index.Box>

          {/* Stats row */}
          <Index.Box className="reward-stats-row">
            <Index.Box className="reward-stat-item">
              <Index.Typography className="reward-stat-label">POINTS USED</Index.Typography>
              <Index.Typography className="reward-stat-value">
                {pointsToUse.toLocaleString()}
              </Index.Typography>
            </Index.Box>
            <Index.Box className="reward-stat-divider" />
            <Index.Box className="reward-stat-item">
              <Index.Typography className="reward-stat-label">DISCOUNT</Index.Typography>
              <Index.Typography className="reward-stat-value reward-discount-value">
                ₹{previewDiscount}
              </Index.Typography>
            </Index.Box>
            <Index.Box className="reward-stat-divider" />
            <Index.Box className="reward-stat-item">
              <Index.Typography className="reward-stat-label">REMAINING</Index.Typography>
              <Index.Typography className="reward-stat-value">
                {(availableCoins - pointsToUse).toLocaleString()}
              </Index.Typography>
            </Index.Box>
          </Index.Box>

          {/* Action buttons */}
          <Index.Box className="reward-modal-actions">
            <button
              className="reward-modal-btn cancel"
              onClick={() => {
                setPointsToUse(appliedRewardPoints);
                setRewardModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              className="reward-modal-btn apply"
              onClick={() => {
                setAppliedRewardPoints(pointsToUse);
                setRewardModalOpen(false);
              }}
            >
              {pointsToUse > 0 ? "Apply" : "Skip"}
            </button>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
};

export default BookingCart;
