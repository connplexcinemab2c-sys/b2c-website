import React, { useState, useEffect, useRef } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PropTypes from "prop-types";
import useAddSnacksHook from "./useAddSnacksHook";
import BookingCart from "./BookingCart";

function AddSnacksTab(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Index.Box sx={{ p: 3 }}>
          <Index.Typography>{children}</Index.Typography>
        </Index.Box>
      )}
    </div>
  );
}

AddSnacksTab.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function AddSnacks() {
  const { userDetails, userToken, region } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const stateData = PagesIndex.useSelector((state) => state.UserReducer);

  // use hooks
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();
  // get Ids
  const movieId = new URLSearchParams(location.search).get("mId");
  const regionId = new URLSearchParams(location.search).get("rId");
  const bookingSessionId = new URLSearchParams(location.search).get("sId");
  if (!bookingSessionId) {
    // PagesIndex.toast.error("Something went wrong!");
    return navigate(`/seat-management?mId=${movieId}&rId=${regionId}`, {
      state: {
        cId: stateData?.cinemaData?.cinemaData?.cinemaId,
        c_Id: stateData?.cinemaData?.cinemaData?._id,
        show_Time: stateData?.cinemaData?.selectedShowTiming,
        showDate: stateData?.cinemaData?.showDate,
      },
      replace: true,
    });
  }
  const cinemaId = stateData?.cinemaData?.cinemaData?._id;
  // states
  const [value, setValue] = useState(0);
  const [foodItemList, setFoodItemList] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);
  const [snackPrice, setSnackPrice] = useState(0);
  const [openWarning, setOpenWarning] = useState(false);
  const [bookingSession, setBookingSession] = useState(null);
  const [loading, setLoading] = useState({
    bookingSessionLoading: false,
  });
  const [isRemovingCoupon, setIsRemovingCoupon] = useState({
    couponCode: "",
    isRemoving: false,
  });
  const [seatPrice, setSeatPrice] = useState(
    +parseFloat(
      stateData?.cinemaData?.ticketPriceDetails?.total -
        stateData?.cinemaData?.ticketPriceDetails?.tax1 -
        stateData?.cinemaData?.ticketPriceDetails?.tax2
    ).toFixed(2)
  );

  // Handle function for Tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCloseWarning = () => setOpenWarning(false);

  //  pagination start
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  //pagination end

  // Get all Food Items
  const fetchFoodItemList = async () => {
    dispatch(PagesIndex.showLoader());
    const foodList = [];
    await PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_FOODS_AND_BAVERAGES,
      stateData?.cinemaData?.cinemaData?._id + "?" + new Date().getTime()
    ).then((response) => {
      if (response?.status === 200) {
        response.data.map((data) => {
          console.log(data, ":data");

          const obj = {
            ...data,
            itemPrice:
              data?.itemPrice / 100 + ((data?.itemPrice / 100) * 5) / 100,
            itemBasePrice: data?.itemPrice,
            quantity: 0,
          };
          foodList.push(obj);
        });
        setFoodItemList(foodList);
      }
      dispatch(PagesIndex.hideLoader());
    });
  };

  useEffect(() => {
    fetchFoodItemList();
    // fetchCouponList();
  }, []);

  useEffect(() => {
    window.addEventListener("load", pageOpened, false);

    return () => {
      window.addEventListener("load", pageOpened, false);
    };
  }, []);

  const pageOpened = () => {
    console.log("My Add snake page loaded");
    componentUnmount({ otherPath: false });
  };

  const componentUnmount = (data) => {
    if (window.confirm("Are you sure you want to cancel this transaction?")) {
      cancelSeats(stateData?.cinemaData?.transactionId, data);
    } else {
      navigate(
        {
          pathname: `/add-snacks`,
          search: PagesIndex?.createSearchParams({
            mId: movieId,
            rId: regionId,
            sId: bookingSessionId,
          }).toString(),
        },
        { state: location.state }
      );
    }
  };

  const cancelSeats = async (transactionId, data) => {
    dispatch(PagesIndex.showLoader());
    await PagesIndex.apiGetHandler(
      PagesIndex.Api.CANCEL_SEATS,
      `${stateData?.cinemaData?.cinemaData?.cinemaId}/${transactionId}`
    ).then(async (res) => {
      if (res?.status === 200) {
        PagesIndex.toast.success(res?.message);
        dispatch(PagesIndex.hideLoader());

        navigate(
          {
            pathname: "/seat-management",
            search: PagesIndex.createSearchParams({
              mId: stateData?.cinemaData?.mId,
              rId: stateData?.cinemaData?.rId,
            }).toString(),
          },
          {
            state: {
              cId: stateData?.cinemaData?.cinemaData?.cinemaId,
              c_Id: stateData?.cinemaData?.cinemaData?._id,
              show_Time: stateData?.cinemaData?.selectedShowTiming,
              showDate: stateData?.cinemaData?.showDate,
            },
          }
        );

        window.history.replaceState({}, document.title);
      } else {
        PagesIndex.toast.error("Something went wrong");
      }
      dispatch(PagesIndex.hideLoader());
    });
  };

  // function for add and remove food Items
  const handleAddRemoveItem = (index, value, minMax, itemId) => {
    console.log(itemId, foodItemList, ":itemId");

    let selectedFoodArr = foodItemList;
    console.log(selectedFoodArr, ":selectedFoodArr");
    let count = selectedFoodArr?.reduce(
      (currentValue, data) => data.quantity + currentValue,
      0
    );
    setFoodItemList((prev) => {
      let resurtArray = [...prev];
      if (
        minMax !== 0
          ? prev[index]?.quantity < minMax && count !== 10
          : prev[index]?.quantity !== minMax
      ) {
        const array = [...prev];
        resurtArray = array?.map((dataI, indexI) => {
          if (dataI?.itemId === itemId && array[indexI]) {
            if (array[indexI].quantity == 0) {
              array[indexI].orderAdded = count + 1;
            }
            array[indexI].quantity = array[indexI].quantity + value;
            array[indexI].index = indexI;
            selectedFoodArr?.push(array[indexI]);
            const truncateToTwo = (num) => {
              return parseFloat((Math.trunc(num * 100) / 100).toFixed(2));
            };

            const itemFinalPrice = truncateToTwo(array[indexI]?.itemPrice || 0);
            // const itemFinalPrice = parseFloat(
            //   (Math.trunc(array[indexI]?.itemPrice * 100) / 100).toFixed(2)
            // );
            // const itemFinalPrice = (Math.floor(array[indexI]?.itemPrice * 100) / 100).toFixed(2)
            // const itemFinalPrice = (array[indexI]?.itemPrice).toFixed(2)

            const finalPrice = parseFloat(
              value * (itemFinalPrice || 0).toFixed(2)
            );
            setPriceAfterFoodAdd((prev) =>
              parseFloat((prev + finalPrice).toFixed(2))
            );

            setSnackPrice((prev) => parseFloat((prev + finalPrice).toFixed(2)));
          }
          return array[indexI];
        });
      }
      if (count == 10 && value == 1) {
        setOpenWarning(true);
      }
      const test = selectedFoodArr
        ?.filter((data) => data?.quantity)
        ?.map((obj) => obj)
        .sort((a, b) => b.orderAdded - a.orderAdded);
      setSelectedFood([...new Set(test)]);

      return resurtArray;
    });
  };

  useEffect(() => {
    if (regionId !== region?._id) navigate("/");
  }, [region]);

  console.log(selectedFood, ":selectedFood");

  const [snackUpdatedPrice, setSnackUpdatedPrice] = useState(0);
  const [totalPayableAmount, setTotalPayableAmount] = useState(
    stateData?.cinemaData?.ticketPriceDetails?.total +
      stateData?.cinemaData?.convenienceFees
  );
  const [priceAfterFoodAdd, setPriceAfterFoodAdd] = useState(
    stateData?.cinemaData?.ticketPriceDetails?.total +
      stateData?.cinemaData?.convenienceFees
  );
  // console.log("priceAfterFoodAdd: ", priceAfterFoodAdd);

  // const [expanded, setExpanded] = useState("panel1");
  const [coupenCode, setCoupenCode] = useState("");
  const [coupenCodeError, setCoupenCodeError] = useState();
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [filteredCouponList, setFilterCouponList] = useState([]);
  const [couponWithPrivateList, setCouponWithPrivateList] = useState([]);
  const [discount, setDiscount] = useState({
    cinemaDiscount: 0,
    foodDiscount: 0,
  });
  const [mergeWithAnotherCoupon, setMergeWithAnotherCoupon] = useState(true);
  const [appliedCouponList, setAppliedCouponList] = useState([]);
  // const [ticketPrice, setTicketPrice] = useState(
  //   stateData?.cinemaData?.ticketPriceDetails?.total +
  //     stateData?.cinemaData?.convenienceFees
  // );

  const [cinemaSubTotal, setCinemaSubTotal] = useState(0.0);
  const [foodSubTotal, setFoodSubTotal] = useState(0.0);
  const [applying, setApplying] = useState(false);

  const [cinemaGSTPrice, setCinemaGSTPrice] = useState({
    CGST: stateData?.cinemaData?.ticketPriceDetails?.tax1,
    SGST: stateData?.cinemaData?.ticketPriceDetails?.tax2,
  });
  const [foodGSTPrice, setFoodGSTPrice] = useState({
    CGST: 0,
    SGST: 0,
  });
  const [vistaGST, setVistaGST] = useState({
    cgst: stateData?.cinemaData?.ticketPriceDetails?.tax1,
    sgst: stateData?.cinemaData?.ticketPriceDetails?.tax2,
  });

  const [appliedCoupon, setAppliedCoupon] = useState({});

  const [ticketPriceWithoutGST, setTicketPriceWithoutGST] = useState(
    +parseFloat(
      stateData?.cinemaData?.ticketPriceDetails?.total -
        stateData?.cinemaData?.ticketPriceDetails?.tax1 -
        stateData?.cinemaData?.ticketPriceDetails?.tax2
    ).toFixed(2)
  );

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
  const displayRazorpay = (transactionId) => {
    setCoupenCodeError("");
    const couponIds = Array.from(
      new Set(
        appliedCouponList
          ?.map((coupon) => coupon._id)
          .filter((row) => row !== undefined)
      )
    );
    // console.log(couponIds, "169");

    const urlencoded = new URLSearchParams();
    const payLoadString = `${stateData?.cinemaData?.transactionId}|${
      stateData?.cinemaData?.cinemaData?.cinemaId
    }|${stateData?.cinemaData?.selectedSessionId}|${userDetails?._id}|${
      stateData?.cinemaData?.selectedAreaData?.areaCatCode
    }|${stateData?.cinemaData?.selectedSeats?.length}|${
      stateData?.cinemaData?.pGroupCode
    }|${selectedFood.length ? true : false}|Web|${couponIds.toString()}`;
    // console.log(payLoadString, "payLoadString");
    urlencoded.append("id", crypt("testText123", payLoadString));

    dispatch(PagesIndex.showLoader());
    PagesIndex.apiPostHandler(PagesIndex.Api.INIT_PAYMENT_HDFC, urlencoded)
      .then((res) => {
        dispatch(PagesIndex.hideLoader());
        const paymentDiv = document.getElementById("payment_html");
        paymentDiv.innerHTML = res;
        let arr = paymentDiv.getElementsByTagName("script");
        for (let elem of arr) {
          eval(elem.innerHTML);
        }
      })
      .catch((error) => {
        dispatch(PagesIndex.hideLoader());
        PagesIndex.toast.error("Something went wrong");
      });
  };

  const resetOnAutoApply = () => {
    setAppliedCouponList([]);
    setDiscount({
      cinemaDiscount: 0,
      foodDiscount: 0,
    });
    setMergeWithAnotherCoupon(true);
    setTicketPriceWithoutGST(+seatPrice);
    setSnackUpdatedPrice(0);

    const calculateCinemaGST = calculateGSTAndTotal(+seatPrice, 18);
    setCinemaSubTotal(+calculateCinemaGST.subTotal);
    setCinemaGSTPrice({
      CGST: +calculateCinemaGST.CGST,
      SGST: +calculateCinemaGST.SGST,
    });
  };

  const getCouponType = (couponType) => {
    if (selectedFood.length) {
      if (couponType === "F&B") return "F&B";
      if (couponType === "Cinema") return "Cinema";
      if (couponType === undefined) return "F&B";
      // if (couponType === "All") return "All";
    } else {
      if (couponType === "F&B") return "Cinema";
      if (couponType === "Cinema") return "Cinema";
      if (couponType === undefined) return "Cinema";
      // if (couponType === "All") return "All";
    }
    return null;
  };

  const handleApplyCoupon = (couponCode, autoApply, fromText, couponType) => {
    setApplying(true);
    setCoupenCode("");

    // if coupon auto apply
    if (autoApply) {
      resetOnAutoApply();
    }
    // If there is no coupon Type
    if (!couponType) {
      const findCouponTypefromCouponCode = couponWithPrivateList?.find(
        (row) => row?.couponTitle == couponCode
      );

      if (!findCouponTypefromCouponCode?.couponTitle) {
        PagesIndex.toast.error("Coupon not valid");
        setCoupenCode("");
        return;
      } else {
        couponType = findCouponTypefromCouponCode?.couponType;
      }
    }

    let findAlreadyAppliedCoupon = appliedCouponList?.filter(
      (row) => row.couponTitle === couponCode || row.couponType === couponType
    );

    // If the coupon already aaplied
    if (findAlreadyAppliedCoupon.length > 0) {
      setApplying(false);
      setCoupenCode("");
      if (fromText) {
        PagesIndex.toast.error("Coupon already applied");
      }
      return;
    }

    const data = {
      couponTitle: couponCode?.toUpperCase(),
      cityId: regionId,
      cinemaObjectId: stateData?.cinemaData?.cinemaData?._id,
      movieLanguage: stateData?.cinemaData?.movieData?.languages
        ?.toLowerCase()
        ?.replace(/^\w/, (c) => c.toUpperCase()),
      userSpentAmount:
        getCouponType(couponType) == "F&B"
          ? snackUpdatedPrice > 0
            ? snackUpdatedPrice
            : snackPrice
          : ticketPriceWithoutGST,
      couponType: getCouponType(couponType),
    };

    PagesIndex.apiPostHandler(PagesIndex.Api.APPLY_COUPON, data, userToken)
      .then((res) => {
        dispatch(PagesIndex.hideLoader());

        if (res?.status == 200) {
          const validCoupon = res?.data;
          setAppliedCoupon(validCoupon); // this will store in array
          let discountUpto = +validCoupon.couponUpto;
          let discountedAmount; // amount after discount
          let discountReceived; // amount of discount

          if (validCoupon.couponType === "Cinema") {
            discountReceived =
              validCoupon.discountType == "flat"
                ? +validCoupon?.discount
                : (+ticketPriceWithoutGST * +validCoupon.discount) / 100;

            discountReceived =
              discountReceived > discountUpto ? discountUpto : discountReceived;

            discountedAmount = +ticketPriceWithoutGST - +discountReceived;

            discountReceived = discount.cinemaDiscount + discountReceived;

            setDiscount((prevState) => ({
              ...prevState,
              cinemaDiscount: discountReceived,
            }));

            const GSTAndSubTotal = calculateGSTAndTotal(+discountedAmount, 18); // calculate GST on base price

            setTicketPriceWithoutGST(GSTAndSubTotal.newBasePrice); // update for apply coupon on ticket price after discount

            setCinemaGSTPrice({
              CGST: GSTAndSubTotal.CGST,
              SGST: GSTAndSubTotal.SGST,
            });

            setCinemaSubTotal(+GSTAndSubTotal.subTotal);

            const totalAmount =
              selectedFood?.length > 0
                ? +GSTAndSubTotal.subTotal + +foodSubTotal
                : +GSTAndSubTotal.subTotal;

            setTotalPayableAmount(+totalAmount);
          } else if (validCoupon.couponType === "F&B") {
            discountReceived =
              validCoupon.discountType == "flat"
                ? +validCoupon.discount
                : snackUpdatedPrice > 0
                ? (snackUpdatedPrice * +validCoupon.discount) / 100
                : (snackPrice * +validCoupon.discount) / 100;

            discountReceived =
              discountReceived > +discountUpto
                ? +discountUpto
                : discountReceived;

            discountedAmount =
              snackUpdatedPrice > 0
                ? snackUpdatedPrice - discountReceived
                : snackPrice - discountReceived;

            discountReceived = +discount.foodDiscount + +discountReceived; // old + new

            setDiscount((prevState) => ({
              ...prevState,
              foodDiscount: +discountReceived,
            }));

            const GSTAndSubTotal = calculateGSTAndTotal(+discountedAmount, 5);

            setSnackUpdatedPrice(+GSTAndSubTotal.newBasePrice);

            setFoodGSTPrice({
              CGST: +GSTAndSubTotal.CGST,
              SGST: +GSTAndSubTotal.SGST,
            });

            setFoodSubTotal(+GSTAndSubTotal.subTotal);

            const totalAmount = +GSTAndSubTotal.subTotal + +cinemaSubTotal;

            setTotalPayableAmount(totalAmount);
          }

          setApplying(false);
          setApplyCoupon(false);

          validCoupon?.advancedSettings?.mergeWithAnotherCoupon == 1
            ? setMergeWithAnotherCoupon(true)
            : setMergeWithAnotherCoupon(false);

          if (!autoApply) {
            PagesIndex.toast.success("Coupon Applied Successfully");
          }
        } else if (res?.status == 404) {
          setApplying(false);
          if (!autoApply) {
            PagesIndex.toast.error(res?.message);
          }
        }
      })
      .catch((error) => {
        dispatch(PagesIndex.hideLoader());
        PagesIndex.toast.error("Something went wrong");
      });
  };
  // console.log({isRemovingCoupon},"snack");

  const handleRemoveCoupon = async (coupon, transId) => {
    console.log(coupon, ":coupon121");
    if (isRemovingCoupon?.isRemoving) return;

    setIsRemovingCoupon({ couponCode: coupon, isRemoving: true });
    const payload = {
      transId,
      couponCode: coupon,
      cinemaId: stateData?.cinemaData?.cinemaData?._id,
    };

    try {
      if (coupon === "") {
        setIsRemovingCoupon({ couponCode: "", isRemoving: false });
        return;
      }
      const response = await PagesIndex.apiPostHandler(
        PagesIndex.Api.REMOVE_CART_COUPON,
        payload,
        userToken
      );
      // console.log(response, ":response");
      if (response?.status === 200) {
        // PagesIndex.toast.success("Coupon removed successfully");
      }
    } catch (error) {
      console.error("Error removing coupon:", error);
      PagesIndex.toast.error("Failed to remove coupon");
    } finally {
      setIsRemovingCoupon({ couponCode: "", isRemoving: false });
    }
  };

  const autoApplyCoupon = () => {
    const eligibleCoupons = filteredCouponList?.filter(
      (data) => data.advancedSettings?.autoApplyOnCheckOut === 1
    );

    const couponsWithDiscount = eligibleCoupons?.map((coupon) => {
      let appliedDiscount = 0;

      if (coupon.discountType === "flat") {
        appliedDiscount = +coupon.discount;
      } else if (coupon.discountType === "%") {
        if (selectedFood.length) {
          let calculateDiscount;

          if (coupon.couponType === "Cinema") {
            calculateDiscount = (seatPrice * coupon.discount) / 100;
          } else if (coupon.couponType === "F&B") {
            calculateDiscount = (snackPrice * coupon.discount) / 100;
          }
          // else if (coupon.couponType == "All") {
          //   calculateDiscount = (totalPayableAmount * coupon.discount) / 100;
          // }

          appliedDiscount =
            calculateDiscount > coupon.discountUpto
              ? coupon.discountUpto
              : calculateDiscount;
        } else {
          const calculateDiscount = (seatPrice * coupon.discount) / 100;
          appliedDiscount =
            calculateDiscount > coupon.discountUpto
              ? coupon.discountUpto
              : calculateDiscount;
        }
      }

      return { ...coupon, appliedDiscount };
    });

    // console.log(couponsWithDiscount, 543);

    if (couponsWithDiscount?.length) {
      let relevantCoupons = [];

      if (selectedFood?.length) {
        relevantCoupons = couponsWithDiscount;
      } else {
        relevantCoupons = couponsWithDiscount.filter(
          (coupon) => coupon.couponType !== "F&B"
        );
      }

      if (relevantCoupons?.length) {
        const maxDiscountCoupon = relevantCoupons.reduce(
          (maxCoupon, currentCoupon) =>
            currentCoupon.appliedDiscount > (maxCoupon?.appliedDiscount || 0)
              ? currentCoupon
              : maxCoupon
        );

        const { couponTitle, couponType } = maxDiscountCoupon;

        handleApplyCoupon(couponTitle, "autoApply", "", couponType);
      }
    }
  };

  useEffect(() => {
    autoApplyCoupon();
  }, [filteredCouponList, snackPrice]);

  const handleRemoveItem = (index) => {
    let selectedFoodArr = selectedFood;
    setFoodItemList((prev) => {
      const array = [...prev];
      let resultArray = array.map((dataI, indexI) => {
        if (indexI === index) {
          const quantity = array[indexI].quantity;
          const truncateToTwo = (num) => {
            return parseFloat((Math.trunc(num * 100) / 100).toFixed(2));
          };

          const itemFinalPrice = truncateToTwo(array[indexI]?.itemPrice || 0);
          // const itemFinalPrice = parseFloat(
          //   (Math.trunc(array[indexI]?.itemPrice * 100) / 100).toFixed(2)
          // );
          // const itemFinalPrice = (Math.floor(array[indexI]?.itemPrice * 100) / 100).toFixed(2)
          setSnackPrice((prev) => prev - quantity * itemFinalPrice);
          setPriceAfterFoodAdd((prev) => prev - quantity * itemFinalPrice);
          array[indexI].quantity = 0;
          selectedFoodArr.push(array[indexI]);
        }
        return array[indexI];
      });
      const test = selectedFoodArr
        ?.filter((data) => data?.index !== index)
        ?.filter((data) => data?.quantity);
      setSelectedFood(test);
      return resultArray;
    });
  };

  function foodItemName(value) {
    switch (value) {
      case 0:
        return "Food And Beverages";
      case 1:
        return "Combo";
      case 2:
        return "Popcorn";
      case 3:
        return "Beverage";
      case 4:
        return "Snacks";
      default:
        return false;
    }
  }

  const formikRef = useRef();
  const formikRefOtp = useRef();
  const { otpTimer } = PagesIndex.useSelector((state) => state.UserReducer);

  const [changedCredential, setChangedCredential] = useState("");
  const [openOTPModal, setOpenOTPModal] = useState(false);
  const [openMobileModal, setOpenMobileModal] = useState(false);

  const otpModalOpen = () => {
    setOpenOTPModal(true);
  };
  const otpModalClose = () => {
    setOpenOTPModal(false);
    formikRefOtp.current.resetForm();
  };

  const handleAddMobileNumber = async (values) => {
    setChangedCredential(values?.phoneNumber);
    const formdata = new URLSearchParams();
    formdata.append("mobileNumber", values?.phoneNumber);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.VERIFY_MOBILENUMBER,
      formdata,
      userToken
    ).then((res) => {
      if (res?.status === 200) {
        setOpenMobileModal(false);
        otpModalOpen();
        dispatch(
          PagesIndex.getOtpTimer({
            seconds: 30,
            minute: 0,
          })
        );
        PagesIndex.toast.success(res.message);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };

  const handleSubmitOtp = (values, { resetForm }) => {
    let payload = {
      id: userDetails?._id,
      otp: values?.otp,
      flag: 1,
      mobileNumber: changedCredential,
    };
    PagesIndex.apiPostHandler(PagesIndex.Api.VERIFY_OTP, payload).then(
      (res) => {
        resetForm();
        if (res?.status === 200) {
          formikRef.current.resetForm();
          PagesIndex.toast.success(res?.message);
          otpModalClose();
          setChangedCredential("");

          if (selectedFood?.length) {
            addConssesionForItems(stateData?.cinemaData?.transactionId);
          } else {
            displayRazorpay(stateData?.cinemaData?.transactionId);
          }
        } else {
          PagesIndex.toast.error(res?.message);
        }
      }
    );
  };

  useEffect(() => {
    let myInterval;
    if (openOTPModal) {
      myInterval = setTimeout(() => {
        if (otpTimer.seconds > 0) {
          dispatch(
            PagesIndex.getOtpTimer({
              minute: otpTimer.minute,
              seconds: otpTimer.seconds - 1,
            })
          );
        }
        if (otpTimer.seconds == 0) {
          if (otpTimer.minute == 0) {
            clearTimeout(myInterval);
            dispatch(
              PagesIndex.getOtpTimer({
                seconds: 0,
                minute: 0,
              })
            );
          } else {
            dispatch(
              PagesIndex.getOtpTimer({
                minute: otpTimer.minute - 1,
                seconds: 59,
              })
            );
          }
        }
      }, 1000);
    }
    return () => {
      clearTimeout(myInterval);
    };
  });

  // Handle session expires
  const handleBookingSessionExpire = () => {
    PagesIndex.toast.error("Booking session expired!");
    navigate(`/seat-management?mId=${movieId}&rId=${regionId}`, {
      state: {
        cId: stateData?.cinemaData?.cinemaData?.cinemaId,
        c_Id: stateData?.cinemaData?.cinemaData?._id,
        show_Time: stateData?.cinemaData?.selectedShowTiming,
        showDate: stateData?.cinemaData?.showDate,
      },
      replace: true,
    });
    setBookingSession(null);
  };

  const getBookingSession = async () => {
    setLoading((prev) => ({ ...prev, bookingSessionLoading: true }));
    try {
      const response = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_BOOKING_SESSION + "/" + bookingSessionId,
        "",
        userToken
      );
      if (response?.status === 200) {
        setBookingSession(response?.data);
      } else {
        setBookingSession(null);
      }
    } catch (error) {
    } finally {
      setLoading((prev) => ({ ...prev, bookingSessionLoading: false }));
    }
  };

  useEffect(() => {
    if (bookingSessionId) {
      getBookingSession();
    }
  }, [bookingSessionId]);

  return (
    <>
      {userToken ? (
        <>
          <Index.Box className="main-add-snacks">
            <Index.Box className="add-snacks-header">
              <Index.Box className="cus-container">
                <Index.Typography
                  variant="h1"
                  component="h1"
                  className="header-title"
                >
                  {stateData?.cinemaData?.movieData?.name}
                </Index.Typography>
                <Index.Box className="booking-timer-flex">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="header-content"
                  >
                    {PagesIndex.moment(
                      stateData?.cinemaData?.showDate,
                      "YYYY-MM-DD"
                    ).format("dddd, DD MMM")}{" "}
                    ({stateData?.cinemaData?.movieData?.languages}{" "}
                    {stateData?.cinemaData?.movieData?.movieType?.includes("3D")
                      ? "3D"
                      : "2D"}
                    )
                  </Index.Typography>
                  {!loading.bookingSessionLoading && bookingSession && (
                    <BookingSessionTimer
                      data={bookingSession}
                      onExpire={handleBookingSessionExpire}
                    />
                  )}
                </Index.Box>
              </Index.Box>
            </Index.Box>
            <Index.Box className="add-snacks-body">
              <Index.Box className="add-snacks-tab-wrapper">
                <Index.Box className="add-snacks-tab-box">
                  <Index.Box className="cus-container">
                    <Index.Tabs
                      value={value}
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons={false}
                      aria-label="basic tabs example"
                    >
                      <Index.Tab
                        className="add-snacks-tab"
                        label="ALL"
                        {...a11yProps(0)}
                      />
                      <Index.Tab
                        className="add-snacks-tab"
                        label="COMBO"
                        {...a11yProps(1)}
                      />
                      <Index.Tab
                        className="add-snacks-tab"
                        label="POPCORN"
                        {...a11yProps(2)}
                      />
                      <Index.Tab
                        className="add-snacks-tab"
                        label="BEVERAGE"
                        {...a11yProps(3)}
                      />
                      <Index.Tab
                        className="add-snacks-tab"
                        label="SNACKS"
                        {...a11yProps(4)}
                      />
                    </Index.Tabs>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="add-snacks-content-box">
                  <Index.Box className="cus-container">
                    <Index.Box className="snacks-heading-title">
                      {foodItemName(value)}
                    </Index.Box>
                    <Index.Box className="snacks-bottom">
                      <Index.Box className="snacks-bottom-left">
                        <AddSnacksTab
                          value={value}
                          index={0}
                          className="add-snacks-tab-content"
                        >
                          {foodItemList.length > 0 ? (
                            <Index.Box className="snacks-card-wrapper">
                              {foodItemList
                                ?.slice(
                                  page * rowsPerPage - rowsPerPage,
                                  page * rowsPerPage
                                )
                                ?.map((item, key) => (
                                  <Index.Box
                                    key={item?.itemId}
                                    className="snacks-card"
                                  >
                                    <img
                                      src={
                                        item?.poster
                                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                          : PagesIndex.Png.NoImage
                                      }
                                      width="233"
                                      height="173"
                                      alt="snacks"
                                    />
                                    <Index.Box className="snacks-card-content">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="snacks-card-desc"
                                      >
                                        {item.itemDescription}
                                      </Index.Typography>
                                      <Index.Box className="snacks-card-bottom">
                                        <Index.Typography
                                          variant="p"
                                          component="p"
                                          className="snacks-card-price"
                                        >
                                          ₹
                                          {parseFloat(item.itemPrice).toFixed(
                                            2
                                          )}
                                        </Index.Typography>
                                        <Index.Box className="snacks-qty">
                                          <PagesIndex.Button
                                            onClick={() => {
                                              handleRemoveCoupon(
                                                isRemovingCoupon?.couponCode,
                                                stateData?.cinemaData
                                                  ?.transactionId
                                              );
                                              handleAddRemoveItem(
                                                key,
                                                -1,
                                                0,
                                                item?.itemId
                                              );
                                            }}
                                            disabled={
                                              !selectedFood?.includes(item)
                                            }
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
                                              handleRemoveCoupon(
                                                isRemovingCoupon?.couponCode,
                                                stateData?.cinemaData
                                                  ?.transactionId
                                              );
                                              handleAddRemoveItem(
                                                key,
                                                1,
                                                10,
                                                item?.itemId
                                              );
                                            }}
                                          >
                                            +
                                          </PagesIndex.Button>
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.Box>
                                ))}
                            </Index.Box>
                          ) : (
                            <Index.Box className="no-found-img-box">
                              <img
                                src={PagesIndex.Png.Popcorn}
                                alt="No Found"
                              />
                              No Food And Beverages Available
                            </Index.Box>
                          )}

                          {foodItemList?.length > 0 ? (
                            <Index.Box className="food-pagination-details">
                              <Index.Stack
                                spacing={2}
                                className="inner-food-page"
                              >
                                <Index.Pagination
                                  count={Math.ceil(
                                    foodItemList?.length / rowsPerPage
                                  )}
                                  page={page}
                                  onChange={handleChangePage}
                                  className="food-pagination-count"
                                />
                              </Index.Stack>
                            </Index.Box>
                          ) : (
                            <></>
                          )}
                        </AddSnacksTab>
                        <AddSnacksTab
                          value={value}
                          index={1}
                          className="add-snacks-tab-content"
                        >
                          {foodItemList?.filter((item) => item.type === "Combo")
                            ?.length ? (
                            <Index.Box className="snacks-card-wrapper">
                              {foodItemList
                                ?.filter((item) => item.type === "Combo")
                                ?.map((item, key) => (
                                  <Index.Box
                                    key={item?.itemId}
                                    className="snacks-card"
                                  >
                                    <img
                                      src={
                                        item?.poster
                                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                          : PagesIndex.Png.NoImage
                                      }
                                      width="233"
                                      height="173"
                                      alt="snacks"
                                    />
                                    <Index.Box className="snacks-card-content">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="snacks-card-desc"
                                      >
                                        {item.itemDescription}
                                      </Index.Typography>
                                      <Index.Box className="snacks-card-bottom">
                                        <Index.Typography
                                          variant="p"
                                          component="p"
                                          className="snacks-card-price"
                                        >
                                          ₹
                                          {parseFloat(item.itemPrice).toFixed(
                                            2
                                          )}
                                        </Index.Typography>
                                        <Index.Box className="snacks-qty">
                                          <PagesIndex.Button
                                            onClick={() => {
                                              item?.quantity > 0 &&
                                                handleAddRemoveItem(
                                                  item?.index,
                                                  -1,
                                                  0,
                                                  item?.itemId
                                                );
                                            }}
                                            disabled={
                                              !selectedFood?.includes(item)
                                            }
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
                                              handleAddRemoveItem(
                                                key,
                                                1,
                                                10,
                                                item?.itemId
                                              );
                                            }}
                                          >
                                            +
                                          </PagesIndex.Button>
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.Box>
                                ))}
                            </Index.Box>
                          ) : (
                            <Index.Box className="no-found-img-box">
                              <img
                                src={PagesIndex.Png.Popcorn}
                                alt="No Found"
                              />
                              No Combo Available
                            </Index.Box>
                          )}
                        </AddSnacksTab>
                        <AddSnacksTab
                          value={value}
                          index={2}
                          className="add-snacks-tab-content"
                        >
                          {foodItemList?.filter(
                            (item) => item.type === "Popcorn"
                          )?.length ? (
                            <Index.Box className="snacks-card-wrapper">
                              {foodItemList
                                ?.filter((item) => item.type === "Popcorn")
                                ?.map((item, key) => (
                                  <Index.Box
                                    key={item?.itemId}
                                    className="snacks-card"
                                  >
                                    <img
                                      src={
                                        item?.poster
                                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                          : PagesIndex.Png.NoImage
                                      }
                                      width="233"
                                      height="173"
                                      alt="snacks"
                                    />
                                    <Index.Box className="snacks-card-content">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="snacks-card-desc"
                                      >
                                        {item.itemDescription}
                                      </Index.Typography>
                                      <Index.Box className="snacks-card-bottom">
                                        <Index.Typography
                                          variant="p"
                                          component="p"
                                          className="snacks-card-price"
                                        >
                                          ₹
                                          {parseFloat(item.itemPrice).toFixed(
                                            2
                                          )}
                                        </Index.Typography>
                                        <Index.Box className="snacks-qty">
                                          <PagesIndex.Button
                                            onClick={() => {
                                              item?.quantity > 0 &&
                                                handleAddRemoveItem(
                                                  item?.index,
                                                  -1,
                                                  0,
                                                  item?.itemId
                                                );
                                            }}
                                            disabled={
                                              !selectedFood?.includes(item)
                                            }
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
                                              handleAddRemoveItem(
                                                key,
                                                1,
                                                10,
                                                item?.itemId
                                              );
                                            }}
                                          >
                                            +
                                          </PagesIndex.Button>
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.Box>
                                ))}
                            </Index.Box>
                          ) : (
                            <Index.Box className="no-found-img-box">
                              <img
                                src={PagesIndex.Png.Popcorn}
                                alt="No Found"
                              />
                              No Popcorn Available
                            </Index.Box>
                          )}
                        </AddSnacksTab>
                        <AddSnacksTab
                          value={value}
                          index={3}
                          className="add-snacks-tab-content"
                        >
                          {foodItemList?.filter(
                            (item) => item.type === "Beverage"
                          )?.length ? (
                            <Index.Box className="snacks-card-wrapper">
                              {foodItemList
                                ?.filter((item) => item.type === "Beverage")
                                ?.map((item, key) => (
                                  <Index.Box
                                    key={item?.itemId}
                                    className="snacks-card"
                                  >
                                    <img
                                      src={
                                        item?.poster
                                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                          : PagesIndex.Png.NoImage
                                      }
                                      width="233"
                                      height="173"
                                      alt="snacks"
                                    />
                                    <Index.Box className="snacks-card-content">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="snacks-card-desc"
                                      >
                                        {item.itemDescription}
                                      </Index.Typography>
                                      <Index.Box className="snacks-card-bottom">
                                        <Index.Typography
                                          variant="p"
                                          component="p"
                                          className="snacks-card-price"
                                        >
                                          ₹
                                          {parseFloat(item.itemPrice).toFixed(
                                            2
                                          )}
                                        </Index.Typography>
                                        <Index.Box className="snacks-qty">
                                          <PagesIndex.Button
                                            onClick={() => {
                                              item?.quantity > 0 &&
                                                handleAddRemoveItem(
                                                  item?.index,
                                                  -1,
                                                  0,
                                                  item?.itemId
                                                );
                                            }}
                                            disabled={
                                              !selectedFood?.includes(item)
                                            }
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
                                              handleAddRemoveItem(
                                                key,
                                                1,
                                                10,
                                                item?.itemId
                                              );
                                            }}
                                          >
                                            +
                                          </PagesIndex.Button>
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.Box>
                                ))}
                            </Index.Box>
                          ) : (
                            <Index.Box className="no-found-img-box">
                              <img
                                src={PagesIndex.Png.Popcorn}
                                alt="No Found"
                              />
                              No Beverage Available
                            </Index.Box>
                          )}
                        </AddSnacksTab>
                        <AddSnacksTab
                          value={value}
                          index={4}
                          className="add-snacks-tab-content"
                        >
                          {foodItemList?.filter(
                            (item) => item.type === "Snacks"
                          )?.length ? (
                            <Index.Box className="snacks-card-wrapper">
                              {foodItemList
                                ?.filter((item) => item.type === "Snacks")
                                ?.map((item, key) => (
                                  <Index.Box
                                    key={item?.itemId}
                                    className="snacks-card"
                                  >
                                    <img
                                      src={
                                        item?.poster
                                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                          : PagesIndex.Png.NoImage
                                      }
                                      width="233"
                                      height="173"
                                      alt="snacks"
                                    />
                                    <Index.Box className="snacks-card-content">
                                      <Index.Typography
                                        variant="p"
                                        component="p"
                                        className="snacks-card-desc"
                                      >
                                        {item.itemDescription}
                                      </Index.Typography>
                                      <Index.Box className="snacks-card-bottom">
                                        <Index.Typography
                                          variant="p"
                                          component="p"
                                          className="snacks-card-price"
                                        >
                                          ₹
                                          {parseFloat(item.itemPrice).toFixed(
                                            2
                                          )}
                                        </Index.Typography>
                                        <Index.Box className="snacks-qty">
                                          <PagesIndex.Button
                                            onClick={() => {
                                              item?.quantity > 0 &&
                                                handleAddRemoveItem(
                                                  item?.index,
                                                  -1,
                                                  0,
                                                  item?.itemId
                                                );
                                            }}
                                            disabled={
                                              !selectedFood?.includes(item)
                                            }
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
                                              handleAddRemoveItem(
                                                key,
                                                1,
                                                10,
                                                item?.itemId
                                              );
                                            }}
                                          >
                                            +
                                          </PagesIndex.Button>
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.Box>
                                ))}
                            </Index.Box>
                          ) : (
                            <Index.Box className="no-found-img-box">
                              <img
                                src={PagesIndex.Png.Popcorn}
                                alt="No Found"
                              />
                              No Snacks Available
                            </Index.Box>
                          )}
                        </AddSnacksTab>
                      </Index.Box>

                      <BookingCart
                        selectedFood={selectedFood}
                        snackPrice={snackPrice}
                        regionId={regionId}
                        setApplyCoupon={setApplyCoupon}
                        handleAddRemoveItem={handleAddRemoveItem}
                        handleRemoveItem={handleRemoveItem}
                        setOpenMobileModal={setOpenMobileModal}
                        displayRazorpay={displayRazorpay}
                        handleRollbackCoupon={handleRemoveCoupon}
                        isRemovingCoupon={isRemovingCoupon}
                        setIsRemovingCoupon={setIsRemovingCoupon}
                        bookingSession={bookingSession}
                      />
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
            <Index.Modal
              open={openWarning}
              onClose={handleCloseWarning}
              className="max-seat-warning-modal common-modal"
            >
              <Index.Box className="max-seat-warning-modal-inner common-modal-inner">
                <Index.Box className="modal-inner cus-scrollbar">
                  <Index.Box className="max-seat-warning">
                    <Index.ErrorIcon />
                    Selection Limit Alert
                  </Index.Box>
                  <Index.Typography className="max-seat-warning-text">
                    You cannot select more than 10 snacks.
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Modal>

            <PagesIndex.Formik
              enableReinitialize
              initialValues={{ phoneNumber: "" }}
              validationSchema={PagesIndex.accountDetailsPhoneSchema}
              onSubmit={handleAddMobileNumber}
              validateOnMount
              innerRef={formikRef}
              initialTouched={{ zip: true }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setErrors,
              }) => (
                <Index.Modal
                  open={openMobileModal}
                  onClose={() => {
                    formikRef.current.resetForm();
                    setOpenMobileModal(false);
                  }}
                  className="edit-number-modal"
                >
                  <Index.Box className="edit-number-modal-inner">
                    <Index.Box className="modal-inner cus-scrollbar">
                      <Index.Stack
                        className="form-control"
                        component="form"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit}
                      >
                        <Index.Typography className="edit-number-title">
                          Add phone number
                        </Index.Typography>
                        <Index.Typography className="edit-number-content">
                          This phone number will be verified by an OTP
                        </Index.Typography>
                        <Index.Box className="edit-number-form">
                          <Index.TextField
                            fullWidth
                            name="phoneNumber"
                            className="form-control"
                            placeholder={`Enter your phone number`}
                            inputProps={{
                              maxLength: 10,
                            }}
                            value={values?.phoneNumber}
                            onChange={(e) => {
                              let inputValue = e.target.value.trim();

                              inputValue = inputValue.replace(/\D/g, "");

                              setFieldValue("phoneNumber", inputValue);
                            }}
                            error={errors.phoneNumber && touched.phoneNumber}
                            helperText={
                              touched.phoneNumber ? errors.phoneNumber : null
                            }
                          />
                          <PagesIndex.Button
                            type="submit"
                            primary
                            className="edit-number-btn"
                            // disabled={isDisabledOtp}
                          >
                            Verify
                          </PagesIndex.Button>
                        </Index.Box>
                      </Index.Stack>
                    </Index.Box>
                  </Index.Box>
                </Index.Modal>
              )}
            </PagesIndex.Formik>

            <PagesIndex.Formik
              enableReinitialize
              onSubmit={handleSubmitOtp}
              initialValues={{ otp: "" }}
              validationSchema={PagesIndex.otpSchema}
              innerRef={formikRefOtp}
              validateOnMount
              initialTouched={{ zip: true }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setErrors,
              }) => (
                <Index.Modal
                  open={openOTPModal}
                  onClose={() => {
                    otpModalClose();
                    formikRefOtp?.current?.resetForm();
                  }}
                  className="edit-number-modal"
                >
                  <Index.Box className="edit-number-modal-inner">
                    <Index.Box className="modal-inner cus-scrollbar">
                      <Index.Stack
                        className="form-control"
                        component="form"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit}
                      >
                        <Index.Typography className="edit-number-title">
                          Verify your Phone Number
                        </Index.Typography>
                        <Index.Typography className="edit-number-content">
                          Enter OTP sent to phoneNumber
                        </Index.Typography>
                        <Index.Box className="otp-form-wrapper">
                          <Index.Box className="otp-form-inner-wrapper">
                            <PagesIndex.OTPInput
                              shouldAutoFocus
                              name="otp"
                              numInputs={4}
                              inputStyle="form-control"
                              containerStyle="otp-form"
                              inputType="number"
                              value={values.otp}
                              onChange={(value) => {
                                setFieldValue("otp", value);
                              }}
                              error={errors.otp && touched.otp}
                              renderInput={(props) => <input {...props} />}
                            />
                            <Index.FormHelperText error>
                              {errors.otp && touched.otp ? errors.otp : null}
                            </Index.FormHelperText>
                            <Index.Box className="resend-otp-box">
                              <Index.Typography variant="span" component="span">
                                Didn't receive the OTP?
                              </Index.Typography>
                              {otpTimer.minute === 0 &&
                              otpTimer.seconds === 0 ? (
                                <button
                                  className="resend-otp-btn"
                                  onClick={() => {
                                    resendOtp();
                                    setErrors({});
                                    formikRefOtp?.current?.resetForm();
                                  }}
                                  type="button"
                                >
                                  Resend
                                </button>
                              ) : (
                                <Index.Typography
                                  className="resend-otp-box"
                                  variant="span"
                                  component="span"
                                >
                                  Expire OTP in{" "}
                                  {otpTimer.minute < 10
                                    ? `0${otpTimer.minute}`
                                    : otpTimer.minute}
                                  :
                                  {otpTimer.seconds < 10
                                    ? `0${otpTimer.seconds}`
                                    : otpTimer.seconds}{" "}
                                  sec
                                </Index.Typography>
                              )}
                            </Index.Box>
                          </Index.Box>
                          <PagesIndex.Button
                            primary
                            className="otp-btn"
                            type="submit"
                          >
                            Verify OTP
                          </PagesIndex.Button>
                          <Index.Box className="back-btn-box">
                            <Index.Box
                              onClick={() => {
                                setOpenMobileModal(true);
                                setOpenOTPModal(false);
                                setErrors({});
                                formikRefOtp?.current?.resetForm();
                              }}
                              className="back-btn"
                            >
                              <Index.ArrowRightAltIcon />
                              Back
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                      </Index.Stack>
                    </Index.Box>
                  </Index.Box>
                </Index.Modal>
              )}
            </PagesIndex.Formik>
          </Index.Box>
        </>
      ) : (
        navigate("/")
      )}
    </>
  );
}

const BookingSessionTimer = ({ data, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(
    PagesIndex.moment(data?.sessionEndTime || null).diff(
      PagesIndex.moment(),
      "seconds"
    )
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.(); // final trigger
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <Index.Box className="booking-timer">
      <Index.Typography className="booking-timer-text">
        Booking session ends in:{" "}
        <strong className="timer-time">{formatTime(timeLeft)}</strong>
      </Index.Typography>
    </Index.Box>
  );
};

export default AddSnacks;
