import React, { memo, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "swiper/css/effect-fade";
import Slider from "react-slick";
import { FreeMode } from "swiper/modules";
import { useCallback } from "react";
import {
  DataService,
  IMAGES_API_ENDPOINT,
} from "../../../../config/DataService";
import { Api } from "../../../../config/Api";
import SEO from "../../../../components/common/SEO";

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
const MovieSlider = memo(({ title, moviesList, isNowPlaying = false }) => {
  if (!moviesList?.length) return <Index.Box className="not-found"></Index.Box>;
  console.log(title, ":isNowPlaying", isNowPlaying)
  return (
    <Index.Box className="main-showing-part movie-slider">
      <Index.Box className="cus-container">
        <Index.Box className="showing-txt movie-slider-heading">
          <Index.Typography variant="h5">{title}</Index.Typography>
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
            {moviesList?.map((item, key) => (
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

  // Update banner click count
  const updateBannerClickCount = useCallback(async (bannerId) => {
    try {
      await DataService.post(Api.UPDATE_BANNER_CLICK_COUNT, { bannerId });
    } catch (error) {
      console.error("Error updating banner click count:", error);
    }
  }, []);

  // Initial data fetching
  useEffect(() => {
    const initializeData = async () => {
      const [bannerData, membershipData, upcomingMovies] = await Promise.all([
        fetchData(`${Api.GET_BANNER_IMAGES}?bannerType=Web Banner`),
        fetchData(Api.GET_MEMBERSHIP_DETAILS),
        fetchData(`${Api.GET_UPCOMING_MOVIES}?regionId=${region?._id}`),
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
        upcomingMoviesList:
          upcomingMovies?.status === 200
            ? upcomingMovies?.data.flatMap((item) =>
                item.movies.filter(
                  (data) =>
                    PagesIndex.moment()
                      .utc()
                      .diff(
                        PagesIndex.moment(data?.filmOpeningDate),
                        "months"
                      ) <= 3
                )
              )
            : [],
      }));

      if (upcomingMovies?.status === 200) {
        dispatch(PagesIndex.upcomingMoviesList(upcomingMovies?.data));
      }
    };

    initializeData();
  }, []); // Run only once on mount

  useEffect(() => {
    if (!region?._id) return;

    fetchSliderData();
    fetchNowPlayingData();
    fetchRegionData();
  }, [fetchSliderData, fetchNowPlayingData, fetchRegionData]);

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
        {/*  */}
      </Index.Box>

      {/* Now Showing Section */}
      <MovieSlider
        title="Now Showing"
        moviesList={state.nowPlayingList}
        isNowPlaying={true}
      />

      {/* Membership details section */}
      <Index.Box className="main-membership-plan">
        <Index.Box className="cus-container">
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
                    id="hello"
                  >
                    <source
                      src={
                        state.memberShipDetails?.file &&
                        `${PagesIndex.IMAGES_API_ENDPOINT}/${state.memberShipDetails?.file}`
                      }
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
                className="membership-right-Index.Box"
              >
                <Index.Box className="member-right-details">
                  <Index.Typography variant="h4">
                    {state.memberShipDetails?.title ||
                      "Introducing a loyalty program with special rewards and exclusive benefits!"}
                  </Index.Typography>

                  {/* <Index.Typography
                    variant="p"
                    component="p"
                    className="comming-soon-text"
                  >
                    {state.memberShipDetails?.description || ""}
                  </Index.Typography> */}
                  <Index.Box className="membership-btns main">
                    <Index.Link to="/membership" className="btn btn-primary">
                      Purchase Plan
                    </Index.Link>
                    <Index.Link
                      to={"https://ticketing.theconnplex.com/membership"}
                    >
                      Already Member ?
                    </Index.Link>
                  </Index.Box>
                  <Index.Box className="membership-btns store-btns">
                    <Index.Link
                      to={
                        "https://play.google.com/store/apps/details?id=com.connplex"
                      }
                      className="play-store-btns"
                      target="blank"
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
                      target="blank"
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

      {/* Banner above upcoming movie section */}
      <BannerSlider
        bannerList={state.aboveUpcomingBannerList}
        updateBannerClickCount={updateBannerClickCount}
      />

      {/* Movie Categories */}
      {["Bollywood", "Hollywood", "Regional"].map(
        (category) =>
          state.upcomingMoviesList?.filter(
            (data) => data?.movieCategory === category
          )?.length > 0 && (
            <MovieSlider
              key={category}
              title={`Upcoming ${category} Movies`}
              moviesList={state.upcomingMoviesList.filter(
                (data) => data?.movieCategory === category //&&
                // PagesIndex.moment().utc().diff(PagesIndex.moment(data?.filmOpeningDate), "months") <= 3
              )}
            />
          )
      )}

      {/* Recent Releases */}
      <MovieSlider
        title="Recent Releases"
        moviesList={state.recentReleasesList}
        isNowPlaying={true}
      />

      {/* Banner below upcoming movie section */}
      <BannerSlider
        bannerList={state.belowUpcomingBannerList}
        updateBannerClickCount={updateBannerClickCount}
      />

      <PagesIndex.Membership />
    </Index.Box>
  );
}

export default Home;
