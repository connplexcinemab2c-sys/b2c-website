import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import AppTeatreSvgIcon from "../../../../components/icons/AppTeatreSvgIcon";

function DetailTabContent({
  props,
  movieId,
  regionId,
  languages,
  movieShows,
  filteredMovieShows,
  setFilteredMovieShows,
  getMovieShowDetails,
  filmOpeningDate,
  censorRating,
  movieDetail,
  region
}) {
  const showPriceItem = [
    {
      id: 1,
      startPrice: "0",
      endPrice: "100",
      checked: false,
    },
    {
      id: 2,
      startPrice: "101",
      endPrice: "250",
      checked: false,
    },
    {
      id: 3,
      startPrice: "251",
      endPrice: "500",
      checked: false,
    },
    {
      id: 4,
      startPrice: "501",
      endPrice: "Max",
      checked: false,
    },
  ];
  const showTimeItem = [
    {
      id: 1,
      dayTime: "Morning",
      startTime: "12:00",
      endTime: "11:59",
      period: "AM",
      icon: PagesIndex.Svg.MorningIcon,
      checked: false,
    },
    {
      id: 2,
      dayTime: "Afternoon",
      startTime: "12:00",
      endTime: "03:59",
      period: "PM",
      icon: PagesIndex.Svg.AfternoonIcon,
      checked: false,
    },
    {
      id: 3,
      dayTime: "Evening",
      startTime: "04:00",
      endTime: "06:59",
      period: "PM",
      icon: PagesIndex.Svg.EveningIcon,
      checked: false,
    },
    {
      id: 4,
      dayTime: "Night",
      startTime: "07:00",
      endTime: "11:59",
      period: "PM",
      icon: PagesIndex.Svg.NightIcon,
      checked: false,
    },
  ];
  const navigate = PagesIndex.useNavigate();
  const dispatch = PagesIndex.useDispatch();
  const { movieFilter  } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const [showDays, setShowDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    PagesIndex.moment().format("YYYY-MM-DD")
  );
  const [filterShows, setFilterShows] = useState([]);
  const [timings, setTimings] = useState(movieFilter?.timeFilter?.length ? movieFilter?.timeFilter : []);
  const [prices, setPrices] = useState(movieFilter?.priceFilter?.length ? movieFilter?.priceFilter : []);
  
  const [movieShowPrices, setMovieShowPrices] = useState(() =>
    movieFilter?.priceFilter?.length
      ? showPriceItem.map((item) => {
          const match = movieFilter?.priceFilter.find(
            (price) =>
              price.startPrice === item.startPrice && price.endPrice === item.endPrice
          );
          return match ? { ...item, checked: true } : item;
        })
      : showPriceItem
  );

  const [movieShowTimings, setMovieShowTimings] = useState(() =>
    movieFilter?.timeFilter?.length
      ? showTimeItem.map((item) => {
          const match = movieFilter?.timeFilter.find(
            (time) =>
              PagesIndex.moment(time.startTime,"HH:mm").format("hh:mm") === item.startTime && PagesIndex.moment(time.endTime,"HH:mm").format("hh:mm") === item.endTime
          );
          return match ? { ...item, checked: true } : item;
        })
      : showTimeItem);
      
  const [showData, setShowData] = useState({});
  const [openWarning, setOpenWarning] = useState(false);
  useEffect(() => {
    getWeekDays();
  }, [movieDetail,filmOpeningDate]);
  useEffect(() => {
    getMovieShowDetails(selectedDate);
  }, [selectedDate, regionId, movieId, region]);
  useEffect(() => {
    if (timings?.length && prices?.length) {
      priceFilterFunction(timeFilterFunction());
    } else if (prices.length) {
      priceFilterFunction();
    } else if (timings.length) {
      timeFilterFunction();
    } else {
      setFilterShows(filteredMovieShows);
    }
  }, [timings, prices, filteredMovieShows, movieFilter]);
  const handleWarning = (e) => {
    setShowData(e);
    setOpenWarning(true);
  };
  const handleWarningClose = () => {
    setOpenWarning(false);
  };

  const setMoviePriceAndTimeFilter = () =>{
    dispatch(PagesIndex.updateMovieFilter({priceFilter:prices,timeFilter:timings}))
  }

  const getWeekDays = () => {
    let days = [];
    let daysRequired = movieDetail?.showExtendedDays || 10;
    let startTime = filmOpeningDate;
    let currentTime = PagesIndex.moment().utc().format("YYYY-MM-DD");
    let timeisGt = startTime > currentTime;
    for (let i = 0; i <= daysRequired; i++) {
      const a = timeisGt
        ? PagesIndex.moment(filmOpeningDate, "YYYY-MM-DD")
        : PagesIndex.moment();
      const b = timeisGt
        ? PagesIndex.moment(filmOpeningDate, "YYYY-MM-DD").add(i, "days")
        : PagesIndex.moment().add(i, "days");
      setSelectedDate(
        timeisGt ? startTime : PagesIndex.moment().format("YYYY-MM-DD")
      );
      let objData = {
        day:
          //   b.diff(a, "days") === 0
          //     ? "Today"
          //     : b.diff(a, "days") === 1
          //     ? "Tomorrow"
          //     : b.format("dddd"),
          b.format("ddd"),
        date: b.format("DD"),
        month: b.format("MMM"),
        paramDate: b.format("YYYY-MM-DD"),
        selected: b.diff(a, "days") === 0,
      };
      days.push(objData);
    }
    setShowDays(days);
  };
  const dateFilter = (index, checked, startTime, endTime) => {
    setMovieShowTimings((e) => {
      const arr = [...e];
      const selected = arr.map((data, key) => {
        if (index === key) {
          return {
            ...data,
            checked,
          };
        } else {
          return {
            ...data,
          };
        }
      });
      return selected;
    });
    if (checked) {
      setTimings((prev) => [
        ...prev,
        {
          startTime,
          endTime,
        },
      ]);
    } else {
      setTimings((prev) =>
        prev?.filter((data) => {
          return data?.endTime !== endTime;
        })
      );
    }
  };
  const priceFilter = (index, checked, startPrice, endPrice) => {
    setMovieShowPrices((e) => {
      const arr = [...e];
      const selected = arr.map((data, key) => {
        if (index === key) {
          return {
            ...data,
            checked,
          };
        } else {
          return {
            ...data,
          };
        }
      });
      return selected;
    });
    if (checked) {
      setPrices((prev) => [
        ...prev,
        {
          startPrice,
          endPrice,
        },
      ]);
    } else {
      setPrices((prev) => prev?.filter((data) => data?.endPrice !== endPrice));
    }
  };
  const timeFilterFunction = () => {
    let data = filteredMovieShows.map((e) => {
      return {
        ...e,
        timings: e.timings?.filter((el) => {
          const validTime = timings.some((ele) => {
            const startTime = PagesIndex.moment(el.startTime).format("HH:mm");
            return (
              PagesIndex.moment(startTime, "HH:mm").format("X") <=
                +PagesIndex.moment(ele.endTime, "HH:mm").format("X") &&
              PagesIndex.moment(startTime, "HH:mm").format("X") >=
                +PagesIndex.moment(ele.startTime, "HH:mm").format("X")
            );
          });
          if (validTime && timings.length) {
            return {
              ...el,
            };
          }
          return false;
        }),
      };
    });
    setFilterShows(data);
    return data;
  };
  const isValidPrice = (elePrice, price) => {
    if (price.endPrice === "Max") {
      return elePrice >= price.startPrice;
    } else {
      return elePrice <= price.endPrice && elePrice >= price.startPrice;
    }
  };

  const isTimingsValid = (timings, prices) => {
    let validPrice = false;
    timings.areas.forEach((ele) => {
      if (prices.some((price) => isValidPrice(ele.price, price))) {
        validPrice = true;
      }
    });
    return validPrice;
  };

  const mapTimings = (timings, prices) => {
    return timings.filter((el) => isTimingsValid(el, prices));
  };

  const mapMovies = (movieData, prices) => {
    return movieData.map((e) => ({
      ...e,
      timings: mapTimings(e.timings || [], prices),
    }));
  };

  const priceFilterFunction = (movieData) => {
    const movies = movieData || filteredMovieShows;
    const data = mapMovies(movies, prices);
    setFilterShows(data);
    return data;
  };
  const dropDownHandle = (e, className) => {
    e.stopPropagation();
    e.preventDefault();
    const timeFilter = document.getElementById(className);
    timeFilter.childNodes[1].classList.toggle("show-dropdown");
  };
  const getSeatStatus = (res) => {
    const { availableSeat, totalSeat } = getSeatInfo(res);
    const thresholdGreen = 0.6; // 60% or more seats available (green)
    const thresholdYellow = 0.3; // 30% or more seats available (yellow)

    const occupancyPercentage = availableSeat / totalSeat;
    if (availableSeat === 0) {
      return "#e21b1b";
    } else if (occupancyPercentage >= thresholdGreen) {
      return "#4abd5d"; // Plenty of seats available
    } else if (occupancyPercentage >= thresholdYellow) {
      return "#f3891e"; // Seats filling up fast
    } else {
      return "#f3891e"; // Seats almost full
    }
  };
  const renderTimingTooltip = (resItem) => {
    return (
      <Index.Box className="movie-timing-tooltip">
        {resItem.areas.map((resItem, key) => {
          const availabilityClass = getAvailabilityClass(resItem.statusColour);
          const availabilityStatus = getAvailabilityStatus(resItem);
          return (
            <Index.Box key={resItem.code}>
              <Index.Typography
                variant="p"
                component="p"
                className="timing-tooltip-price"
              >
                ₹{resItem.price}
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="timing-tooltip-class"
              >
                {resItem.label}
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className={availabilityClass}
              >
                {availabilityStatus}
              </Index.Typography>
            </Index.Box>
          );
        })}
      </Index.Box>
    );
  };

  const getAvailabilityClass = (statusColour) => {
    if (statusColour === "Y") return "timing-tooltip-availability filling-fast";
    if (statusColour === "R") return "timing-tooltip-availability sold-out";
    return "timing-tooltip-availability available";
  };

  const getAvailabilityStatus = (resItem) => {
    if (resItem.statusColour === "Y") return "Filling Fast";
    if (resItem.statusColour === "R") {
      return resItem.aSeats ? "Almost Full" : "Sold Out";
    }
    return "Available";
  };

  const renderTimingBox = (timings, item) => {
    console.log(item , ":item-347", movieDetail?.name)
    return (
      <Index.Box className="theatre-shows-right">
        <Index.Typography variant="p" component="p" className="movie-lang">
          {languages && `${languages}-`}{movieDetail?.movieType?.includes("3D") ? "3D" : "2D"}
        </Index.Typography>
        <Index.Box className="movie-timing-box">
          {timings.map((res, key) => {
            const timingClass = getTimingClass(res);
            return (
              <Index.Box
                disabled={
                  !isTimeGt(
                    PagesIndex.moment(res?.startTime).format(
                      "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                    )
                  )
                }
                component={"button"}
                onClick={() => handleTimingClick(res, item)}
                key={res.showId}
                className={timingClass}
                style={{
                  borderColor: getSeatStatus(res),
                }}
              >
                {renderTimingLabel(res)}

                {res.areas.length > 0 ? renderTimingTooltip(res) : <></>}
              </Index.Box>
            );
          })}
        </Index.Box>
      </Index.Box>
    );
  };

  const getTimingClass = (res) => {
    const { availableSeat, totalSeat } = getSeatInfo(res);
    if (!isTimeGt(PagesIndex.moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")))
      return "movie-timing lapsed-show";
    if (availableSeat === 0) return "movie-timing sold-out";
    if (availableSeat / totalSeat <= 0.6) return "movie-timing almost-full";
    return "movie-timing";
  };

  const renderTimingLabel = (res) => {
    return (
      <>
        {PagesIndex.moment(res.startTime).format("hh:mm A")}
        <Index.Typography
          variant="span"
          component="span"
          className="movie-timing-label"
        >
          {getAttributes(res)}
        </Index.Typography>
      </>
    );
  };

  const renderTheatreShows = (item) => {
    return (
      <Index.Box
        key={item?.cinemaDetails?._id}
        className={
          filteredMovieShows?.length < 3
            ? "theatre-shows-box big"
            : "theatre-shows-box"
        }
      >
        <Index.Box className="theatre-shows-left">
          {renderTheatreName(item)}
          <Index.Box className="theatre-info">
            {renderMovieCancellation(item)}
            {item?.cinemaDetails?.cinemaAmenities?.length &&
              renderMovieInfo(item.cinemaDetails.cinemaAmenities)}
          </Index.Box>
          {renderTheatreLocation(item)}
        </Index.Box>
        {item?.timings?.length ? (
          renderTimingBox(item.timings, item)
        ) : (
          <Index.Box className="theatre-shows-right">No shows found</Index.Box>
        )}
      </Index.Box>
    );
  };

  const renderTheatreName = (item) => {
    return (
      <Index.Typography variant="p" component="p" className="theatre-name">
        {item.cinemaDetails?.displayName}
      </Index.Typography>
    );
  };

  const renderTheatreLocation = (item) => {
    return (
      <Index.Typography variant="p" component="p" className="theatre-location">
        <Index.FmdGoodIcon />
        {item.cinemaDetails?.address}
      </Index.Typography>
    );
  };

  const renderMovieCancellation = (item) => {
    return (
      <Index.Box className="movie-cancellation">
        {item?.cinemaDetails?.cinemaAmenities?.includes("Ticket Cancellation")
          ? "Cancellation Available"
          : "Cancellation Not Available"}
      </Index.Box>
    );
  };

  const renderMovieInfo = (cinemaAmenities) => {
    return (
      <Index.Box className="movie-info">
        <Index.InfoOutlinedIcon className="info" />
        INFO
        <Index.Box className="movie-info-tooltip">
          {cinemaAmenities.map((amenity) => renderAmenityTooltip(amenity))}
        </Index.Box>
      </Index.Box>
    );
  };

  const renderAmenityTooltip = (amenity) => {
    const amenityInfo = getAmenityInfo(amenity);
    if (!amenityInfo) return null;
    return (
      <Index.Box key={amenityInfo.key} className="movie-info-tooltip-inner">
        <img
          src={amenityInfo.icon}
          width="24"
          height="24"
          alt={amenityInfo.alt}
        />
        {amenityInfo.alt}
      </Index.Box>
    );
  };

  const getAmenityInfo = (amenity) => {
    const amenitiesMap = {
      "Ticket Cancellation": {
        key: "TicketCancellation",
        icon: PagesIndex.Svg.TicketCancellation,
        alt: "Ticket Cancellation",
      },
      "Wheelechair Facility": {
        key: "WheelChairFacility",
        icon: PagesIndex.Svg.WheelChair,
        alt: "Wheel Chair Facility",
      },
      "Parking Facility": {
        key: "ParkingFacility",
        icon: PagesIndex.Svg.Parking,
        alt: "Parking Facility",
      },
      "M Ticket": {
        key: "MTicket",
        icon: PagesIndex.Svg.MTicket,
        alt: "MTicket",
      },
      "F&B": {
        key: "FoodAndBeverages",
        icon: PagesIndex.Svg.FoodAndBeverages,
        alt: "F&B",
      },
    };
    return amenitiesMap[amenity];
  };

  const getAttributes = (res) => {
    return res.aData
      ?.split("|")
      ?.filter((data) => data?.includes("SCREENATTRIBUTES"))
      ?.join("")
      ?.split("SCREENATTRIBUTES=")
      ?.filter((data) => data)
      ?.join(", ");
  };

  const getSeatInfo = (res) => {
    console.log(res, "res");
    const availableSeat = res.areas.reduce((a, b) => a + b.aSeats, 0);
    const totalSeat = res.areas.reduce((a, b) => a + b.tSeats, 0);
    return { availableSeat, totalSeat };
  };

  const isTimeGt = (startTime) => {
    const currentTime = PagesIndex.moment().format(
      "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
    );
    return startTime > currentTime;
  };

  // Handle timing click logic here
  const handleTimingClick = (res, item) => {
    setMoviePriceAndTimeFilter();
    if (
      isTimeGt(
        PagesIndex.moment(res?.startTime).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
      )
    ) {
      if (censorRating === "A" || censorRating === "A++") {
        handleWarning({
          state: {
            cId: item.cinemaDetails?.cinemaId,
            c_Id: item.cinemaDetails?._id,
            show_Time: PagesIndex.moment(res.startTime).format("hh:mm A"),
            showDate: selectedDate,
            priceDetails: res?.priceDetails,
          },
        });
      } else {
      // if ((filmOpeningDate <= PagesIndex.moment().format("YYYY-MM-DD")) && (filmOpeningDate <= selectedDate)) {
        navigate(
          {
            pathname: "/seat-management",
            search: PagesIndex.createSearchParams({
              mId: movieId,
              rId: regionId,
            }).toString(),
          },
          {
            state: {
              cId: item.cinemaDetails?.cinemaId,
              c_Id: item.cinemaDetails?._id,
              show_Time: PagesIndex.moment(res.startTime).format("hh:mm A"),
              showDate: selectedDate,
              priceDetails: res?.priceDetails,
              filmCode:movieDetail?.filmCode
            },
          }
        );
      } 
      // else {
      //   PagesIndex.toast.error("Movie not released yet");
      // }

      // navigate(
      //   {
      //     pathname: "/seat-management",
      //     search: PagesIndex.createSearchParams({
      //       mId: movieId,
      //       rId: regionId,
      //     }).toString(),
      //   },
      //   {
      //     state: {
      //       cId: item.cinemaDetails?.cinemaId,
      //       c_Id: item.cinemaDetails?._id,
      //       show_Time: PagesIndex.moment(res.startTime).format("hh:mm A"),
      //       showDate: selectedDate,
      //       priceDetails: res?.priceDetails,
      //     },
      //   }
      // );
      // }
    }
  };
  return (
    <Index.Box className="cus-container">
      <Index.Box className="detail-tab-content">
        <Index.Box className="detail-tab-header">
          <Index.Box className="detail-tab-date">
            <PagesIndex.Swiper
              modules={[PagesIndex.Navigation]}
              slidesPerView={"auto"}
              spaceBetween={10}
              breakpoints={{
                1024: {
                  slidesPerView: 6,
                  spaceBetween: 12,
                },
              }}
              navigation={{
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next",
              }}
              {...props}
            >
              {showDays.map((item, key) => {
                return (
                  <PagesIndex.SwiperSlide
                    key={item?.paramDate}
                    className={`date-item ${item.selected && "slide-active"}`}
                    onClick={() => {
                      setSelectedDate(item?.paramDate);
                      setShowDays((e) => {
                        let arr = [...e];
                        let unSelected = arr.map((e) => ({
                          ...e,
                          selected: false,
                        }));
                        unSelected[key].selected = true;
                        return unSelected;
                      });
                    }}
                  >
                    <Index.Typography variant="p" component="p" className="day">
                      {item.day}
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="date"
                    >
                      {item.date}
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="month"
                    >
                      {item.month}
                    </Index.Typography>
                  </PagesIndex.SwiperSlide>
                );
              })}
            </PagesIndex.Swiper>
            <Index.Box className="swiper-button-prev" />
            <Index.Box className="swiper-button-next" />
          </Index.Box>
          <Index.Box className="detail-tab-filter">
            {/* <div className="filter-dropdown-main language-category-dropdown">
              <div className="filter-drop-btn">
                <p className="filter-btn-title">Hindi 2D</p>
                <img
                  src={PagesIndex.Svg.ArrowDownIcon}
                  className="filter-down-arrow"
                  alt="arrow down"
                />
              </div>
              <ul className="filter-ul">
                <li className="filter-li active">
                  <p className="filter-data-text">Hindi 2D</p>
                </li>
                <li className="filter-li">
                  <p className="filter-data-text">Hindi 3D</p>
                </li>
                <li className="filter-li">
                  <p className="filter-data-text">English 3D</p>
                </li>
              </ul>
            </div> */}
            <div
              id="price-range-dropdown"
              className="filter-dropdown-main price-range-dropdown"
              onMouseLeave={() => {
                const timeFilter = document.getElementById(
                  "price-range-dropdown"
                );
                timeFilter?.childNodes[1].classList.remove("show-dropdown");
              }}
            >
              <div
                className="filter-drop-btn"
                onClick={(e) => dropDownHandle(e, "price-range-dropdown")}
                onKeyDown={(e) => dropDownHandle(e, "price-range-dropdown")}
              >
                <p className="filter-btn-title">Price Range</p>
                <img
                  src={PagesIndex.Svg.ArrowDownIcon}
                  className="filter-down-arrow"
                  alt="arrow down"
                />
              </div>
              <ul className="filter-ul">
                {movieShowPrices?.map((item, key) => {
                  return (
                    <li className="filter-li" key={item?.id}>
                      <div className="filter-check-flex">
                        <Index.FormControlLabel
                          label={
                            <p className="filter-data-text">
                              Rs. {item?.startPrice}-{item?.endPrice}
                            </p>
                          }
                          control={
                            <Index.Checkbox
                              className="filter-checkbox"
                              onClick={(e) => {
                                priceFilter(
                                  key,
                                  e.target.checked,
                                  item?.startPrice,
                                  item?.endPrice
                                );
                              }}
                              checked={item?.checked}
                            />
                          }
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div
              id="show-time-dropdown"
              className="filter-dropdown-main show-time-dropdown"
              onMouseLeave={() => {
                const timeFilter =
                  document.getElementById("show-time-dropdown");
                timeFilter?.childNodes[1].classList.remove("show-dropdown");
              }}
            >
              <div
                className="filter-drop-btn"
                onClick={(e) => dropDownHandle(e, "show-time-dropdown")}
                onKeyDown={(e) => dropDownHandle(e, "show-time-dropdown")}
              >
                <p className="filter-btn-title">Show Time</p>
                <img
                  src={PagesIndex.Svg.ArrowDownIcon}
                  className="filter-down-arrow"
                  alt="arrow down"
                />
              </div>
              <ul className="filter-ul">
                {movieShowTimings.map((item, key) => {
                  return (
                    <li className="filter-li" key={item?.id}>
                      <Index.FormControlLabel
                        label={
                          <>
                            <p className="filter-data-text">
                              {item?.startTime}-{item?.endTime} {item?.period}
                            </p>

                            <div className="filter-check-flex">
                              <p className="filter-time-text">{item.dayTime}</p>
                              <img
                                src={item.icon}
                                className="show-time-icons"
                                alt="show time"
                              />
                            </div>
                          </>
                        }
                        control={
                          <Index.Checkbox
                            className="filter-checkbox"
                            onClick={(e) => {
                              dateFilter(
                                key,
                                e.target.checked,
                                PagesIndex.moment(
                                  `${item?.startTime}${item?.period}`,
                                  "HH:mm A"
                                ).format("HH:mm"),
                                PagesIndex.moment(
                                  `${item?.endTime}${item?.period}`,
                                  "HH:mm A"
                                ).format("HH:mm")
                              );
                            }}
                            checked={item?.checked}
                          />
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </Index.Box>
        </Index.Box>
        <Index.Box className="detail-tab-body">
          <Index.Box className="detail-tab-body-top">
            <Index.Box className="detail-tab-search">
              <Index.SearchIcon />
              <Index.TextField
                fullWidth
                id="movieSearch"
                className="form-control"
                placeholder="Search here"
                onChange={(e) => {
                  setFilteredMovieShows(
                    movieShows?.filter((data) =>
                      data?.cinemaDetails?.displayName
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase())
                    )
                  );
                }}
              />
            </Index.Box>
            <Index.Box className="detail-tab-availability">
              <Index.Typography
                variant="span"
                component="span"
                className="available"
              >
                Available
              </Index.Typography>
              <Index.Typography
                variant="span"
                component="span"
                className="fast-filling"
              >
                Filling Fast
              </Index.Typography>
              <Index.Typography
                variant="span"
                component="span"
                className="sold-out"
              >
                Sold Out
              </Index.Typography>
              <Index.Typography
                variant="span"
                component="span"
                className="lapsed"
              >
                Lapsed
              </Index.Typography>
            </Index.Box>
          </Index.Box>
          <Index.Box className="detail-tab-body-bottom">
            {filterShows?.filter((data) => data?.timings?.length)?.length ? (
              filterShows
                ?.filter((data) => data?.timings?.length)
                ?.map((item, key) => {
                  return renderTheatreShows(item);
                })
            ) : (
              <Index.Box className="no-found-img-box">
               <AppTeatreSvgIcon />
                No Theatre Available
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box>
      <Index.Modal
        open={openWarning}
        onClose={handleWarningClose}
        aria-labelledby="warning-modal-title"
        aria-describedby="warning-modal-description"
        className="warning-modal common-modal"
      >
        <Index.Box className="warning-modal-inner common-modal-inner">
          <Index.Box className="warning-modal-title common-modal-title">
            Warning
          </Index.Box>
          <Index.Box className="modal-inner cus-scrollbar">
            <Index.Box className="warning-modal-content">
              <Index.Typography variant="p" component="p">
                This movie has been rated 'A' and is for audiances above the age
                of 18. Please carry a valid ID/Age proof to theatre. No refund
                of tickets once bought.
              </Index.Typography>
            </Index.Box>
          </Index.Box>
          <Index.Box className="warning-modal-btn">
            <PagesIndex.Button
              primary
              onClick={() => {
                // if ((filmOpeningDate <= PagesIndex.moment().format("YYYY-MM-DD")) && (filmOpeningDate <= selectedDate)) {
                  navigate(
                    {
                      pathname: "/seat-management",
                      search: PagesIndex.createSearchParams({
                        mId: movieId,
                        rId: regionId,
                      }).toString(),
                    },
                    showData
                  );
                  handleWarningClose()
                // } else {
                //   PagesIndex.toast.error("Movie not released yet");
                //   handleWarningClose();
                // }
              }}
            >
              Okay
            </PagesIndex.Button>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </Index.Box>
  );
}

export default DetailTabContent;
