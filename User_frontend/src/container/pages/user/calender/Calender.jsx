import React, { useEffect, useState, useRef } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import SEO from "../../../../components/common/SEO";

function Calender({ props }) {
  const categories = [
    {
      category: "All genres",
      value: "",
    },
    {
      category: "Action",
      value: "Action",
    },
    {
      category: "Adventure",
      value: "Adventure",
    },
    {
      category: "Animation",
      value: "Animation",
    },
    {
      category: "Biography",
      value: "Biography",
    },
    {
      category: "Comedy",
      value: "Comedy",
    },
    {
      category: "Crime",
      value: "Crime",
    },
    {
      category: "Drama",
      value: "Drama",
    },
    {
      category: "Fantasy",
      value: "Fantasy",
    },
    {
      category: "History",
      value: "History",
    },
    {
      category: "Horror",
      value: "Horror",
    },
    {
      category: "Musical",
      value: "Musical",
    },
    {
      category: "Romance",
      value: "Romance",
    },
    {
      category: "Sports",
      value: "Sports",
    },
    {
      category: "Thriller",
      value: "Thriller",
    },
  ];
  const languages = [
    {
      language: "All languages",
      value: "",
    },
    {
      language: "Bengali",
      value: "Bengali",
    },
    {
      language: "English",
      value: "English",
    },
    {
      language: "Gujarati",
      value: "Gujarati",
    },
    {
      language: "Hindi",
      value: "Hindi",
    },
    {
      language: "Kannada",
      value: "Kannada",
    },
    {
      language: "Malayalam",
      value: "Malayalam",
    },
    {
      language: "Marathi",
      value: "Marathi",
    },
    {
      language: "Punjabi",
      value: "Punjabi",
    },
    {
      language: "Tamil",
      value: "Tamil",
    },
    {
      language: "Telugu",
      value: "Telugu",
    },
  ];
  const dispatch = PagesIndex.useDispatch();
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [filterMoviesList, setFilterMoviesList] = useState([]);
  const [filterMonths, setFilterMonths] = useState([]);
  const genreDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  useEffect(() => {
    getMoviesList();
  }, []);
  useEffect(() => {
    const movieData = moviesList?.map((data) => {
      return {
        month: data?.month,
        startDate: PagesIndex.moment(data?.month, "MMM YYYY")
          .startOf("month")
          .format("DD MMM"),
        endDate: PagesIndex.moment(data?.month, "MMM YYYY")
          .endOf("month")
          .format("DD MMM"),
        year: PagesIndex.moment(data?.month, "MMM YYYY").format("YYYY"),
        id: PagesIndex.moment(data?.month, "MMM YYYY").format("MMM_YYYY"),
        movies: data?.movies.filter((item) => {
          //  1 0 0
          if (filterCategory && !filterLanguage) {
            return item.category
              ?.toLowerCase()
              .includes(filterCategory.toLowerCase());
          }
          // 0 1 0
          else if (!filterCategory && filterLanguage) {
            return item.languages
              ?.toLowerCase()
              .includes(filterLanguage.toLowerCase());
          }
          // 1 1 0
          else if (filterCategory && filterLanguage) {
            return (
              item.languages
                ?.toLowerCase()
                .includes(filterLanguage.toLowerCase()) &&
              item.category
                ?.toLowerCase()
                .includes(filterCategory.toLowerCase())
            );
          }
          // 0 0 0
          else if (!filterCategory && !filterLanguage) {
            return item;
          }
        }),
      };
    });
    setFilterMoviesList(movieData);
  }, [filterCategory, filterLanguage]);
  const handleChangeGenre = (value) => {
    setFilterCategory(value);
  };
  const handleChangeLang = (value) => {
    setFilterLanguage(value);
  };
  const getMoviesList = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CALENDER_LIST).then((res) => {
      if (res?.status === 200) {
        const showsByMonth = [];
        res.data.map((data) => {
          const moviesList = data?.movies?.filter((item) => {
            let startTime = PagesIndex.moment(item?.filmOpeningDate).format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            );
            let currentTime = PagesIndex.moment().format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            );
            let timeisGt = startTime < currentTime;
            return !timeisGt;
          });
          if (moviesList.length) {
            showsByMonth.push({
              month: data?.month,
              startDate: PagesIndex.moment(data?.month, "MMM YYYY")
                .startOf("month")
                .format("DD MMM"),
              endDate: PagesIndex.moment(data?.month, "MMM YYYY")
                .endOf("month")
                .format("DD MMM"),
              year: PagesIndex.moment(data?.month, "MMM YYYY").format("YYYY"),
              id: PagesIndex.moment(data?.month, "MMM YYYY").format("MMM_YYYY"),
              movies: moviesList,
            });
          }
        });
        setMoviesList(showsByMonth);
        setFilterMoviesList(showsByMonth);
        getFutureMonths(
          PagesIndex.moment(
            res?.data?.[res?.data?.length - 1]?.month,
            "MMM YYYY"
          ).format("M") - PagesIndex.moment().format("M")
        );
      }
      dispatch(PagesIndex.hideLoader());
    });
  };
  const getFutureMonths = (length) => {
    let months = [];
    let monthsRequired = length;
    for (let i = 0; i <= monthsRequired; i++) {
      const a = PagesIndex.moment();
      const b = PagesIndex.moment().add(i, "months");
      let objData = {
        month: b.format("MMM"),
        year: b.format("YYYY"),
        id: b.format("MMM_YYYY"),
        selected: b.diff(a, "months") === 0,
      };
      months.push(objData);
    }
    setFilterMonths(months);
  };
  const dropDownHandle = (e, className) => {
    e.stopPropagation();
    e.preventDefault();
    const timeFilter = document.getElementById(className);
    timeFilter.childNodes[1].classList.toggle("show-dropdown");
  };
  const closeDropdown = (className) => {
    const timeFilter = document.getElementById(className);
    timeFilter?.childNodes[1].classList.remove("show-dropdown");
  };


  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        closeDropdown("genre-category-dropdown");
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        closeDropdown("lang-category-dropdown");
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <Index.Box className="main-calender">
      <SEO 
        title="Upcoming Movies" 
        description="Check out the upcoming movie releases at Connplex Cinemas. Stay ahead and plan your movie outings with our comprehensive movie calendar."
      />
      <PagesIndex.BannerImage
        bannerImage={PagesIndex.Jpg.upcomingBanner}
        bannerImageWidth="900"
        bannerImageHeight="570"
        bannerTitle="Upcoming"
      />
      <Index.Box className="calender-filter">
        <Index.Box className="cus-container">
          <Index.Box className="calender-filter-left">
            <PagesIndex.Swiper
              modules={[PagesIndex.Navigation]}
              slidesPerView={"auto"}
              spaceBetween={5}
              breakpoints={{
                550: {
                  slidesPerView: "auto",
                  spaceBetween: 10,
                },
                1024: {
                  slidesPerView: 6,
                  spaceBetween: 15,
                },
              }}
              navigation={{
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next",
              }}
              {...props}
            >
              {filterMonths.map((item, key) => (
                <PagesIndex.SwiperSlide key={item?.id}>
                  <Index.Box
                    className="calender-filter-item"
                    onClick={() => {
                      const element = document.getElementById(item?.id);
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  >
                    <Index.Typography
                      variant="span"
                      component="span"
                      className="filter-year"
                    >
                      {item.year}
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="filter-month"
                    >
                      {item.month}
                    </Index.Typography>
                  </Index.Box>
                </PagesIndex.SwiperSlide>
              ))}
            </PagesIndex.Swiper>
            <Index.Box className="swiper-button-prev" />
            <Index.Box className="swiper-button-next" />
          </Index.Box>
          <Index.Box className="calender-filter-right">
            <div
              ref={genreDropdownRef}
              id="genre-category-dropdown"
              className="filter-dropdown-main genre-category-dropdown"
              // onMouseLeave={() => {
              //   closeDropdown("genre-category-dropdown");
              // }}
            >
              <div
                className="filter-drop-btn"
                onClick={(e) => dropDownHandle(e, "genre-category-dropdown")}
                onKeyDown={(e) => dropDownHandle(e, "genre-category-dropdown")}
              >
                <p className="filter-btn-title">{filterCategory || "Genre"}</p>
                <img
                  src={PagesIndex.Svg.ArrowDownIcon}
                  className="filter-down-arrow"
                  alt="arrow-down"
                />
              </div>
              <ul className="filter-ul">
                {categories?.map((data) => {
                  return (
                    <li className="filter-li">
                      <div className="filter-check-flex">
                        <Index.FormControlLabel
                          label={
                            <p className="filter-data-text">{data?.category}</p>
                          }
                          control={
                            <></> // <Index.Checkbox className="filter-checkbox" />
                          }
                          onClick={() => {
                            closeDropdown("genre-category-dropdown");
                            handleChangeGenre(data?.value);
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div
              ref={languageDropdownRef}
              id="lang-category-dropdown"
              className="filter-dropdown-main lang-category-dropdown"
              // onMouseLeave={() => {
              //   closeDropdown("lang-category-dropdown");
              // }}
            >
              <div
                className="filter-drop-btn"
                onClick={(e) => dropDownHandle(e, "lang-category-dropdown")}
                onKeyDown={(e) => dropDownHandle(e, "lang-category-dropdown")}
              >
                <p className="filter-btn-title">
                  {filterLanguage || "Language"}
                </p>
                <img
                  src={PagesIndex.Svg.ArrowDownIcon}
                  className="filter-down-arrow"
                  alt="arrow-down"
                />
              </div>
              <ul className="filter-ul">
                {languages.map((data) => {
                  return (
                    <li className="filter-li">
                      <div className="filter-check-flex">
                        <Index.FormControlLabel
                          label={
                            <p className="filter-data-text">{data?.language}</p>
                          }
                          control={
                            <></> // <Index.Checkbox className="filter-checkbox" />
                          }
                          onClick={() => {
                            closeDropdown("lang-category-dropdown");
                            handleChangeLang(data?.value);
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      <Index.Box className="calender-body">
        <Index.Box className="cus-container">
          {filterMoviesList?.length ? (
            filterMoviesList?.map((item, key) => (
              <Index.Box
                key={item.id}
                className="upcoming-wrapper-box"
                id={item.id}
              >
                <Index.Box className="upcoming-heading">
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="upcoming-heading-year"
                  >
                    {item.year}
                  </Index.Typography>
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="upcoming-heading-month"
                  >
                    {item.startDate} - {item.endDate}
                  </Index.Typography>
                </Index.Box>
                {item.movies.length ? (
                  <Index.Box className="upcoming-card-wrapper">
                    {item.movies.map((res, key) => (
                      <Index.Box key={res?._id} className="upcoming-card">
                        <Index.Box className="upcoming-card-img">
                          <img
                            src={res.poster ? `${PagesIndex.IMAGES_API_ENDPOINT}/${res.poster}` : PagesIndex.Png.NoImage}
                            alt="movie"
                            width="585"
                            height="800"
                          />
                          <Index.Typography
                            variant="span"
                            component="span"
                            className="upcoming-card-icon"
                          >
                            <Index.OpenInNewIcon />
                          </Index.Typography>
                          <Index.Box className="upcoming-card-details">
                            <Index.Box className="">
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="card-details-genre"
                              >
                                {res.category}
                              </Index.Typography>
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="card-details-lang"
                              >
                                {res.languages}
                              </Index.Typography>
                              <Index.Typography
                                variant="p"
                                component="p"
                                className="card-details-cast-crew"
                              >
                                <Index.Typography
                                  variant="span"
                                  component="span"
                                  className="card-details-label"
                                >
                                  Cast & Crew :&nbsp;
                                </Index.Typography>
                                <Index.Typography
                                  variant="span"
                                  component="span"
                                  className="card-details-value"
                                >
                                  {res.starCast
                                    .map((data) => data?.starCastId?.name)
                                    .join(", ")}
                                </Index.Typography>
                              </Index.Typography>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="upcoming-card-title">
                          {res.name}
                        </Index.Box>
                        <Index.Box className="upcoming-card-release">
                          Releasing on{" "}
                          {PagesIndex.moment(res.filmOpeningDate).format(
                            "ddd MMM DD"
                          )}
                        </Index.Box>
                      </Index.Box>
                    ))}
                  </Index.Box>
                ) : (
                  <Index.Box className="upcoming-heading">
                    <Index.Typography
                      variant="span"
                      component="span"
                      className="upcoming-heading-month"
                    >
                      No Movies Available
                    </Index.Typography>
                  </Index.Box>
                )}
              </Index.Box>
            ))
          ) : (
            <Index.Box className="no-found-img-box">
              <img src={PagesIndex.Png.Theatre} alt="No Found" />
              No Upcoming Movies found
            </Index.Box>
          )}
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Calender;
