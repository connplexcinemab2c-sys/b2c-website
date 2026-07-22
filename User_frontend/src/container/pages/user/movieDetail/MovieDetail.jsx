import React, { useCallback, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import DetailTabContent from "./DetailTabContent";
import AboutTabContent from "./AboutTabContent";
import ReviewTabContent from "./ReviewTabContent";
import { Button } from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useSearchParams } from 'react-router-dom';

function MovieDetailTab(props) {
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
          <Index.Box>{children}</Index.Box>
        </Index.Box>
      )}
    </div>
  );
}

MovieDetailTab.propTypes = {
  children: PagesIndex.PropTypes.node,
  index: PagesIndex.PropTypes.number.isRequired,
  value: PagesIndex.PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function MovieDetail() {
  const [open, setOpen] = React.useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, region, userDetails, userToken } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const movieId = searchParams.get("mId");
  const regionId = searchParams.get("rId");

  const [value, setValue] = useState(0);
  const [movieShows, setMovieShows] = useState([]);
  const [filteredMovieShows, setFilteredMovieShows] = useState([]);
  const [modalTrailer, setModalTrailer] = useState(false);
  const [modalReview, setModalReview] = useState(false);
  const [movieDetail, setMovieDetail] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [message, setMessage] = useState("Share");
  const [interested, setInterested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [movieVersions, setMovieVersions] = useState([]);

  useEffect(() => {
    const activeRegionId = region?._id || regionId;
    if (!movieDetail?.name || !activeRegionId) return;
    
    PagesIndex.apiGetHandler(`${PagesIndex.Api.GET_MOVIES_BY_ID}/${activeRegionId}`)
      .then((res) => {
        if (res?.status === 200 && res.data) {
          const cleanName = (name) => {
            if (!name) return "";
            let base = name.replace(/\s*\([^)]*\)/g, "");
            base = base.replace(/\b(3D|2D)\b/gi, "");
            return base.replace(/\s+/g, " ").trim().toUpperCase();
          };
          
          const currentBase = cleanName(movieDetail.name);
          const currentDesc = movieDetail.description ? movieDetail.description.trim().toLowerCase() : "";

          const versions = res.data.filter((m) => {
            if (currentDesc && m.description && m.description.trim().toLowerCase() === currentDesc) {
              return true;
            }
            return cleanName(m.name) === currentBase;
          });
          setMovieVersions(versions);
        }
      })
      .catch((err) => console.error(err));
  }, [movieDetail?.name, movieDetail?.description, region?._id, regionId]);

  
  useEffect(() => {
    getMovieDetail();
  }, [movieId, isLoggedIn]);
  const signInOpen = () => {
    setToggle(true);
  };
  const signInClose = () => setToggle(false);
  function getMovieDetail() {
    dispatch(PagesIndex.showLoader());
    setIsLoading(true);
    PagesIndex.apiGetHandler(
      `${PagesIndex.Api.GET_MOVIEDETAILS}?movieId=${movieId}&userId=${userDetails?._id}` +
        `&timestamp=${new Date().getTime()}`
    ).then((res) => {
      if (res?.status === 200) {
        dispatch(PagesIndex.hideLoader());
        setMovieDetail(res?.data);
        setIsLiked(res?.data?.isLiked);
        setLikesCount(
          res?.data?.likes >= res?.data?.totalLikes - res?.data?.likes
            ? res?.data?.likes
            : res?.data?.totalLikes
        );
        setIsLoading(false);
      }
      else if(res?.status === 409){
        dispatch(PagesIndex.hideLoader());
        PagesIndex.toast.error(res?.message)
        navigate("/")
      }
    })
  }
  function getMovieShowDetails(selectedDate) {
    dispatch(PagesIndex.showLoader());
    setIsLoading(true);
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("id", `${region?._id}|${selectedDate}|${movieId}`);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.GET_MOVIE_SHOW_DETAILS,
      urlEncoded + `&timestamp=${new Date().getTime()}`
    )
      .then((res) => {
        setMovieShows(res?.data);
        setFilteredMovieShows(res?.data);
        dispatch(PagesIndex.hideLoader());
        setIsLoading(false);
      })
      .catch(() => {
        dispatch(PagesIndex.hideLoader());
        setIsLoading(false);
      });
  }

  function handleLikeDislike() {
    setIsLiked((prev) => {
      if (prev) {
        setLikesCount((prev) => prev - 1);
      }
      if (!prev) {
        setLikesCount((prev) => prev + 1);
      }
      return !prev;
    });
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("movieId", movieId);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.LIKE_DISLIKE_MOVIE,
      urlEncoded,
      userToken
    )
      .then((res) => {})
      .catch((error) => {console.log(error)});
  }
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  let durationValue = movieDetail?.duration ? movieDetail?.duration : "";
  const storeDuration = (durationValue) => {
    const durationInHours = parseFloat(durationValue);
  };
  const displayDuration = (durationInHours) => {
    if(durationInHours < 5){
      const hours = Math.floor(durationInHours);
      const minutes = Math.round((durationInHours - hours) * 100);
  
      return hours + "h " + minutes + "m";
    }else{
      return `0 hr`
    }
   
  };
  const timeConverter = (time) => {
    // let hours = Math.floor(time / 60);
    // let minutes = time % 60;
    // return hours + "h " + minutes + "m";

    const hours = Math.floor(time);
    const minutes = Math.round((time % 100) * 100);
    console.log(hours, minutes, "hours");
    // let hoursPart = Math.floor(time);
    // let minutesPart = Math.round((time - hoursPart) * 60);
    // return hoursPart + "h " + minutesPart + "m";
    return hours + "h " + minutes + "m";
  };
  const releaseDateCheck = () => {
    let startTime = PagesIndex.moment(movieDetail?.filmOpeningDate).format(
      "YYYY-MM-DD"
    );
    let currentTime = PagesIndex.moment().utc().format("YYYY-MM-DD");
    let timeisGt = startTime > currentTime;
    return timeisGt;
  };
  const modalTrailerOpen = () => setModalTrailer(true);
  const modalTrailerClose = () => setModalTrailer(false);

  const handleVisibilityChange = useCallback(() => {
    let data = document.visibilityState === "visible";
    if (data == false) {
      modalTrailerClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const modalReviewOpen = () => setModalReview(true);
  const modalReviewClose = () => setModalReview(false);

  const handleInterested = (values) => {
    if (!isLoggedIn) {
      signInOpen();
    }
    setIsLoading(true);
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("movieId", movieDetail?._id);
    urlEncoded.append("isInterested", values);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.Interested_Uninterested_Movie,
      urlEncoded,
      userToken
    ).then((res) => {
      const toastConfig = { autoClose: 1000 };
      if (res?.status == 200) {
        PagesIndex.toast.success(res?.message, toastConfig);
        setIsLoading(false);
        getInterested();
      } else {
        PagesIndex.toast.error(res?.message);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieDetail, movieId]);

  function getInterested() {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("movieId", movieId);
    urlEncoded.append("userId", userDetails?._id);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.Interested_Uninterested_Movie_List,
      urlEncoded,
      userToken
    ).then((res) => {
      if (res?.status == 200) {
        setInterested(res?.data?.isInterested);
      }
    });
  }
  useEffect(() => {
    if (userToken) {
      getInterested();
    }
  }, [movieId, movieDetail]);

  // useEffect(() => {
  //   if (regionId == undefined) navigate("/");
  // }, [regionId]);

  return (
    <>
      <Index.Box className="main-movie-detail">
        <Index.Box
          className="movie-detail-banner"
          style={{
            backgroundImage: `url(${PagesIndex.IMAGES_API_ENDPOINT}/${movieDetail?.poster})`,
          }}
        >
          <Index.Box className="cus-container">
            <Index.Box className="detail-banner-box">
              <Index.Box className="detail-banner-img">
                <img
                  src={
                    movieDetail?.poster
                      ? `${PagesIndex.IMAGES_API_ENDPOINT}/${movieDetail?.poster}`
                      : PagesIndex.Png.NoImage
                  }
                  width="260"
                  height="390"
                  alt="movie detail"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = PagesIndex.Png.NoImage;
                  }}
                />
                {movieDetail?.filmOpeningDate && (
                  <Index.Box className="detail-banner-img-tag">
                    {releaseDateCheck() ? "Releasing on" : "Released on"}{" "}
                    {PagesIndex.moment(movieDetail?.filmOpeningDate).format(
                      "DD MMM, YYYY"
                    )}
                  </Index.Box>
                )}
              </Index.Box>
              <Index.Box className="detail-banner-content">
                <Index.Typography
                  variant="h1"
                  component="h1"
                  className="detail-banner-title"
                >
                  {movieDetail?.name?.toUpperCase()}
                </Index.Typography>
                {!releaseDateCheck() ? (
                  <Index.Box className="detail-banner-like">
                    {isLoggedIn && isLiked ? (
                      <Index.ThumbUpAltIcon
                        onClick={handleLikeDislike}
                        className="like-icon"
                      />
                    ) : (
                      <Index.ThumbUpAltOutlinedIcon
                        className="like-icon"
                        onClick={() => {
                          if (isLoggedIn) {
                            handleLikeDislike();
                          } else {
                            signInOpen();
                          }
                        }}
                      />
                    )}
                    <span>
                      {Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(likesCount)}
                    </span>
                    <Index.StarIcon className="star-icon" />
                    <span>
                      {Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(
                        movieDetail?.averageRating <= 5
                          ? movieDetail?.averageRating
                          : movieDetail?.rating
                      )}
                      /5
                    </span>
                  </Index.Box>
                ) : (
                  ""
                )}
                {releaseDateCheck() ? (
                  <Index.Box className="detail-banner-interest">
                    <Index.Box className="banner-interest-content">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="banner-interest-title"
                      >
                        Releasing on{" "}
                        {PagesIndex.moment(movieDetail?.filmOpeningDate).format(
                          "DD MMM, YYYY"
                        )}
                      </Index.Typography>
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="banner-interest-subtitle"
                      >
                        Are you interested in watching this movie?
                      </Index.Typography>
                    </Index.Box>
                    <PagesIndex.Button
                      primary
                      className="banner-interest-button"
                      onClick={() => {
                        if (isLoggedIn) {
                          handleInterested(!interested);
                        } else {
                          signInOpen();
                        }
                      }}
                    >
                      {interested == true ? " interested" : " I'm interested"}
                      {/* {interested == true ? "interested" : "efggdg"} */}
                    </PagesIndex.Button>
                  </Index.Box>
                ) : (
                  ""
                )}
                {movieDetail &&
                !movieDetail?.isAlreadyRated &&
                !releaseDateCheck() ? (
                  <Index.Box className="detail-banner-interest">
                    <Index.Box className="banner-interest-content">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="banner-interest-title"
                      >
                        Add Your Rating & Review
                      </Index.Typography>
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="banner-interest-subtitle"
                      >
                        Your opinion matters
                      </Index.Typography>
                    </Index.Box>
                    <PagesIndex.Button
                      primary
                      onClick={() => {
                        if (isLoggedIn) {
                          modalReviewOpen();
                        } else {
                          signInOpen();
                        }
                      }}
                      className="banner-interest-button"
                    >
                      Rate now
                    </PagesIndex.Button>
                  </Index.Box>
                ) : (
                  ""
                )}
                <PagesIndex.ReviewModal
                  open={modalReview}
                  onClose={modalReviewClose}
                  movieDetail={movieDetail}
                  getMovieDetail={getMovieDetail}
                />

                <Index.Box className="movie-detail-row">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-card-label"
                  >
                    Duration : {movieDetail?.duration
                      ? displayDuration(parseFloat(durationValue))
                      : "0 hr"}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-card-label"
                  >
                    Category : {movieDetail?.category
                    ? movieDetail?.category?.replace(", ", " | ")
                    : "-"}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="booking-card-label"
                  >
                    Censor Rating : {movieDetail?.censorRating ? movieDetail?.censorRating : "-"}
                  </Index.Typography>
                  
                </Index.Box>
                
                 <Index.Box className="banner-interest-tags-wrapper" style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "15px 0" }}>
                   {/* Formats */}
                   {movieVersions?.length > 1 && [...new Set(movieVersions.map(m => m.movieType).filter(Boolean))].length > 1 && (
                     <Index.Box style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                       <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", minWidth: "80px" }}>Format:</span>
                       {[...new Set(movieVersions.map(m => m.movieType).filter(Boolean))].map((type) => {
                         const isActive = type === movieDetail?.movieType;
                         return (
                           <button
                             key={type}
                             onClick={() => {
                               if (isActive) return;
                               const target = movieVersions.find(v => v.movieType === type && v.languages === movieDetail?.languages) || movieVersions.find(v => v.movieType === type);
                               if (target) {
                                 navigate({
                                   pathname: `/movie-details`,
                                   search: PagesIndex?.createSearchParams({
                                     mId: target._id,
                                     rId: regionId || target?.cinemaObjectId?.regionId || region?._id,
                                   }).toString(),
                                 });
                               }
                             }}
                             className={`detail-version-pill ${isActive ? "active" : ""}`}
                           >
                             {type}
                           </button>
                         );
                       })}
                     </Index.Box>
                   )}

                   {/* Languages */}
                   {movieVersions?.length > 1 && [...new Set(movieVersions.map(m => m.languages).filter(Boolean))].length > 1 && (
                     <Index.Box style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                       <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", minWidth: "80px" }}>Language:</span>
                       {[...new Set(movieVersions.map(m => m.languages).filter(Boolean))].map((lang) => {
                         const isActive = lang === movieDetail?.languages;
                         const formatLanguage = (l) => {
                           if (!l) return "";
                           return l.charAt(0).toUpperCase() + l.slice(1).toLowerCase();
                         };
                         return (
                           <button
                             key={lang}
                             onClick={() => {
                               if (isActive) return;
                               const target = movieVersions.find(v => v.languages === lang && v.movieType === movieDetail?.movieType) || movieVersions.find(v => v.languages === lang);
                               if (target) {
                                 navigate({
                                   pathname: `/movie-details`,
                                   search: PagesIndex?.createSearchParams({
                                     mId: target._id,
                                     rId: regionId || target?.cinemaObjectId?.regionId || region?._id,
                                   }).toString(),
                                 });
                               }
                             }}
                             className={`detail-version-pill ${isActive ? "active" : ""}`}
                           >
                             {formatLanguage(lang)}
                           </button>
                         );
                       })}
                     </Index.Box>
                   )}

                   {/* Fallback to normal display if only 1 version exists */}
                   {([...new Set(movieVersions.map(m => m.languages).filter(Boolean))].length <= 1 && 
                     [...new Set(movieVersions.map(m => m.movieType).filter(Boolean))].length <= 1) && (
                     <Index.Box className="banner-interest-tags">
                       <Index.Typography
                         variant="span"
                         component="span"
                         className="banner-interest-tag"
                       >
                         {movieDetail?.movieType?.includes("3D") ? "3D" : "2D"}
                       </Index.Typography>
                       {movieDetail?.languages && (
                         <Index.Typography
                           variant="span"
                           component="span"
                           className="banner-interest-tag"
                         >
                           {movieDetail?.languages}
                         </Index.Typography>
                       )}
                     </Index.Box>
                   )}
                 </Index.Box>

                {movieDetail?.isShowavailable &&           <Index.Box className="book-now-box">
                  <PagesIndex.Button
                    primary
                    onClick={() => {
                      setValue(0);
                      const bookingElement =
                        document.getElementById("book-now-content");
                      bookingElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                      });
                    }}
                  >
                    Book Now
                  </PagesIndex.Button>
                  {movieDetail?.youtubeVideoUrl && (
                    <PagesIndex.Button
                      primary
                      onClick={modalTrailerOpen}
                      // onClick={handlePlayTrailerButtonClick}
                      className="play-trailer-btn"
                    >
                      <Index.PlayArrowIcon />
                    </PagesIndex.Button>
                  )}
                  <PagesIndex.TrailerModal
                    open={modalTrailer}
                    onClose={modalTrailerClose}
                    link={movieDetail?.youtubeVideoUrl}
                  />
                </Index.Box>}

      
              </Index.Box>
              <Index.Box
                className="detail-banner-share"
                onClick={() => {
                  setOpen(true);
                  setMessage("Copied ✓");
                  setTimeout(() => {
                    setMessage("Share");
                  }, 2000);
                  navigator?.clipboard?.writeText(window.location);
                }}
              >
                <ClickAwayListener onClickAway={handleTooltipClose}>
                  <PagesIndex.Tooltip
                    title={message}
                    placement="top"
                    className="abc"
                    arrow
                    onClose={handleTooltipClose}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <Button className="share-icon-button">
                      <Index.ShareIcon />
                    </Button>
                  </PagesIndex.Tooltip>
                </ClickAwayListener>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="movie-detail-tab-wrapper" id="book-now-content">
          <Index.Box className="movie-detail-tab-box">
            <Index.Box className="cus-container">
              <Index.Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                aria-label="basic tabs example"
              >
                <Index.Tab
                  className="movie-detail-tab"
                  label="Movie Details"
                  {...a11yProps(0)}
                />
                <Index.Tab
                  className="movie-detail-tab"
                  label="About Movie"
                  {...a11yProps(1)}
                />
                <Index.Tab
                  className="movie-detail-tab"
                  label="Reviews"
                  {...a11yProps(2)}
                />
              </Index.Tabs>
            </Index.Box>
          </Index.Box>
          <MovieDetailTab
            value={value}
            index={0}
            className="movie-detail-tab-content"
          >
            <DetailTabContent
              movieId={movieId}
              regionId={regionId}
              movieShows={movieShows}
              filteredMovieShows={filteredMovieShows}
              setFilteredMovieShows={setFilteredMovieShows}
              languages={movieDetail?.languages}
              censorRating={movieDetail?.censorRating}
              filmOpeningDate={PagesIndex.moment(
                movieDetail?.filmOpeningDate
              ).format("YYYY-MM-DD")}
              getMovieShowDetails={(selectedDate) =>
                getMovieShowDetails(selectedDate)
              }
              movieDetail={movieDetail}
              region={region}
            />
          </MovieDetailTab>
          <MovieDetailTab
            value={value}
            index={1}
            className="movie-detail-tab-content"
          >
            <AboutTabContent
              details={movieDetail}
              movieId={movieId}
              setInterested={setInterested}
            />
          </MovieDetailTab>
          <MovieDetailTab
            value={value}
            index={2}
            className="movie-detail-tab-content"
          >
            <ReviewTabContent details={movieDetail} movieId={movieId} />
          </MovieDetailTab>
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
      </Index.Box>
    </>
  );
}

export default MovieDetail;
