import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { FreeMode } from "swiper/modules";

function AboutTabContent({ details, movieId, setInterested }) {
  // const { upcomingMoviesList } = PagesIndex.useSelector(
  //   (state) => state.UserReducer
  // );

  const [upcomingMoviesList, setUpcomingMoviesList] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);

  const getUpcomingMoviesList = () => {
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_CALENDER_LIST
    ).then((res) => {
      if (res?.status === 200) {
        let movieData = [];

        res.data.map((item) => {
          item.movies.map((data) => {
            let startTime = PagesIndex.moment(data?.filmOpeningDate)
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
            let currentTime = PagesIndex.moment().format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            );
            let timeDiff = PagesIndex.moment(
              startTime,
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            ).diff(
              PagesIndex.moment(currentTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
              "months",
              true
            );
            let timeisGt = startTime >= currentTime;
            if (timeisGt && timeDiff <= 3) {
              // if (timeisGt) {
              movieData.push(data);
            }
          });
        });
        // dispatch(PagesIndex.upcomingMoviesList(movieData));
        setUpcomingMoviesList(movieData);
      }
    });
  };
  // similar movies
  const getSimilarMoviesList = () => {
    PagesIndex.apiGetHandler(
      `${PagesIndex.Api.SIMILAR_MOVIES_DETAILS}?movieId=${movieId}`
    ).then((res) => {
      if (res?.status === 200) {
        let movieData = [];

        res?.data?.map((item) => {
          item?.movies?.map((data) => {
            let startTime = PagesIndex.moment(data?.filmOpeningDate)
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
            let currentTime = PagesIndex.moment().format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            );
            let timeDiff = PagesIndex.moment(
              startTime,
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            ).diff(
              PagesIndex.moment(currentTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
              "months",
              true
            );
            let timeisGt = startTime >= currentTime;
            if (timeisGt && timeDiff <= 3) {
              // if (timeisGt) {
              movieData.push(data);
            }
          });
        });
        // dispatch(PagesIndex.upcomingMoviesList(movieData));
        setSimilarMovies(movieData);
      }
    });
  };
  useEffect(() => {
    getUpcomingMoviesList();
    getSimilarMoviesList();
  }, []);

  console.log(similarMovies,"setSimilarMovies")
  return (
    <Index.Box className="cus-container">
      <Index.Box className="about-tab-content">
        <Index.Box className="about-tab-header">
          <Index.Typography
            variant="p"
            component="p"
            className="tab-header-title"
          >
            About the movie
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="tab-header-content"
          >
            {details?.description ? details?.description : "No Data Found"}
          </Index.Typography>
        </Index.Box>
        <Index.Box className="about-tab-body">
          <Index.Box className="about-tab-cast-crew">
            <Index.Typography
              variant="p"
              component="p"
              className="cast-crew-title"
            >
              Cast
            </Index.Typography>
            {details?.starCast?.length ? (
              <Index.Box className="cast-crew-wrapper">
                {details?.starCast?.map((item, key) => (
                  <Index.Box key={item?._id} className="cast-crew-item">
                    <Index.Box className="cast-crew-img">
                      <img
                        src={
                          item?.starCastId?.profile
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.starCastId?.profile}`
                            : PagesIndex.Png.Avatar
                        }
                        width="98"
                        height="98"
                        alt="cast crew"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = PagesIndex.Png.Avatar;
                        }}
                      />
                    </Index.Box>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="real-name"
                    >
                      {item?.starCastId?.name}
                    </Index.Typography>
                    {/* <Index.Typography
                    variant="p"
                    component="p"
                    className="movie-name"
                  >
                    as Tara Singh
                  </Index.Typography> */}
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              "No Data Available"
            )}
          </Index.Box>
          <Index.Box className="about-tab-cast-crew">
            <Index.Typography
              variant="p"
              component="p"
              className="cast-crew-title"
            >
              Crew
            </Index.Typography>
            {details?.crew?.length ? (
              <Index.Box className="cast-crew-wrapper">
                {details?.crew?.map((item, key) => (
                  <Index.Box key={item?._id} className="cast-crew-item">
                    <Index.Box className="cast-crew-img">
                      <img
                        src={
                          item?.starCastId?.profile
                            ?  `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.starCastId?.profile}`
                            : PagesIndex.Png.Avatar
                        }
                        width="98"
                        height="98"
                        alt="cast crew"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = PagesIndex.Png.Avatar;
                        }}
                      />
                    </Index.Box>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="real-name"
                    >
                      {item?.starCastId?.name}
                    </Index.Typography>
                    {/* <Index.Typography
                    variant="p"
                    component="p"
                    className="movie-name"
                  >
                    as Tara Singh
                  </Index.Typography> */}
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              "No Data Available"
            )}
          </Index.Box>
          {/* upcoming */}
          <Index.Box className="about-movie-upcoming movie-slider">
            <Index.Box className="showing-txt movie-slider-heading">
              <Index.Typography variant="h5">Upcoming</Index.Typography>
            </Index.Box>
            <Index.Box className="main-upcoming-slider movie-slider-inner">
              {upcomingMoviesList && upcomingMoviesList.length ? (
                upcomingMoviesList.filter((data) => data._id !== movieId)
                  .length ? (
                  <PagesIndex.Swiper
                    freeMode={true}
                    modules={[PagesIndex.Navigation, FreeMode]}
                    navigation={true}
                    spaceBetween={10}
                    slidesPerView={2.5}
                    breakpoints={{
                      550: {
                        slidesPerView: 2.8,
                        spaceBetween: 10,
                      },
                      780: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                      },
                      1349: {
                        slidesPerView: 5,
                        spaceBetween: 20,
                      },
                    }}
                  >
                    {upcomingMoviesList
                      .filter((data) => data._id !== movieId)
                      .map((item, key) => (
                        <PagesIndex.SwiperSlide key={item._id}>
                          <PagesIndex.MovieCard
                            Like={key % 2 === 0}
                            Rating={key % 2 === 1}
                            item={item}
                            setInterested={setInterested}
                          />
                        </PagesIndex.SwiperSlide>
                      ))}
                  </PagesIndex.Swiper>
                ) : (
                  <Index.Box className="not-found">No Movies Found</Index.Box>
                )
              ) : (
                <Index.Box className="not-found">No Movies Found</Index.Box>
              )}
            </Index.Box>
          </Index.Box>
          {/* similar movies */}
          {/* <Index.Box className="about-movie-upcoming movie-slider">
            <Index.Box className="showing-txt movie-slider-heading">
              <Index.Typography variant="h5">Similar Movies</Index.Typography>
            </Index.Box>
            <Index.Box className="main-upcoming-slider movie-slider-inner">
              {similarMovies && similarMovies.length ? (
                similarMovies.filter((data) => data._id !== movieId)
                  .length ? (
                  <PagesIndex.Swiper
                    freeMode={true}
                    modules={[PagesIndex.Navigation, FreeMode]}
                    navigation={true}
                    spaceBetween={10}
                    slidesPerView={2.5}
                    breakpoints={{
                      550: {
                        slidesPerView: 2.8,
                        spaceBetween: 10,
                      },
                      780: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                      },
                      1349: {
                        slidesPerView: 5,
                        spaceBetween: 20,
                      },
                    }}
                  >
                    {similarMovies
                      .filter((data) => data._id !== movieId)
                      .map((item, key) => (
                        <PagesIndex.SwiperSlide key={item._id}>
                          <PagesIndex.MovieCard
                            Like={key % 2 === 0}
                            Rating={key % 2 === 1}
                            item={item}
                            setInterested={setInterested}
                          />
                        </PagesIndex.SwiperSlide>
                      ))}
                  </PagesIndex.Swiper>
                ) : (
                  <Index.Box className="not-found">No Movies Found</Index.Box>
                )
              ) : (
                <Index.Box className="not-found">No Movies Found</Index.Box>
              )}
            </Index.Box>
          </Index.Box> */}
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default AboutTabContent;
