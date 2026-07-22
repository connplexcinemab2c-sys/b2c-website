import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

let isCoupleSeats = false;

// Utility Functions
function charCode(rowID) {
  return rowID.charCodeAt(0);
}
function isPrevRowValid(currRowID, prevRowID) {
  const currCode = charCode(currRowID);
  const prevCode = charCode(prevRowID);
  return (
    prevCode === currCode ||
    prevCode === currCode - 1 ||
    prevCode === currCode + 1
  );
}

function checkAndSortArray(arr) {
  try {
    console.log(arr, ":arr");
    let shouldSort = false;

    for (let i = 1; i < arr.length; i++) {
      const prevRowID = arr[i - 1].rowData.strRowPhyID;
      const currRowID = arr[i].rowData.strRowPhyID;

      if (!isPrevRowValid(currRowID, prevRowID)) {
        shouldSort = true;
        break;
      }
    }

    if (shouldSort) {
      const firstRowID = arr[0].rowData.strRowPhyID;
      arr.sort((a, b) => {
        const aID = a.rowData.strRowPhyID;
        const bID = b.rowData.strRowPhyID;
        console.log("firstRowID", firstRowID);

        if (firstRowID !== "A") {
          return aID.localeCompare(bID);
        } else {
          return bID.localeCompare(aID);
        }
      });
    }

    return arr;
  } catch (error) {
    console.log(error, 5333);
  }
}
//End

