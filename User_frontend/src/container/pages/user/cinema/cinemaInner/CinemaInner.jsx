import React, { useState, useEffect } from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";
import { FreeMode } from "swiper/modules";
import AppTeatreSvgIcon from "../../../../../components/icons/AppTeatreSvgIcon";

export default function CinemaInner({ props }) {
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
  const showTypeItem = [
    {
      id: 1,
      languages: "HINDI",
      type: "2D",
      checked: false,
    },
    {
      id: 2,
      languages: "HINDI",
      type: "3D",
      checked: false,
    },
    {
      id: 3,
      languages: "ENGLISH",
      type: "2D",
      checked: false,
    },
    {
      id: 4,
      languages: "ENGLISH",
      type: "3D",
      checked: false,
    },
  ];
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();
  const { region } = PagesIndex.useSelector((state) => state.UserReducer);

  const cinemaId = new URLSearchParams(location.search).get("cId");
  const regionId = new URLSearchParams(location.search).get("rId");

  const [cinemaDetails, setCinemaDetails] = useState([]);
  const [movieShows, setMovieShows] = useState([]);
  const [searchFilteredMovieShows, setSearchFilteredMovieShows] = useState([]);
  const [filteredMovieShows, setFilteredMovieShows] = useState([]);
  const [showDays, setShowDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    PagesIndex.moment().format("YYYY-MM-DD")
  );
  const [searchString, setSearchString] = useState("");
  const [timings, setTimings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [movieShowTimings, setMovieShowTimings] = useState(showTimeItem);
  const [movieShowPrices, setMovieShowPrices] = useState(showPriceItem);
  const [movieShowTypes, setMovieShowTypes] = useState(showTypeItem);
  const [searchData, setSearchData] = useState({});
  const [showData, setShowData] = useState({});
  const [openWarning, setOpenWarning] = useState(false);
  const [selectedShowType, setSelectedShowType] = useState([]);

  useEffect(() => {
    if (regionId !== region?._id) navigate("/cinema");
  }, [region]);

  useEffect(() => {
    getWeekDays();
  }, []);
  useEffect(() => {
    getMovieShowDetails(selectedDate);
  }, [selectedDate, cinemaId, region]);
  useEffect(() => {
    if (timings?.length && prices?.length) {
      priceFilterFunction(timeFilterFunction());
    } else if (prices.length) {
      priceFilterFunction();
    } else if (timings.length) {
      timeFilterFunction();
    } else if (selectedShowType?.length) {
      movieTypeFilterFun();
    } else {
      setFilteredMovieShows(
        searchString ? searchFilteredMovieShows : movieShows
      );
    }
  }, [timings, prices, movieShows, searchFilteredMovieShows, selectedShowType]);
  const getWeekDays = () => {
    let days = [];
    let daysRequired = cinemaDetails?.showExtendedDays || 10;
    for (let i = 0; i <= daysRequired; i++) {
      const a = PagesIndex.moment();
      const b = PagesIndex.moment().add(i, "days");
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

  function getMovieShowDetails(selectedDate) {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("cinemaId", cinemaId);
    urlEncoded.append("regionId", regionId);
    urlEncoded.append("date", selectedDate);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.GET_MOVIE_SHOW_BY_CINEMA,
      urlEncoded
    )
      .then((res) => {
        setCinemaDetails(res.data?.cinemaDetails);

        let filteredRes = res.data?.movieDetailsWithShows.map((data) => {
          return {
            ...data,
            shows: data.shows?.filter((item) => {
              let startTime = PagesIndex.moment(item?.sessionRealShow).format(
                "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
              );
              let currentTime = PagesIndex.moment().format(
                "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
              );
              let timeisGt = startTime < currentTime;
              return !timeisGt;
            }),
          };
        });
        setSearchFilteredMovieShows(filteredRes)
        setMovieShows(filteredRes);
        dispatch(PagesIndex.hideLoader());
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
      });
  }
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
      setTimings((prev) => prev.filter((data) => data?.endTime !== endTime));
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
      setPrices((prev) => prev.filter((data) => data?.endPrice !== endPrice));
    }
  };

  const movieTypeFilter = (index, checked, language, type, id) => {
    setMovieShowTypes((e) => {
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
      setSelectedShowType((prev) => [
        ...prev,
        {
          id,
          language,
          type,
        },
      ]);
    } else {
      setSelectedShowType((prev) => prev.filter((data) => data?.id !== id));
    }
  };

  const timeFilterFunction = () => {
    let movie = searchString ? searchFilteredMovieShows : movieShows;
    let data = movie?.map((e) => {
      return {
        ...e,
        shows: e.shows?.filter((el) => {
          const validTime = timings.some((ele) => {
            const startTime = PagesIndex.moment(el.sessionRealShow).format(
              "HH:mm"
            );
            return (
              PagesIndex.moment(startTime, "HH:mm").format("X") <=
                +PagesIndex.moment(ele.endTime, "HH:mm").format("X") &&
              PagesIndex.moment(startTime, "HH:mm").format("X") >=
                +PagesIndex.moment(ele.startTime, "HH:mm").format("X")
            );
          });
          if (validTime && timings?.length) {
            return {
              ...el,
            };
          }
        }),
      };
    });
    setFilteredMovieShows(data);
    return data;
  };

  const movieTypeFilterFun = () => {
    let movie = searchString ? searchFilteredMovieShows : movieShows;
    let data = movie?.filter((e) => {
      let check = selectedShowType.some((elem) => {
        if (
          elem.type == "2D" &&
          !e.movieDetails.movieType.includes("3D") &&
          e.movieDetails.name.includes(elem.language)
        ) {
          return !e.movieDetails.movieType.includes("3D");
        } else if (
          elem.type == "3D" &&
          e.movieDetails.movieType.includes("3D") &&
          e.movieDetails.name.includes(elem.language)
        ) {
          return e.movieDetails.movieType.includes(elem.type);
        } else {
          return false;
        }
      });
      if (check) {
        return e;
      } else {
        return false;
      }
    });

    setFilteredMovieShows(data);

    return data;
  };

  const isValidPrice = (elePrice, price) => {
    if (price.endPrice === "Max") {
      return elePrice >= price.startPrice;
    } else {
      return elePrice <= price.endPrice && elePrice >= price.startPrice;
    }
  };

  const priceFilterFunction = (movieData) => {
    let movie =
      movieData || searchString ? searchFilteredMovieShows : movieShows;
    let data = movie?.map((e) => {
      return {
        ...e,
        shows: e.shows?.filter((el) => {
          let validPrice = false;
          el?.timing?.areas?.map((ele) => {
            if (
              prices.some((elem) => {
                if (elem.endPrice === "Max") {
                  return ele.price >= elem.startPrice;
                } else if (elem.endPrice !== "Max") {
                  return (
                    ele.price <= elem.endPrice && ele.price >= elem.startPrice
                  );
                }
              })
            ) {
              validPrice = true;
            }
          });
          if (validPrice && prices?.length) {
            return {
              ...el,
            };
          }
        }),
      };
    });
    setFilteredMovieShows(data);

    return data;
  };

  const handleWarning = (searchData, showData) => {
    setSearchData(searchData);
    setShowData(showData);
    setOpenWarning(true);
  };
  const handleWarningClose = () => {
    setOpenWarning(false);
  };
  const dropDownHandle = (e, className) => {
    e.stopPropagation();
    e.preventDefault();
    const timeFilter = document.getElementById(className);
    timeFilter.childNodes[1].classList.toggle("show-dropdown");
    timeFilter.childNodes[0].classList.toggle("show-dropdown");
  };

  const amenityIcons = {
    "Ticket Cancellation": PagesIndex.Svg.TicketCancellation,
    "Wheelchair Facility": PagesIndex.Svg.WheelChair,
    "Parking Facility": PagesIndex.Svg.Parking,
    "M Ticket": PagesIndex.Svg.MTicket,
    "F&B": PagesIndex.Svg.FoodAndBeverages
  };

  return (
    <Index.Box className="main-cinema-inner">
      <Index.Box className="cus-container">
        <Index.Box className="cinema-header">
          <Index.Box className="cinema-inner-slider">
            <PagesIndex.Swiper
              speed={500}
              spaceBetween={10}
              slidesPerView={1.1}
              modules={[PagesIndex.Navigation]}
              navigation={true}
              breakpoints={{
                550: {
                  slidesPerView: 1.2,
                  spaceBetween: 15,
                },
              }}
            >
              {cinemaDetails?.cinema_images?.map((item, key) => (
                <PagesIndex.SwiperSlide key={key}>
                  <Index.Box className="cinema-inner-slider-img">
                    <img
                      src={
                        item
                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item}`
                          : PagesIndex.Png.NoImage
                      }
                      alt="cinema-inner"
                    />
                  </Index.Box>
                </PagesIndex.SwiperSlide>
              ))}
            </PagesIndex.Swiper>
          </Index.Box>
          <Index.Typography
            variant="h1"
            component="h1"
            className="cinema-header-title"
          >
            {cinemaDetails?.displayName}
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="theatre-location"
          >
            <Index.FmdGoodIcon />
            {cinemaDetails?.address}
          </Index.Typography>
        </Index.Box>
        <Index.Box className="movie-detail-tab-wrapper">
          <Index.Box className="detail-tab-content">
            <Index.Box className="detail-tab-header">
              <Index.Box className="detail-tab-date">
                <PagesIndex.Swiper
                  freeMode={true}
                  modules={[PagesIndex.Navigation, FreeMode]}
                  slidesPerView={"auto"}
                  spaceBetween={10}
                  breakpoints={{
                    1024: {
                      slidesPerView: 6,
                      spaceBetween: 12,
                    },
                  }}
                  navigation={{
                    prevEl: ".swiper-button-prev.detail-tab-date-nav",
                    nextEl: ".swiper-button-next.detail-tab-date-nav",
                  }}
                  {...props}
                >
                  {showDays.map((item, key) => (
                    <PagesIndex.SwiperSlide
                      key={key}
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
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="day"
                      >
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
                  ))}
                </PagesIndex.Swiper>
                <Index.Box className="swiper-button-prev detail-tab-date-nav" />
                <Index.Box className="swiper-button-next detail-tab-date-nav" />
              </Index.Box>
              <Index.Box className="detail-tab-filter">
                {/* <div className="filter-dropdown-main language-category-dropdown">
                  <div className="filter-drop-btn">
                    <p className="filter-btn-title">Hindi 2D</p>
                    <img
                      src={PagesIndex.Svg.ArrowDownIcon}
                      onClick={(e) => dropDownHandle(e, "movieType-range-dropdown")}
                      onKeyDown={(e) => dropDownHandle(e, "movieType-range-dropdown")}
                      className="filter-down-arrow"
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
                  id="movieType-range-dropdown"
                  className="filter-dropdown-main movieType-range-dropdown"
                  onMouseLeave={(e) => {
                    const movieTypeFilter = document.getElementById(
                      "movieType-range-dropdown"
                    );
                    movieTypeFilter?.childNodes[1].classList.remove(
                      "show-dropdown"
                    );
                    movieTypeFilter?.childNodes[0].classList.remove(
                      "show-dropdown"
                    );
                  }}
                >
                  <div
                    className="filter-drop-btn"
                    onClick={(e) =>
                      dropDownHandle(e, "movieType-range-dropdown")
                    }
                    onKeyDown={(e) =>
                      dropDownHandle(e, "movieType-range-dropdown")
                    }
                  >
                    <p className="filter-btn-title">Movie Category</p>
                    <img
                      src={PagesIndex.Svg.ArrowDownIcon}
                      className="filter-down-arrow"
                    />
                  </div>
                  <ul className="filter-ul">
                    {movieShowTypes?.map((item, key) => {
                      return (
                        <li className="filter-li" key={key}>
                          <div className="filter-check-flex">
                            <Index.FormControlLabel
                              label={
                                <p className="filter-data-text">
                                  {item?.languages}-{item?.type}
                                </p>
                              }
                              control={
                                <Index.Checkbox
                                  className="filter-checkbox"
                                  onClick={(e) => {
                                    movieTypeFilter(
                                      key,
                                      e.target.checked,
                                      item?.languages,
                                      item?.type,
                                      item?.id
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
                  id="price-range-dropdown"
                  className="filter-dropdown-main price-range-dropdown"
                  onMouseLeave={(e) => {
                    const timeFilter = document.getElementById(
                      "price-range-dropdown"
                    );
                    timeFilter?.childNodes[1].classList.remove("show-dropdown");
                    timeFilter?.childNodes[0].classList.remove("show-dropdown");
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
                    />
                  </div>
                  <ul className="filter-ul">
                    {movieShowPrices?.map((item, key) => {
                      return (
                        <li className="filter-li" key={key}>
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
                    timeFilter?.childNodes[0].classList.remove("show-dropdown");
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
                    />
                  </div>
                  <ul className="filter-ul">
                    {movieShowTimings.map((item, key) => {
                      return (
                        <li className="filter-li" key={key}>
                          <Index.FormControlLabel
                            label={
                              <>
                                <p className="filter-data-text">
                                  {item?.startTime}-{item?.endTime}{" "}
                                  {item?.period}
                                </p>

                                <div className="filter-check-flex">
                                  <p className="filter-time-text">
                                    {item.dayTime}
                                  </p>
                                  <img
                                    src={item.icon}
                                    className="show-time-icons"
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
                    value={searchString}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setSearchString(inputValue); // Keep the full input value, including spaces 

                      const trimmedValue = inputValue.trim(); // Trim only for searching purposes

                      if (trimmedValue) {
                        setSearchFilteredMovieShows(
                          movieShows.filter((data) =>
                            data?.movieDetails?.name.toLowerCase().includes(trimmedValue.toLowerCase())
                          )
                        );
                      } else {
                        setSearchFilteredMovieShows(movieShows);
                      }
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
                    FILLING FAST
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
              <Index.Box className="detail-tab-body-bottom">
                {filteredMovieShows.filter((item) => item?.shows?.length)
                  .length ? (
                  filteredMovieShows
                    .filter((item) => item?.shows?.length)
                    .map((item, key) => {
                      return (
                        <Index.Box
                          key={key}
                          className={
                            filteredMovieShows?.length < 3
                              ? "theatre-shows-box big"
                              : "theatre-shows-box"
                          }
                        >
                          <Index.Box className="theatre-shows-left">
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="theatre-name"
                            >
                              {item?.movieDetails?.name} |{" "}
                              {item?.movieDetails?.censorRating}
                            </Index.Typography>
                            <Index.Typography
                              variant="p"
                              component="p"
                              className="theatre-location"
                            >
                              <Index.FmdGoodIcon />
                              {item?.movieDetails?.languages &&
                                `${item?.movieDetails?.languages} | `}
                              {item?.movieDetails?.movieType?.includes("3D")
                                ? "3D"
                                : "2D"}
                            </Index.Typography>
                            <Index.Box className="theatre-info">
                              <Index.Box className="movie-cancellation">
                                Cancellation Available
                              </Index.Box>
                              <Index.Box className="movie-info">
                                <Index.InfoOutlinedIcon className="info" />
                                INFO
                                <Index.Box className="movie-info-tooltip">
                                  {cinemaDetails?.cinemaAmenities?.map((item) => (
                                    <Index.Box className="movie-info-tooltip-inner" key={item}>
                                      {amenityIcons[item] && (
                                        <img
                                          src={amenityIcons[item]}
                                          width="24"
                                          height="24"
                                          alt={item}
                                        />
                                      )}
                                      {item}
                                    </Index.Box>
                                  ))}
                                </Index.Box>
                              </Index.Box>
                            </Index.Box>
                          </Index.Box>
                          {item?.shows?.length ? (
                            <Index.Box className="theatre-shows-right">
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="movie-lang"
                              >
                                {item?.movieDetails?.languages &&
                                  `${item?.movieDetails?.languages} - `}
                                {item?.movieDetails?.movieType?.includes("3D")
                                  ? "3D"
                                  : "2D"}
                              </Index.Typography>
                              <Index.Box className="movie-timing-box">
                                {item?.shows?.map((res, key) => {
                                  const attributes = res?.sessionAdditionalData
                                    ?.split("|")
                                    .filter((data) =>
                                      data?.includes("SCREENATTRIBUTES")
                                    )
                                    ?.join("")
                                    ?.split("SCREENATTRIBUTES=")
                                    .filter((data) => data)
                                    ?.join(", ");
                                  return (
                                    <Index.Box
                                      component={"button"}
                                      key={key}
                                      className={`movie-timing`}
                                      onClick={() => {
                                        let startTime = PagesIndex.moment(
                                          res?.sessionRealShow
                                        ).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                                        let currentTime =
                                          PagesIndex.moment().format(
                                            "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                                          );
                                        let timeisGt = startTime > currentTime;
                                        if (timeisGt) {
                                          if (
                                            item?.movieDetails?.censorRating ===
                                              "A" ||
                                            item?.movieDetails?.censorRating ===
                                              "A++"
                                          ) {
                                            handleWarning(
                                              PagesIndex.createSearchParams({
                                                mId: item?.movieDetails?._id,
                                                rId: region?._id,
                                              }).toString(),

                                              {
                                                state: {
                                                  cId: cinemaDetails?.cinemaId,
                                                  c_Id: cinemaDetails?._id,
                                                  show_Time: PagesIndex.moment(
                                                    res.sessionRealShow
                                                  ).format("hh:mm A"),
                                                  showDate: selectedDate,
                                                },
                                              }
                                            );
                                          } else {
                                            navigate(
                                              {
                                                pathname: "/seat-management",
                                                search:
                                                  PagesIndex.createSearchParams(
                                                    {
                                                      mId: item?.movieDetails
                                                        ?._id,
                                                      rId: region?._id,
                                                    }
                                                  ).toString(),
                                              },
                                              {
                                                state: {
                                                  cId: cinemaDetails?.cinemaId,
                                                  c_Id: cinemaDetails?._id,
                                                  show_Time: PagesIndex.moment(
                                                    res.sessionRealShow
                                                  ).format("hh:mm A"),
                                                  showDate: selectedDate,
                                                },
                                              }
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      {PagesIndex.moment(
                                        res?.sessionRealShow
                                      ).format("hh:mm A")}
                                      <Index.Typography
                                        variant="span"
                                        component="span"
                                        className="movie-timing-label"
                                      >
                                        {attributes}
                                      </Index.Typography>

                                      {res?.timing?.areas.length > 0 ? (
                                        <Index.Box
                                          key={key}
                                          className="movie-timing-tooltip"
                                        >
                                          {res?.timing?.areas.map(
                                            (resItem, key) => (
                                              <Index.Box key={key}>
                                                <Index.Typography
                                                  variant="p"
                                                  component="p"
                                                  className="timing-tooltip-price"
                                                >
                                                  {resItem.price}
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
                                                  className={`timing-tooltip-availability ${
                                                    resItem === "Y"
                                                      ? "filling-fast"
                                                      : resItem === "R"
                                                      ? "sold-out"
                                                      : "available"
                                                  }`}
                                                >
                                                  {resItem === "Y"
                                                    ? "Filling Fast"
                                                    : resItem === "R"
                                                    ? resItem === "R" &&
                                                      resItem.aSeats
                                                      ? "Almost Full"
                                                      : "Sold Out"
                                                    : "Available"}
                                                </Index.Typography>
                                              </Index.Box>
                                            )
                                          )}
                                        </Index.Box>
                                      ) : (
                                        <></>
                                      )}
                                    </Index.Box>
                                  );
                                })}
                              </Index.Box>
                            </Index.Box>
                          ) : (
                            <Index.Box className="theatre-shows-right">
                              No Shows Available
                            </Index.Box>
                          )}
                        </Index.Box>
                      );
                    })
                ) : (
                  <Index.Box className="no-found-img-box">
                    <AppTeatreSvgIcon />
                    No Movies Available
                  </Index.Box>
                )}
              </Index.Box>
            </Index.Box>
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
                navigate(
                  {
                    pathname: "/seat-management",
                    search: searchData,
                  },
                  showData
                );
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
