import { useEffect, useState } from "react";
import PagesIndex from "../../../PagesIndex";

const useAddSnacksHook = () => {
  const dispatch = PagesIndex.useDispatch();
  const stateData = PagesIndex.useSelector((state) => state.UserReducer);
  const regionId = new URLSearchParams(location.search).get("rId");
  const cinemaId = stateData?.cinemaData?.cinemaData?._id;
  const movieId = new URLSearchParams(location.search).get("mId");
  // console.log(
  //   stateData?.cinemaData?.cinemaData,
  //   ":stateData?.cinemaData?.cinemaData?.cinemaId"
  // );
  const { userToken, region } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const [ticketBasePrice , setTicketBasePrice] = useState(+parseFloat(
    stateData?.cinemaData?.ticketPriceDetails?.total -
      stateData?.cinemaData?.ticketPriceDetails?.tax1 -
      stateData?.cinemaData?.ticketPriceDetails?.tax2
  ).toFixed(2))
  const [ticketQuantity , setTicketQuantity] = useState(stateData?.cinemaData?.selectedSeats?.length || 0)
  const [couponList, setCouponList] = useState([]); // all Website coupons
  const [publicCouponList, setPublicCouponList] = useState([]);
  const [autoApplyCouponList, setAutoApplyCouponList] = useState([]);

  console.log(stateData, ":stateData");

  const fetchCouponList = async () => {
    dispatch(PagesIndex.showLoader());

    await PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_COUPON_LIST,
      regionId,
      userToken
    ).then((response) => {
      // console.log(response.data, ":response");
      if (region?.region && response?.data && region.region in response.data) {
        const regionData = response.data[region.region];
        const cinemaName = stateData?.cinemaData?.cinemaData?.cinemaName;
        const MovieLanguage = stateData?.cinemaData?.movieData?.languages;

        let selectRegionCinema = {};
        let selectCouponList = [];
        // select cinema
        for (const cinema in regionData) {
          if (cinema == cinemaName) {
            selectRegionCinema = regionData[cinema];
          }
        }
        for (const lang in selectRegionCinema) {
          if (lang.toLowerCase() == MovieLanguage.toLowerCase()) {
            selectCouponList = selectRegionCinema[lang];
          }
        }

        // console.log(selectRegionCinema, ":selectRegionCinema");

        // console.log(MovieLanguage, ":MovieLanguage");
        // console.log(selectCouponList, ":selectCouponList");

        // if(selectCouponList.length){
        let eligibleCouponsForWebsite = selectCouponList.filter((item) =>
          item.couponFor.includes("website")
        );
        // console.log(eligibleCouponsForWebsite, ":eligibleCouponsForWebsite");

        let PublicCoupons = eligibleCouponsForWebsite?.length
          ? eligibleCouponsForWebsite.filter(
              (item) => item.couponCategory == "Public"
            )
          : [];

        let AutoApplyCoupons = eligibleCouponsForWebsite?.length
          ? eligibleCouponsForWebsite.filter(
              (item) => item.advancedSettings.autoApplyOnCheckOut == 1
            )
          : [];

        // let filterOutWithCinema = eligibleCouponsForWebsite.filter((item) => {
        //     let getallCinemaId = item.cinemaObjectId.map((row) => {return row._id});
        //     return getallCinemaId.includes(cinemaId);
        // })

        // console.log(filterOutWithCinema , ":filterOutWithCinema")
        setAutoApplyCouponList(AutoApplyCoupons);
        setCouponList(eligibleCouponsForWebsite);
        setPublicCouponList(PublicCoupons);
      }

      dispatch(PagesIndex.hideLoader());
    });
  };

  // console.log(autoApplyCouponList, ":autoApplyCouponList");

  // const autoApplyCoupon = () => {
  //   let TicketBasePrice =
  //     stateData?.cinemaData?.ticketPriceDetails?.total -
  //     stateData?.cinemaData?.ticketPriceDetails?.tax1 -
  //     stateData?.cinemaData?.ticketPriceDetails?.tax2;
  //   let maxCouponDiscount = 0;
  //  let maxCouponDiscountArr =  autoApplyCouponList.map((item) => {
  //   // console.log(item , ":autoApplyCouponList Itewm")
  //     if (item.discountType == "%") {
  //       maxCouponDiscount += (TicketBasePrice * item.discount) / 100;
  //     }

  //     if (item.discountType == "flat") {
  //       maxCouponDiscount += +item.discount;
  //     }

  //     return { ...item, maxCouponDiscount: maxCouponDiscount };
  //   });

  //   // console.log(maxCouponDiscountArr , ":maxCouponDiscountArr")
  // };

  console.log(couponList, ":use couponList");

  useEffect(() => {
    fetchCouponList();
  }, []);

  // useEffect(() => {
  //   if(autoApplyCouponList?.length){
  //       autoApplyCoupon()
  //   }
  // },[autoApplyCouponList])

  return { couponList ,ticketBasePrice , ticketQuantity , autoApplyCouponList };
};

export default useAddSnacksHook;
