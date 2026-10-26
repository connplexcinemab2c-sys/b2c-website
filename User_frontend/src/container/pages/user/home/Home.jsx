import React, { memo, useEffect, useState, useCallback } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "swiper/css/effect-fade";
import Slider from "react-slick";
import { FreeMode } from "swiper/modules";
import {
  DataService,
  IMAGES_API_ENDPOINT,
} from "../../../../config/DataService";
import { Api } from "../../../../config/Api";
import SEO from "../../../../components/common/SEO";
import { groupMoviesByBaseName } from "../../../../utils/movieHelpers";

const HERO_SLIDER_SETTINGS = {
  dots: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: true,
  autoplay: true,
  arrows: false,
  fade: true,
  speed: 1600,
  infinite: true,
  delay: 2000,
  cssEase: "ease-in-out",
  touchThreshold: 100,
  loop: true,
  pauseOnHover: false,
};

// Common breakpoints for Swiper
const SWIPER_BREAKPOINTS = {
  550: { slidesPerView: 2.8, spaceBetween: 10 },
  780: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1349: { slidesPerView: 5, spaceBetween: 20 },
};

// Memoized movie slider component
const MovieSlider = memo(({ title, moviesList, isNowPlaying = false, viewAllLink = null }) => {
  if (!moviesList?.length) return <Index.Box className="not-found"></Index.Box>;
  console.log(title, ":isNowPlaying", isNowPlaying);

  const groupedMovies = groupMoviesByBaseName(moviesList);

  return (
    <Index.Box className="main-showing-part movie-slider">
      <Index.Box className="cus-container">
        <Index.Box className="showing-txt movie-slider-heading movie-slider-heading-row">
          <Index.Typography variant="h5">{title}</Index.Typography>
          {viewAllLink && (
            <Index.Link to={viewAllLink} className="view-all-link">
              View all
            </Index.Link>
          )}
        </Index.Box>
        <Index.Box className="main-showing-slider movie-slider-inner">
          <PagesIndex.Swiper
            freeMode={true}
            modules={[PagesIndex.Navigation, FreeMode]}
            navigation={true}
            spaceBetween={10}
            slidesPerView={2.5}
            breakpoints={SWIPER_BREAKPOINTS}
          >
            {groupedMovies?.map((item, key) => (
              <PagesIndex.SwiperSlide key={key}>
                <PagesIndex.MovieCard
                  title={title}
                  item={item}
                  isNowPlaying={isNowPlaying}
                />
              </PagesIndex.SwiperSlide>
            ))}
          </PagesIndex.Swiper>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
});

// Memoized banner slider component
const BannerSlider = memo(({ bannerList, updateBannerClickCount }) => {
  if (!bannerList?.length) return null;

  return (
    <Index.Box className="cus-container home-cus-container">
      <Index.Box className="account-ad-slider">
        <PagesIndex.Swiper
          modules={[PagesIndex.Autoplay]}
          loop={true}
          speed={1500}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
          }}
        >
          {bannerList?.map((data, index) => (
            <PagesIndex.SwiperSlide key={index}>
              <Index.Box
                className={`ad-slider-img ${data?.bannerLink ? "link" : ""}`}
                onClick={() => {
                  if (data?.bannerLink) {
                    window.open(data?.bannerLink, "_blank");
                    updateBannerClickCount(data?._id);
                  } else {
                    return false;
                  }
                }}
              >
                <img
                  src={
                    data?.banner
                      ? `${IMAGES_API_ENDPOINT}/${data.banner}`
                      : PagesIndex.Png.NoImage
                  }
                  alt="ad-slider"
                />
              </Index.Box>
            </PagesIndex.SwiperSlide>
          ))}
        </PagesIndex.Swiper>
      </Index.Box>
    </Index.Box>
  );
});