function SeatManagement() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();
  const { isLoggedIn, region, userToken } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const movieId = new URLSearchParams(location.search).get("mId");
  const regionId = new URLSearchParams(location.search).get("rId");
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeatArea, setSelectedSeatArea] = useState("");
  const [selectedSeatAreaPrice, setSelectedSeatAreaPrice] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedPriceExcludingTax, setSelectedPriceExcludingTax] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showTimingsData, setShowTimingsData] = useState([]);
  const [selectedShowTiming, setSelectedShowTiming] = useState(
    location.state?.show_Time
  );

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [pGroupCode, setPGroupCode] = useState("");
  const [showId, setShowId] = useState("");
  const [movieData, setMovieData] = useState({});
  const [cinemaData, setCinemaData] = useState({});
  const [areaPriceDetailsList, setAreaPriceDetailsList] = useState([]);
  const [selectedAreaData, setSelectedAreaData] = useState({});
  const [openTerms, setOpenTerms] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [seatDetails, setSeatDetails] = useState([]);
  const [tax1, setTax1] = useState(0);
  const [tax2, setTax2] = useState(0);
  const [tax3, setTax3] = useState(0);
  const [tax4, setTax4] = useState(0);
  const [convenienceFees, setConvenienceFees] = useState(0);
  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const signInOpen = () => {
    setToggle(true);
  };
  const signInClose = () => setToggle(false);
  const handleCloseWarning = () => setOpenWarning(false);
  const handleTermsOpen = () => setOpenTerms(true);
  const handleTermsClose = () => setOpenTerms(false);

  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  console.log(selectedSeats, "selectedSeats");
  useEffect(() => {
    if (regionId !== region?._id)
      // navigate({
      //   pathname: `/movie-details`,
      //   search: PagesIndex?.createSearchParams({
      //     mId: movieId,
      //     rId: region?._id,
      //   }).toString(),
      // });
      navigate("/");
  }, [region]);
  useEffect(() => {
    if (location.state) {
      getShowTimingsByCinemaAndMovie();
    } else {
      navigate(
        {
          pathname: `/movie-details`,
          search: PagesIndex?.createSearchParams({
            mId: movieId,
            rId: regionId,
          }).toString(),
        },
        { replace: true }
      );
    }
    return () => {
      window.history.replaceState({}, document.title);
    };
  }, []);
  useEffect(() => {
    console.log(location?.state, "6777");
    if (location.state?.cId && location.state?.c_Id) {
      if (selectedSessionId) {
        setSelectedPrice(0);
        setSelectedPriceExcludingTax(0);
        setTax1(0);
        setTax2(0);
        setTax3(0);
        setTax4(0);
        setSelectedSeats([]);
        setSeatDetails([]);
        setConvenienceFees(0);
        setSelectedSeatAreaPrice(0);
        setIsLoading(true);
        getSeatLayout();
      }
    } else {
      navigate({
        pathname: `/movie-details`,
        search: PagesIndex?.createSearchParams({
          mId: movieId,
          rId: regionId,
        }).toString(),
      });
    }
  }, [selectedSessionId]);
  const getShowTimingsByCinemaAndMovie = () => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append(
      "id",
      `${location.state.c_Id}|${location.state?.showDate}|${movieId}`
    );
    PagesIndex.apiPostHandler(
      PagesIndex.Api.GET_SHOW_TIMINGS_BY_CINEMA_MOVIE,
      urlEncoded
    )
      .then((res) => {
        const shows = [];
        res.data.map((item) => {
          let startTime = PagesIndex.moment(item?.sessionRealShow).format(
            "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          );
          let currentTime = PagesIndex.moment().format(
            "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          );
          let timeisGt = startTime < currentTime;
          const objData = {
            sessionRealShow: item?.sessionRealShow,
            sessionId: item?.sessionId,
            screenName: item?.screenName,
            pGroupCode: item?.pGroupCode,
            sessionAdditionalData: item?.sessionAdditionalData,
            _id: item?._id,
          };
          if (!timeisGt) {
            shows.push(objData);
          }
          return false;
        });
        setShowTimingsData(shows);
        setMovieData(res.movie);
        setCinemaData(res.cinema);
        const selectedShow = res.data.find(
          (data) =>
            PagesIndex.moment(data?.sessionRealShow).format("hh:mm A") ===
            location.state?.show_Time
        );
        setSelectedSessionId(selectedShow?.sessionId);
        setPGroupCode(selectedShow?.pGroupCode);
        setShowId(selectedShow?._id);
      })
      .catch(() => {});
    dispatch(PagesIndex.hideLoader());
  };
  const getSeatLayout = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_SEAT_LAYOUT,
      `${location.state.cId}/${selectedSessionId}`
    ).then((res) => {
      if (res?.status === 200) {
        const sortedArray = checkAndSortArray(res?.data?.data);
        console.log(sortedArray, ":sortedArray");

        getAreaPriceList(sortedArray);
      }

      dispatch(PagesIndex.hideLoader());

      setIsLoading(false);
    });
  };
  console.log(seatLayout, ":seatLayout");
  const getAreaPriceList = (seatLayout) => {
    console.log(seatLayout, ":seatLayout173");
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_PRICE_DETAILS_LIST,
      `${pGroupCode}/${location.state?.cId}`
    ).then((res) => {
      if (res?.status === 200) {
        console.log(res.data, ":res.data");
        setAreaPriceDetailsList(res.data);
        setSeatLayout(modifyData(seatLayout, res.data));
      } else {
        PagesIndex.toast.error("Something went wrong");
      }
    });
  };
  const modifyData = (seatLayout, areaPriceData) => {
    let modifiedData = [];
    seatLayout.map((seatData, index) => {
      let area = areaPriceData?.find((item) => {
        return item?.areaCatCode === seatData.colData.strAreaCode;
      });
      if (!modifiedData[seatData.colData.strAreaCode])
        modifiedData[seatData.colData.strAreaCode] = {
          ...seatData.colData,
          area_price: area?.currentPrice,
          pricePackage: area?.pricePackage,
          priceTax1:
            area?.pricePackage == "Y" ? area?.priceTax1 / 100 : area?.priceTax1,
          priceTax2:
            area?.pricePackage == "Y" ? area?.priceTax2 / 100 : area?.priceTax2,
          priceTax3: area?.priceTax3,
          priceTax4: area?.priceTax4,
          rowData: [],
        };

      if (index === 0) modifiedData[seatData.colData.strAreaCode].rowData = [];
      console.log(seatData.rowData.strRowPhyID, 206, seatData.rowData);
      modifiedData[seatData.colData.strAreaCode].rowData[
        seatData.rowData.strRowPhyID
      ] = seatData.rowData;

      return false;
    });

    seatLayout.map((seatData, index) => {
      if (
        !modifiedData[seatData.colData.strAreaCode].rowData[
          seatData.rowData.strRowPhyID
        ].seatData
      )
        modifiedData[seatData.colData.strAreaCode].rowData[
          seatData.rowData.strRowPhyID
        ].seatData = [];

      modifiedData[seatData.colData.strAreaCode].rowData[
        seatData.rowData.strRowPhyID
      ].seatData[index] = seatData.seatData;
      return false;
    });
    let actualData = [];
    for (let key in modifiedData) {
      let actualRowData = [];
      // check if the property/key is defined in the object itself, not in parent
      for (let key2 in modifiedData[key].rowData) {
        let actualSeatData = [];
        for (let key3 in modifiedData[key].rowData[key2].seatData) {
          console.log(modifiedData[key].rowData[key2], 234);
          actualSeatData.unshift(
            modifiedData[key].rowData[key2].seatData[key3]
          );
        }
        modifiedData[key].rowData[key2].seatData = actualSeatData;
        actualRowData.unshift(modifiedData[key].rowData[key2]);
      }
      modifiedData[key].rowData = actualRowData;
      actualData.unshift(modifiedData[key]);
    }
    setIsLoading(false);
    return actualData;
  };
  const handleSeatSelection = async (index1, index2, index3) => {
    const selectedArea = areaPriceDetailsList?.find(
      (item) => item?.areaCatCode === seatLayout[index1].strAreaCode
    );
    if (
      seatLayout[index1]?.rowData[index2]?.seatData[index3]?.strSeatStatus ===
      "0"
    ) {
      setSelectedAreaData(selectedArea);
      if (seatLayout[index1].strGroupSeatsData) {
        isCoupleSeats = true;
        setSelectedSeatAreaPrice(
          seatLayout[index1].area_price -
            seatLayout[index1].priceTax1 -
            seatLayout[index1].priceTax2
        );
      } else {
        console.log(":Himanshu aaaa");

        setSelectedSeatAreaPrice(
          seatLayout[index1].area_price -
            seatLayout[index1].priceTax1 -
            seatLayout[index1].priceTax2
        );
      }
      handleChangeArea(index1, index2, index3);
      if (selectedSeats.length < 10) {
        handleSeatSelect(index1, index2, index3);
        setSelectedSeatArea(seatLayout[index1].strAreaDesc);
      } else if (
        selectedSeats.length === 10 &&
        selectedSeatArea === seatLayout[index1].strAreaDesc
      ) {
        setOpenWarning(true);
      }
    } else if (
      seatLayout[index1]?.rowData[index2]?.seatData[index3]?.strSeatStatus ===
      "-1"
    ) {
      handleSeatDeSelect(index1, index2, index3);
    }
  };
  // Function to handle seat selection from seta layout
  const handleSeatSelect = (index1, index2, index3) => {
    if (
      seatLayout[index1].rowData[index2].seatData[index3].strSeatStatus === "0"
    ) {
      seatLayout[index1].rowData[index2].seatData.map((data, index) => {
        if (
          seatLayout[index1].rowData[index2].seatData[index3]?.strSeatNumber ===
          seatLayout[index1].rowData[index2].seatData[index]?.strSeatNumber
        ) {
          setConvenienceFees((prev) => prev + cinemaData?.convenienceFees);
          setSeatLayout((e) => {
            let arr = [...e];
            arr[index1].rowData[index2].seatData[index].strSeatStatus = "-1";
            return arr;
          });
          setSelectedSeats((prev) => [
            ...prev,
            `${seatLayout[index1].rowData[index2].strRowPhyID}${seatLayout[index1].rowData[index2].seatData[index].strSeatNumber}`,
          ]);
          setSeatDetails((prev) => [
            ...prev,
            {
              areaCode: seatLayout[index1].strAreaCode,
              areaNumber: seatLayout[index1].strAreaNum,
              SeatRowId: seatLayout[index1].rowData[index2].intGridRowID,
              seatNumber:
                seatLayout[index1].rowData[index2].seatData[index]
                  .intGridSeatNum,
              strAreaDesc: seatLayout[index1].strAreaDesc,
            },
          ]);
          console.log("filter :", {
            areaCode: seatLayout[index1].strAreaCode,
            areaNumber: seatLayout[index1].strAreaNum,
            SeatRowId: seatLayout[index1].rowData[index2].intGridRowID,
            seatNumber:
              seatLayout[index1].rowData[index2].seatData[index].intGridSeatNum,
          });

          setSelectedPriceExcludingTax((prev) => {
            let value =
              prev +
              seatLayout[index1].area_price -
              seatLayout[index1].priceTax1 -
              seatLayout[index1].priceTax2;
            return value;
          });

          setSelectedPrice((prev) => {
            let value = prev + seatLayout[index1].area_price;
            return value;
          });
          setTax1((prev) => {
            let value = prev + seatLayout[index1].priceTax1;
            return value;
          });
          setTax2((prev) => {
            let value = prev + seatLayout[index1].priceTax2;
            return value;
          });
          setTax3((prev) => {
            let value = prev + seatLayout[index1].priceTax3;
            return value;
          });
          setTax4((prev) => {
            let value = prev + seatLayout[index1].priceTax4;
            return value;
          });
        }
      });
    }
  };
  // Function to deselect the selected seats from seat layout
  const handleSeatDeSelect = (index1, index2, index3) => {
    if (
      seatLayout[index1].rowData[index2].seatData[index3].strSeatStatus === "-1"
    ) {
      seatLayout[index1].rowData[index2].seatData.map((data, index) => {
        if (
          seatLayout[index1].rowData[index2].seatData[index3]?.strSeatNumber ===
          seatLayout[index1].rowData[index2].seatData[index]?.strSeatNumber
        ) {
          setConvenienceFees((prev) => prev - cinemaData?.convenienceFees);
          setSeatLayout((e) => {
            let arr = [...e];
            arr[index1].rowData[index2].seatData[index].strSeatStatus = "0";
            return arr;
          });
          setSelectedSeats((prev) => {
            const arr = prev.filter(function (item) {
              return (
                item !==
                `${seatLayout[index1].rowData[index2].strRowPhyID}${seatLayout[index1].rowData[index2].seatData[index].strSeatNumber}`
              );
            });
            return arr;
          });
          // setSeatDetails((prev) => {
          //   const arr = prev.filter((item) => {
          //     console.log(item, "filter");
          //     return (
          //       item.seatNumber !==
          //         seatLayout[index1].rowData[index2].seatData[index]
          //           .intGridSeatNum
          //     );
          //   });
          //   console.log("Filtered array:", arr);
          //   return arr;
          // });

          setSeatDetails((prev) => {
            const arr = prev.filter((item) => {
              return (
                item.SeatRowId !==
                  seatLayout[index1].rowData[index2].intGridRowID ||
                item.seatNumber !==
                  seatLayout[index1].rowData[index2].seatData[index]
                    .intGridSeatNum
              );
            });

            return arr;
          });

          setSelectedPriceExcludingTax((prev) => {
            let value =
              prev -
              seatLayout[index1].area_price +
              seatLayout[index1].priceTax1 +
              seatLayout[index1].priceTax2;
            return value < 0 ? 0 : value;
          });
          setSelectedPrice((prev) => {
            let value = prev - seatLayout[index1].area_price;
            return value;
          });
          setTax1((prev) => {
            let value = prev - seatLayout[index1].priceTax1;
            return value;
          });
          setTax2((prev) => {
            let value = prev - seatLayout[index1].priceTax2;
            return value;
          });
          setTax3((prev) => {
            let value = prev - seatLayout[index1].priceTax3;
            return value;
          });
          setTax4((prev) => {
            let value = prev - seatLayout[index1].priceTax4;
            return value;
          });
        }
      });
    }
  };
  // Function for handling area change in seat layout
  const handleChangeArea = (index1, index2, index3) => {
    if (seatLayout[index1].strAreaDesc !== selectedSeatArea) {
      setSelectedPrice(0);
      setSelectedPriceExcludingTax(0);
      setTax1(0);
      setTax2(0);
      setTax3(0);
      setTax4(0);
      setSelectedSeats([]);
      setSeatDetails([]);
      setConvenienceFees(0);
      setSeatLayout((e) => {
        let arr = [...e];
        arr.forEach((item, index01) => {
          item.rowData.map((rows, index02) => {
            rows.seatData.map((seats, index03) => {
              if (
                arr[index01].rowData[index02].seatData[index03]
                  .strSeatStatus === "-1"
              ) {
                arr[index01].rowData[index02].seatData[index03].strSeatStatus =
                  "0";
              }
              return false;
            });
            return false;
          });
          return false;
        });
        return arr;
      });
      if (selectedSeats.length === 10) {
        handleSeatSelect(index1, index2, index3);
      }
    }
  };
  const handleInitBooking = async () => {
    dispatch(PagesIndex.showLoader());
    handleTermsClose();
    await PagesIndex.apiGetHandler(
      PagesIndex.Api.INIT_SEAT_BOOKING,
      location.state.cId + "/" + movieId + "?" + new Date().getTime()
    ).then(async (res) => {
      if (res?.status === 200) {
        await addSeats(res.data.initTransId, res?.data?.bookingSessionId);
      } else if (res?.status == 409) {
        PagesIndex.toast.error(res?.message);
        dispatch(PagesIndex.hideLoader());
        navigate("/");
      } else if (res?.data?.data == "Invalid License Code !!!") {
        PagesIndex.toast.error(res?.data?.data);
        dispatch(PagesIndex.hideLoader());
      } else {
        PagesIndex.toast.error("Something went wrong");
        dispatch(PagesIndex.hideLoader());
      }
    });
  };

  const addSeats = async (transactionId, bookingSessionId) => {
    const urlEncoded = new URLSearchParams();
    // urlEncoded.append("filmCode", location?.state?.filmCode);
    urlEncoded.append("showId", showId);
    urlEncoded.append(
      "id",
      `${location.state.cId}|${transactionId}|${selectedSessionId}|${selectedAreaData?.tTypeCode}|${selectedSeats.length}`
    );
    await PagesIndex.apiPostHandler(PagesIndex.Api.ADD_SEATS, urlEncoded)
      .then(async (res) => {
        if (res?.status === 200) {
          // take transactionId from add seat Response
          let newStrTransId = res.data.data.strTransId;
          await setSeats(newStrTransId, bookingSessionId);
        } else {
          PagesIndex.toast.error("Something went wrong");
          dispatch(PagesIndex.hideLoader());
        }
      })
      .catch((error) => {
        console.log(error, ":Error");
      });
  };

  console.log(seatDetails, ":seatDetails");

  const setSeats = async (transactionId, bookingSessionId) => {
    const seatString = `|${seatDetails?.length}${seatDetails
      ?.map((detail) => {
        return `|${detail.areaCode}|${detail.areaNumber}|${detail.SeatRowId}|${detail.seatNumber}`;
      })
      .join("")}|`;
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("cinemaId", location.state.cId);
    urlEncoded.append("cinemaObjId", location.state.c_Id);
    urlEncoded.append("movieObjId", movieData?._id);
    urlEncoded.append("showObjId", showId);
    urlEncoded.append("strTransId", transactionId);
    urlEncoded.append("lngSessionId", selectedSessionId);
    urlEncoded.append("strSelectedSeats", seatString);
    urlEncoded.append("city", region?.region || regionId || "");
    await PagesIndex.apiPostHandler(PagesIndex.Api.SET_SEATS, urlEncoded)
      .then(async (res) => {
        if (res?.status === 200) handleTermsClose();
        dispatch(PagesIndex.hideLoader());
        if (res?.status === 200) {
          dispatch(
            PagesIndex.getCinemaData({
              mId: movieId,
              rId: regionId,
              selectedSessionId: selectedSessionId,
              cinemaData: cinemaData,
              selectedAreaData: selectedAreaData,
              selectedSeats: selectedSeats.sort(),
              movieData: movieData,
              pGroupCode: pGroupCode,
              selectedShowTiming: selectedShowTiming,
              showDate: location.state?.showDate,
              convenienceFees: convenienceFees,
              isCoupleSeats: isCoupleSeats,
              ticketPriceDetails: {
                total: selectedPrice,
                tax1: tax1,
                tax2: tax2,
                tax3: tax3,
                tax4: tax4,
              },
              transactionId: transactionId,
              ticketType: seatDetails[0]?.strAreaDesc,
            })
          );

          navigate(
            {
              pathname: "/add-snacks",
              search: PagesIndex?.createSearchParams({
                mId: movieId,
                rId: regionId,
                sId: bookingSessionId,
              }).toString(),
            },
            {
              state: {
                selectedSessionId: selectedSessionId,
                cinemaData: cinemaData,
                selectedAreaData: selectedAreaData,
                selectedSeats: selectedSeats.sort(),
                movieData: movieData,
                pGroupCode: pGroupCode,
                selectedShowTiming: selectedShowTiming,
                showDate: location.state?.showDate,
                convenienceFees: convenienceFees,
                isCoupleSeats: isCoupleSeats,
                ticketPriceDetails: {
                  total: selectedPrice,
                  tax1: tax1,
                  tax2: tax2,
                  tax3: tax3,
                  tax4: tax4,
                },
                transactionId: transactionId,
                ticketType: seatDetails[0]?.strAreaDesc,
              },
            }
          );

          localStorage.removeItem("discountData");
          window.history.replaceState({}, document.title);
        } else if (res?.data?.data == "Invalid License Code !!!") {
          PagesIndex.toast.error(res?.data?.data);
        } else {
          PagesIndex.toast.error("Something went wrong");
        }
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
      });
  };
  const renderSeatRow = (item, key1) => (
    <>
      <Index.TableRow>
        <Index.TableCell component="th" scope="row" colSpan={15}>
          {item.strAreaDesc?.includes("COUPLE")
            ? `${item.strAreaDesc} (Each) - ₹${item?.area_price}`
            : `${item.strAreaDesc} - ₹${item?.area_price}`}
        </Index.TableCell>
      </Index.TableRow>
      {item.rowData.map((res, key2) => renderSeat(res, key1, key2))}
    </>
  );

  const renderSeat = (res, key1, key2) => (
    <Index.TableRow key={key2}>
      {console.log(res.strRowPhyID, ":res.strRowPhyID")}
      <Index.TableCell align="center">{res.strRowPhyID}</Index.TableCell>
      {res.seatData.map((resItem, key3) =>
        renderSeatCell(resItem, key1, key2, key3, res.strRowPhyID)
      )}
    </Index.TableRow>
  );

  const renderSeatCell = (resItem, key1, key2, key3, rowName) => {
    const handleSeatClick = async () => {
      resItem?.Key != null && (await handleSeatSelection(key1, key2, key3));
    };

    return (
      <Index.TableCell align="center" key={key3}>
        {resItem.Key && (
          <Index.Box className="seat-box" onClick={handleSeatClick}>
            <PagesIndex.SeatIcon
              open={resItem.strSeatStatus === "0"}
              selected={resItem.strSeatStatus === "-1"}
              reserved={resItem.strSeatStatus === "1"}
              strSeatNumber={resItem.strSeatNumber}
              rowName={rowName}
            />
            <Index.Box className="seat-box-tooltip">
              <img src={PagesIndex.Png.NoImage} alt="Ticket Cancellation" />
            </Index.Box>
          </Index.Box>
        )}
      </Index.TableCell>
    );
  };

  const renderTableBody = () => (
    <Index.TableBody>
      {/* {seatLayout?.map((item, key1) => renderSeatRow(item, key1))} */}
      {seatLayout?.map((item, key1) => renderSeatRow(item, key1))}
    </Index.TableBody>
  );

  const renderTable = () =>
    seatLayout.length ? (
      <Index.Box className="table-scroll-content cus-scrollbar">
        {" "}
        <Index.Table>{renderTableBody()}</Index.Table>
      </Index.Box>
    ) : (
      <Index.Box className="no-found-svg-box">
        <Index.EventSeatIcon />
        No Seats Available
      </Index.Box>
    );
  return (
    <Index.Box className="main-seat-management">
      <Index.Box className="cus-container">
        <Index.Box className="seat-management-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="header-title"
          >
            {movieData?.name}
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="header-content"
          >
            {PagesIndex.moment(location.state?.showDate, "YYYY-MM-DD").format(
              "dddd, DD MMM"
            )}{" "}
            ({movieData?.languages}{" "}
            {movieData?.movieType?.includes("3D") ? "3D" : "2D"} )
          </Index.Typography>
          <Index.Box className="header-timing-box cus-scrollbar">
            <Index.Box className="header-timing-box-inner">
              {showTimingsData.map((item, key) => {
                const attributes = item?.sessionAdditionalData
                  ?.split("|")
                  .filter((data) => data?.includes("SCREENATTRIBUTES"))
                  ?.join("")
                  ?.split("SCREENATTRIBUTES=")
                  .filter((data) => data)
                  ?.join(", ");
                return (
                  <PagesIndex.Button
                    key={item?._id}
                    className={`movie-timing ${
                      PagesIndex.moment(item.sessionRealShow).format(
                        "hh:mm A"
                      ) === selectedShowTiming
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedShowTiming(
                        PagesIndex.moment(item.sessionRealShow).format(
                          "hh:mm A"
                        )
                      );
                      setSelectedSessionId(item?.sessionId);
                      setPGroupCode(item?.pGroupCode);
                      setShowId(item?._id);
                    }}
                  >
                    {PagesIndex.moment(item.sessionRealShow).format("hh:mm A")}
                    <Index.Typography
                      variant="span"
                      component="span"
                      className="movie-timing-label"
                    >
                      {attributes}
                    </Index.Typography>
                  </PagesIndex.Button>
                );
              })}
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="seat-management-body">
          <Index.Box className="seat-box-wrapper">
            <Index.Box className="seat-box-inner ">
              <Index.Box className="seat-box-inner-wrapper">
                <Index.Box className="screen-box">
                  <img
                    src={PagesIndex.Svg.ScreenImg}
                    width=""
                    height=""
                    alt="screen"
                  />
                  <Index.Typography
                    component="span"
                    variant="span"
                    className="screen-box-text"
                  >
                    SCREEN THIS WAY
                  </Index.Typography>
                </Index.Box>
                {!isLoading ? (
                  renderTable()
                ) : (
                  <Index.Box className="no-found-svg-box">
                    <Index.EventSeatIcon />
                    Loading...
                  </Index.Box>
                )}
              </Index.Box>
            </Index.Box>
            <Index.Box className="seat-suggestion-box">
              <Index.Box className="seat-available">
                <Index.Typography
                  variant="span"
                  component="span"
                  className="seat-suggestion-color"
                ></Index.Typography>
                <Index.Typography
                  variant="span"
                  component="span"
                  className="seat-suggestion-text"
                >
                  Available
                </Index.Typography>
              </Index.Box>
              <Index.Box className="seat-reserved">
                <Index.Typography
                  variant="span"
                  component="span"
                  className="seat-suggestion-color"
                ></Index.Typography>
                <Index.Typography
                  variant="span"
                  component="span"
                  className="seat-suggestion-text"
                >
                  Reserved
                </Index.Typography>
              </Index.Box>
              <Index.Box className="seat-selected">
                <Index.Typography
                  variant="span"
                  component="span"
                  className="seat-suggestion-color"
                ></Index.Typography>
                <Index.Typography
                  variant="span"
                  component="span"
                  className="seat-suggestion-text"
                >
                  Selected
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="summary-box-wrapper">
            <Index.Typography
              variant="p"
              component="p"
              className="summary-main-title"
            >
              Your Booking
            </Index.Typography>
            <Index.Box className="summary-box-inner cus-scrollbar">
              <Index.Box className="booking-summary">
                <Index.Box className="selected-movie summary-box-row">
                  <img
                    src={
                      movieData?.poster
                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${movieData?.poster}`
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
                      {movieData?.name}
                    </Index.Typography>
                    <Index.Typography className="summary-subtitle">
                      ({" "}
                      {movieData?.category &&
                        `${movieData?.category?.replace(", ", " | ")} |`}
                      {movieData?.censorRating && movieData?.censorRating} )
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
                    {`${selectedSeats?.length} ${
                      selectedSeats?.length <= 1 ? "Seat" : "Seats"
                    } `}
                    {/* {selectedSeats?.length
                      ? `(${[...new Set(selectedSeats)]
                        ?.toString()
                        ?.replaceAll(",", ", ")})`
                      : ""} */}

                    {selectedSeats?.length
                      ? `(${selectedSeats?.sort()?.join(",")})`
                      : ""}
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
                      {cinemaData?.displayName}
                    </Index.Typography>
                    <Index.Typography
                      variant="span"
                      component="span"
                      className="summary-subtitle"
                    >
                      {cinemaData?.address}
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
                      selectedShowTiming}
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
              {selectedSeats?.length > 0 && (
                <Index.Box className="payment-summary">
                  <Index.Box className="payment-summary-row">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label"
                    >
                      <Index.Typography variant="p" component="p">
                        Tickets
                      </Index.Typography>
                      <Index.Typography variant="p" component="p">
                        {`${selectedSeats?.length} x ${seatDetails[0]?.strAreaDesc}`}
                      </Index.Typography>
                    </Index.Typography>

                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-price"
                    >
                      {parseFloat(selectedPrice).toFixed(2) !== "NaN"
                        ? `₹${parseFloat(selectedPrice).toFixed(2)}`
                        : 0}
                    </Index.Typography>
                  </Index.Box>

                  {/* Payment Details Section */}
                  <Index.Box className="payment-details-seat">
                    <Index.Box className="payment-summary-row">
                      <Index.Typography>Payment Details</Index.Typography>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="payment-summary-row sub-total-space-summery">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-label"
                    >
                      <Index.Typography variant="p" component="p">
                        Sub Total
                      </Index.Typography>
                    </Index.Typography>

                    <Index.Typography
                      variant="p"
                      component="p"
                      className="payment-summary-price"
                    >
                      {parseFloat(selectedPrice).toFixed(2) !== "NaN"
                        ? `₹${parseFloat(selectedPrice).toFixed(2)}`
                        : 0}
                    </Index.Typography>
                  </Index.Box>

                  <Index.Box className="payment-summary-row-tax">
                    <Index.Box className="selected-snacks-box">
                      {/* Taxes & Fees Accordion */}
                      <Index.Accordion className="accordion-select-payment">
                        <Index.AccordionSummary
                          // expandIcon={<Index.ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                          className="accordion-select-summery"
                        >
                          <Index.Box className="accro-down-content">
                            <Index.Typography className="acrro-title-tax-details">
                              Taxes & Fees
                            </Index.Typography>
                            <Index.Box className="down-up-acrro-icon">
                              <Index.ExpandMoreIcon />
                            </Index.Box>
                          </Index.Box>
                          {/* <Index.Typography style={{ marginLeft: 'auto' }}>₹{parseFloat(convenienceFees + (convenienceFees * 0.18)).toFixed(2)}</Index.Typography> */}
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
                              ₹{parseFloat(convenienceFees).toFixed(2)}
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
                              ₹{parseFloat(convenienceFees * 0.18).toFixed(2)}
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
                              {cinemaData?.GSTNumber}
                            </Index.Typography>
                          </Index.Grid>
                        </Index.AccordionDetails>
                      </Index.Accordion>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              )}
            </Index.Box>
            <Index.Box className="total-payment-row">
              <Index.Typography
                variant="p"
                component="p"
                className="total-payment"
              >
                Total :
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="total-payment"
              >
                {parseFloat(
                  selectedPrice + convenienceFees + convenienceFees * 0.18
                ).toFixed(2) !== "NaN"
                  ? `₹${parseFloat(
                      selectedPrice + convenienceFees + convenienceFees * 0.18
                    ).toFixed(2)}`
                  : 0}
              </Index.Typography>
            </Index.Box>
            <Index.Box className="summary-box-button">
              <PagesIndex.Button
                primary
                className="book-now-btn"
                onClick={handleTermsOpen}
                disabled={!selectedSeats.length}
              >
                Book Now
              </PagesIndex.Button>
              {/* <Index.Link
                to="/add-snacks"
                className="add-snacks-btn btn btn-secondary"
              >
                Add Snacks
              </Index.Link> */}
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
              Warning
            </Index.Box>
            <Index.Typography className="max-seat-warning-text">
              You cannot select more than 10 seats.
            </Index.Typography>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
      <Index.Modal
        open={openTerms}
        onClose={handleTermsClose}
        aria-labelledby="terms-modal-title"
        aria-describedby="terms-modal-description"
        className="terms-modal common-modal"
      >
        <Index.Box className="terms-modal-inner common-modal-inner">
          <Index.Box className="terms-modal-title common-modal-title">
            Terms & Conditions
          </Index.Box>
          <Index.Box className="modal-inner cus-scrollbar">
            <Index.Box className="terms-modal-content">
              <Index.Typography variant="p" component="p">
                1. Tickets purchased for a connplex are valid for that
                particular connplex only.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                2. Patrons below the age of 18 years are not allowed for movies
                certified “A”.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                3. Patrons must carry proof of age for watching movies certified
                “A”.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                4. Purchase of ticket is required for children above the age of
                3 years.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                5. Tickets once sold are non-transferable and non-refundable.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                6. Outside Food & Beverage is not allowed inside the cinema.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                7. Patrons under the influence of alcohol or drugs will be
                denied entry by the cinema staff.
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="note-title"
              >
                Note:
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                CONNPLEX, it's employees, and/ or management does not take
                responsibility for loss or damage to articles or personal
                belongings that patrons may carry inside the cinema premises.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                The following items are strictly prohibited inside the cinema:
                Handbags, carry bags, helmets, eatables (including
                bidi-cigarette, gutka, tambaku/ tobacco, paan masala, chewing
                gum, chocolates, chips, etc.), liquor, drinks, camera, laptop,
                knife, lighter, matchbox, cigarette, firearms & all kind of
                inflammable objects.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                Please follow all COVID-related guidelines.
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                Movie Schedules and rates are subject to change without prior
                notice.
              </Index.Typography>
            </Index.Box>
          </Index.Box>
          <Index.Box className="terms-modal-btn">
            <PagesIndex.Button
              primary
              onClick={() => {
                if (isLoggedIn) {
                  handleInitBooking();
                } else {
                  signInOpen();
                }
              }}
            >
              Accept
            </PagesIndex.Button>
            <PagesIndex.Button
              className="btn-secondary"
              onClick={() => {
                handleTermsClose();
              }}
            >
              Cancel
            </PagesIndex.Button>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
      <Index.Modal
        open={toggle}
        onClose={signInClose}
        aria-labelledby="signin-modal-title"
        aria-describedby="signin-modal-description"
        className="signin-modal"
      >
        <PagesIndex.Login signInClose={signInClose} />
      </Index.Modal>
    </Index.Box>
  );
}

export default SeatManagement;