function Home() {
  const dispatch = PagesIndex.useDispatch();
  const { region } = PagesIndex.useSelector((state) => state.UserReducer);

  const [state, setState] = useState({
    upcomingMoviesList: [],
    nowPlayingList: [],
    recentReleasesList: [],
    sliderList: [],
    aboveUpcomingBannerList: [],
    belowUpcomingBannerList: [],
    memberShipDetails: {},
  });

  // Memoized API handlers with better error handling
  const fetchData = useCallback(
    async (apiEndpoint) => {
      try {
        dispatch(PagesIndex.showLoader());
        const response = await DataService.get(apiEndpoint);
        dispatch(PagesIndex.hideLoader());
        return response?.data;
      } catch (error) {
        dispatch(PagesIndex.hideLoader());
        console.error("API Error:", error);
        return null;
      }
    },
    [dispatch]
  );

  // Slider API (uses fetchData)
  const fetchSliderData = useCallback(async () => {
    if (!region?._id) return;
    const sliderData = await fetchData(
      `${Api.GET_SLIDER_IMAGES}/${region._id}/Web`
    );
    setState((prev) => ({
      ...prev,
      sliderList: sliderData?.status === 200 ? sliderData.data : [],
    }));
  }, [region?._id, fetchData]);

  // Combined region-dependent data fetching
  const fetchNowPlayingData = useCallback(async () => {
    if (!region?._id) return;
    const moviesData = await fetchData(`${Api.GET_MOVIES_BY_ID}/${region._id}`);
    setState((prev) => ({
      ...prev,
      nowPlayingList: moviesData?.status === 200 ? moviesData.data : [],
    }));
  }, [region?._id, fetchData]);

  const fetchRegionData = useCallback(async () => {
    if (!region?._id) return;
    const recentReleasesData = await fetchData(
      `${Api.GET_RECENT_RELEASES_MOVIE_BY_REGION}/${region._id}`
    );
    setState((prev) => ({
      ...prev,
      recentReleasesList:
        recentReleasesData?.status === 200
          ? recentReleasesData?.data?.recentReleasesMovies
          : [],
    }));
  }, [region?._id, fetchData]);

  // Upcoming movies data fetching
  const fetchUpcomingMoviesData = useCallback(
    async (currentRegionId) => {
      const endpoint = currentRegionId
        ? `${Api.GET_UPCOMING_MOVIES}?regionId=${currentRegionId}`
        : Api.GET_UPCOMING_MOVIES;
      const upcomingMovies = await fetchData(endpoint);
      if (upcomingMovies?.status === 200 && Array.isArray(upcomingMovies?.data)) {
        const flatList = upcomingMovies.data.flatMap(
          (item) => item?.movies || []
        );
        setState((prev) => ({
          ...prev,
          upcomingMoviesList: flatList,
        }));
        dispatch(PagesIndex.upcomingMoviesList(upcomingMovies.data));
      }
    },
    [fetchData, dispatch]
  );

  // Update banner click count
  const updateBannerClickCount = useCallback(async (bannerId) => {
    try {
      await DataService.post(Api.UPDATE_BANNER_CLICK_COUNT, { bannerId });
    } catch (error) {
      console.error("Error updating banner click count:", error);
    }
  }, []);

  // Initial data fetching on mount
  useEffect(() => {
    const initializeData = async () => {
      const [bannerData, membershipData] = await Promise.all([
        fetchData(`${Api.GET_BANNER_IMAGES}?bannerType=Web Banner`),
        fetchData(Api.GET_MEMBERSHIP_DETAILS),
      ]);

      setState((prev) => ({
        ...prev,
        aboveUpcomingBannerList:
          bannerData?.status === 200
            ? bannerData?.data?.filter((data) =>
                data?.bannerShowSection?.includes("Above Upcoming Section")
              )
            : [],
        belowUpcomingBannerList:
          bannerData?.status === 200
            ? bannerData?.data?.filter((data) =>
                data?.bannerShowSection?.includes("Below Upcoming Section")
              )
            : [],
        memberShipDetails:
          membershipData?.status === 200 ? membershipData?.data[0] : {},
      }));

      // Initial upcoming movies fetch
      fetchUpcomingMoviesData(region?._id);
    };

    initializeData();
  }, []);

  // Region-dependent data fetching
  useEffect(() => {
    if (!region?._id) return;

    fetchSliderData();
    fetchNowPlayingData();
    fetchRegionData();
    fetchUpcomingMoviesData(region._id);
  }, [region?._id, fetchSliderData, fetchNowPlayingData, fetchRegionData, fetchUpcomingMoviesData]);

  // Scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
    const videoElement = document.getElementById("membershipVideo");
    if (videoElement) {
      videoElement.setAttribute("autoplay", "autoplay");
    }
  }, [state.sliderList]);

  return (
    <Index.Box className="main-home">
      <SEO 
        title="Home" 
        description="Welcome to Connplex Ticketing. Book your movie tickets for Bollywood, Hollywood and Regional movies at your nearest Connplex Cinema."
      />
      {/* Hero Slider */}
      <Index.Box className="main-hero-slider">
        <Slider
          {...HERO_SLIDER_SETTINGS}
          className="hero-slick-details"
          pauseOnHover={false}
          key={state.sliderList}
        >
          {state.sliderList?.map((data, key) => {
            return (
              <div key={key} className="hero-slick-key">
                <Index.Box className="hero-slider-img">
                  <img
                    src={
                      data?.image
                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.image}`
                        : PagesIndex.Png.NoImage
                    }
                    alt="banner slider"
                    width="1920"
                    height="600"
                  />
                </Index.Box>
              </div>
            );
          })}
        </Slider>
      </Index.Box>

      {/* Now Showing Section */}
      <MovieSlider
        title="Now Showing"
        moviesList={state.nowPlayingList}
        isNowPlaying={true}
        viewAllLink="/cinema"
      />

      {/* Recent Releases Section */}
      <MovieSlider
        title="Recent Releases"
        moviesList={state.recentReleasesList}
        isNowPlaying={true}
        viewAllLink="/cinema"
      />

      {/* Banner above upcoming movie section */}
      <BannerSlider
        bannerList={state.aboveUpcomingBannerList}
        updateBannerClickCount={updateBannerClickCount}
      />

      {/* Upcoming Movie Categories */}
      {["Bollywood", "Hollywood", "Regional"].map((category) => {
        const categoryMovies = state.upcomingMoviesList?.filter(
          (data) =>
            (data?.movieCategory || "").trim().toLowerCase() ===
            category.toLowerCase()
        );
        return categoryMovies?.length > 0 ? (
          <MovieSlider
            key={category}
            title={`Upcoming ${category} Movies`}
            moviesList={categoryMovies}
            viewAllLink="/calender"
          />
        ) : null;
      })}

      {/* Banner below upcoming movie section */}
      <BannerSlider
        bannerList={state.belowUpcomingBannerList}
        updateBannerClickCount={updateBannerClickCount}
      />

      {/* Membership Plan Section */}
      <Index.Box className="main-membership-plan">
        <Index.Box className="cus-container">
          <Index.Box className="showing-txt movie-slider-heading membership-section-heading">
            <Index.Typography variant="h5">Membership Plan</Index.Typography>
          </Index.Box>
          <Index.Box className="membership-grid-main">
            <Index.Grid container>
              <Index.Grid item md={6} xxs={12}>
                {state.memberShipDetails?.file ? (
                  <video
                    className="membership-video"
                    controls={false}
                    autoPlay={true}
                    muted
                    loop
                    preload="auto"
                    playsInline
                    id="membershipVideo"
                    key={state.memberShipDetails?.file}
                    src={`${PagesIndex.IMAGES_API_ENDPOINT}/${state.memberShipDetails?.file}`}
                  >
                    <source
                      src={`${PagesIndex.IMAGES_API_ENDPOINT}/${state.memberShipDetails?.file}`}
                      className="member-img"
                      alt="Membership"
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <img
                    src={PagesIndex.Jpg.membership}
                    className="member-img"
                    alt="Membership"
                  />
                )}
              </Index.Grid>
              <Index.Grid
                item
                md={6}
                xxs={12}
                className="membership-right-box"
              >
                <Index.Box className="member-right-details">
                  <Index.Typography variant="h4">
                    {state.memberShipDetails?.title ||
                      "Your VIP Access Starts at Just ₹1 — Early Bird Rewards Await!"}
                  </Index.Typography>

                  <Index.Typography
                    variant="p"
                    component="p"
                    className="comming-soon-text"
                  >
                    {state.memberShipDetails?.description ||
                      "Unlock exclusive benefits, special offers, and premium experiences. Hurry — limited-time offer. Join now! Membership Plan is currently applicable only through the CONNPLEX Website and Mobile App."}
                  </Index.Typography>
                  <Index.Box className="membership-btns main">
                    <Index.Link to="/membership" className="btn btn-primary">
                      Purchase Plan
                    </Index.Link>
                    <Index.Link to="/membership">
                      Already Member ?
                    </Index.Link>
                  </Index.Box>
                  <Index.Box className="membership-btns store-btns">
                    <Index.Link
                      to={
                        "https://play.google.com/store/apps/details?id=com.connplex"
                      }
                      className="play-store-btns"
                      target="_blank"
                    >
                      <img
                        src={PagesIndex.Svg.PlayStore}
                        width="150"
                        height="48"
                        alt="Play Store"
                      />
                    </Index.Link>
                    <Index.Link
                      to={
                        "https://apps.apple.com/in/app/connplex-cinemas-tickets/id6497171599"
                      }
                      className="apple-store-btns"
                      target="_blank"
                    >
                      <img
                        src={PagesIndex.Svg.AppleStore}
                        width="150"
                        height="48"
                        alt="Apple Store"
                      />
                    </Index.Link>
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* Newsletter Section */}
      <PagesIndex.Membership />
    </Index.Box>
  );
}

export default Home;
