import { StatusCodes } from "http-status-codes";
import moment from "moment/moment.js";
import fs from "fs";
import mongoose from "mongoose";
import Cinema from "../../models/Cinema.js";
import Movie from "../../models/Movies.js";
import RatingAndReview from "../../models/RatingAndReview.js";
import Show from "../../models/Shows.js";
import MovieInterested from "../../models/movieInterested.js";
import MovieLikes from "../../models/movieLikes.js";
import {
  getSeatStatus,
  handleErrorResponse,
} from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import SeatFilter from "../../models/SessionAreaCount.js";
import { Region } from "../../models/Region.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";
import { SiteSetting } from "../../models/SiteSetting.js";

//#region movieDetailsByMovieId
export const getMoviesById = async (req, res) => {
  try {
    let { movieId, userId } = req.query;
    const moviesDetails = await Movie.findOne({
      _id: movieId,
      deletedStatus: 0,
      // isActive: true,
    })
      .populate("starCast.starCastId")
      .populate("crew.starCastId");

    if (!moviesDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else if (!moviesDetails?.isActive) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.MOVIE_NO_LONGER_AVAILABLE,
        data: [],
      });
    } else {
      let condition;
      let getLikes;
      if (movieId && userId != "undefined") {
        condition = {
          movieId: movieId,
          userId: userId,
          isActive: true,
        };
        getLikes = await MovieLikes.findOne({ movieId, userId });
      } else {
        condition = {
          movieId: movieId,
          isActive: true,
        };
      }
      const getRateReview = await RatingAndReview.findOne(condition);
      const getAllRateAndReview = await RatingAndReview.find({
        movieId: movieId,
        isActive: true,
      })
        .populate("userId", "firstName lastName profile")
        .sort({ createdAt: -1 });

      const totalRatings = await RatingAndReview.find({
        movieId: movieId,
        isActive: true,
      });

      let sumOfRatings = 0;
      let totalNumberOfRatings = 0;
      let averageRating = 0;

      if (totalRatings && totalRatings.length > 0) {
        sumOfRatings = totalRatings.reduce(
          (total, rating) => total + rating.movieRate,
          0
        );
        totalNumberOfRatings = totalRatings.length;
        averageRating = sumOfRatings / totalNumberOfRatings;
      }

      let movieObj = { ...moviesDetails._doc };

      movieObj.isAlreadyRated = false;
      if (movieObj.averageRating > 10) {
        movieObj.rating = movieObj.averageRating;
      }
      // if (movieObj.totalLikes < movieObj.likes) {
      //   movieObj.likes = movieObj.likes + movieObj.totalLikes;
      // }
      if (movieObj.totalLikes > 0) {
        movieObj.totalLikes = movieObj.totalLikes;
      } else {
        movieObj.totalLikes = movieObj.likes;
      }
      if (getRateReview && userId != "undefined") {
        movieObj.isAlreadyRated = true;
      }
      if (totalRatings.length > 0) {
        movieObj.averageRating = averageRating;
      } else {
        movieObj.averageRating = movieObj.rating;
      }
      if (getAllRateAndReview.length) {
        movieObj.rateAndReviews = getAllRateAndReview;
      }
      if (getLikes) {
        movieObj.isLiked = getLikes.isLiked;
      }

      // Check and handle movie poster existence
      // const handlePosterImage = async () => {
      //   const posterPath = "./public/uploads/" + movieObj.poster;
      //   try {
      //     await fs.promises.access(posterPath, fs.constants.F_OK);
      //   } catch (err) {
      //     movieObj.poster = "";
      //   }
      // };
      // await handlePosterImage();

      // Check if shows are available for this movie
      const currentTime = moment().utcOffset("+05:30").toDate();
      const availableShows = await Show.countDocuments({
        filmObjectId: movieId,
        sessionRealShow: { $gte: currentTime },
        deletedStatus: 0,
        isActive: true,
      });
      movieObj.isShowavailable = availableShows > 0;
      const sitesetting = await SiteSetting.findOne();
      movieObj.showExtendedDays = sitesetting?.showExtendedDays || 10;

      // Check and handle cast and crew member's profile image existence
      // const handleProfileImage = async (profile) => {
      //   const profilePath = "./public/uploads/" + profile;
      //   try {
      //     await fs.promises.access(profilePath, fs.constants.F_OK);
      //   } catch (err) {
      //     profile = "";
      //   }
      //   return profile;
      // };

      // Update cast members' profile images
      // await Promise.all(
      //   movieObj.starCast.map(async (castMember) => {
      //     castMember.starCastId.profile = await handleProfileImage(
      //       castMember.starCastId.profile
      //     );
      //   })
      // );

      // Update crew members' profile images
      // await Promise.all(
      //   movieObj.crew.map(async (crewMember) => {
      //     crewMember.starCastId.profile = await handleProfileImage(
      //       crewMember.starCastId.profile
      //     );
      //   })
      // );

      // let finalResponseDuration = movieObj.duration;

      // if (
      //   finalResponseDuration > 4 ||
      //   !finalResponseDuration ||
      //   ![1, 2, 3, 4].includes(finalResponseDuration) ||
      //   !(finalResponseDuration >= 1.0 && finalResponseDuration <= 4.0)
      // ) {
      //   finalResponseDuration = 0;
      // }
      // movieObj.duration = finalResponseDuration;

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: movieObj,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#region get similar movies details
export const getSimilarMoviesDetails = async (req, res) => {
  try {
    let { movieId } = req.query;
    const singleMoviesDetails = await Movie.findOne({
      _id: movieId,
      deletedStatus: 0,
      isActive: true,
    }).populate("cinemaObjectId");

    const cinemasDetails = await Cinema.find({
      _id: singleMoviesDetails.cinemaObjectId._id,
      deletedStatus: 0,
      isActive: true,
    });

    if (
      cinemasDetails.length > 0 &&
      singleMoviesDetails &&
      singleMoviesDetails.movieCategory !== ""
    ) {
      const similarMoviesDetails = await Movie.find({
        movieCategory: singleMoviesDetails.movieCategory,
        cinemaObjectId: { $in: cinemasDetails._id },
        deletedStatus: 0,
        isActive: true,
      }).populate("cinemaObjectId");

      if (similarMoviesDetails.length > 0) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.SIMILAR_MOVIES_DETAILS,
          data: similarMoviesDetails,
        });
      } else {
        return res.status(404).json({
          status: StatusCodes.NOT_FOUND,
          message: ResponseMessage.SIMILAR_MOVIES_NOT_FOUND,
          data: [],
        });
      }
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.SIMILAR_MOVIES_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getMoviesByRegion
//old
// export const getMoviesByRegion = async (req, res) => {
//   try {
//     const { regionId } = req.params;
//     let moviesDetails = await Movie.find(
//       {
//         status: { $nin: [2, 3] },
//         deletedStatus: 0,
//         isActive: true,
//       },
//       {
//         cinemaObjectId: true,
//         movieCategory: true,
//         name: true,
//         category: true,
//         youtubeVideoUrl: true,
//         poster: true,
//         filmCode: true,
//         duration: true,
//         languages: true,
//         censorRating: true,
//         rating: true,
//         likes: true,
//         averageRating: true,
//         totalLikes: true,
//         filmOpeningDate: true,
//         uniqueFilmCode: true,
//         movieType: true,
//       }
//     )
//       .populate("cinemaObjectId", "regionId")
//       .sort({ filmOpeningDate: -1 });
//     // .populate("starCast.starCastId");
//     // let uniqueFilteredMovies = [];

//     let response = moviesDetails.filter((ele) => {
//       return (
//         ele.cinemaObjectId &&
//         ele.cinemaObjectId.regionId &&
//         ele.cinemaObjectId.regionId.toString() === regionId.toString()
//       );
//     });
//     let currentTime = moment()
//       .utcOffset("+05:30")
//       .format("YYYY-MM-DDTHH:mm:ss");
//     let filteredMoviesArray = [];
//     await Promise.all(
//       response.map(async (movie) => {
//         const showTimingCount = await Show.countDocuments({
//           filmObjectId: movie._id,
//           sessionRealShow: { $gte: new Date(currentTime) },
//           deletedStatus: 0,
//           isActive: true,
//         });

//         const totalRatings = await RatingAndReview.find({
//           movieId: movie._id,
//           isActive: true,
//         });

//         let sumOfRatings = 0;
//         let totalNumberOfRatings = 0;
//         let averageRating = 0;

//         if (totalRatings && totalRatings.length > 0) {
//           sumOfRatings = totalRatings.reduce(
//             (total, rating) => total + rating.movieRate,
//             0
//           );
//           totalNumberOfRatings = totalRatings.length;
//           averageRating = sumOfRatings / totalNumberOfRatings;
//         }

//         if (movie.averageRating > 10) {
//           movie.rating = movie.averageRating;
//         }

//         if (totalRatings.length > 0) {
//           movie.averageRating = averageRating;
//         } else {
//           movie.averageRating = movie.rating;
//         }

//         if (movie.totalLikes > 0) {
//           movie.totalLikes = movie.totalLikes;
//         } else {
//           movie.totalLikes = movie.likes;
//         }

//         // let finalResponseDuration = movie.duration;
//         // if (
//         //   finalResponseDuration > 4 ||
//         //   !finalResponseDuration ||
//         //   ![1, 2, 3, 4].includes(finalResponseDuration) ||
//         //   !(finalResponseDuration >= 1.0 && finalResponseDuration <= 4.0)
//         // ) {
//         //   finalResponseDuration = 0;
//         // }

//         // movie.duration = finalResponseDuration;
//         if (showTimingCount) {
//           filteredMoviesArray.push(movie);
//         }
//       })
//     );

//     // Remove duplicates based on filmCode
//     // let uniqueFilmCodes = new Set();
//     // filteredMoviesArray.forEach((movie) => {
//     //   const filmCode = movie.filmCode.slice(10);
//     //   if (!uniqueFilmCodes.has(filmCode)) {
//     //     uniqueFilmCodes.add(filmCode);
//     //     uniqueFilteredMovies.push(movie);
//     //   }
//     // });
//     const uniqueFilmCodes = new Set(
//       filteredMoviesArray.map((obj) =>
//         obj.uniqueFilmCode ? obj.uniqueFilmCode : null
//       )
//     );

//     const filteredArray = Array.from(uniqueFilmCodes).map((text) => {
//       const movie = moviesDetails.find(
//         (obj) => obj.uniqueFilmCode && obj.uniqueFilmCode === text
//       );
//       return movie ? movie : null;
//     });

//     const uniqueFilteredMovies = filteredArray.filter(
//       (movie) => movie !== null
//     );

//     await Promise.all(
//       uniqueFilteredMovies.map(async (movie) => {
//         const posterPath = "./public/uploads/" + movie.poster;
//         try {
//           await fs.promises.access(posterPath, fs.constants.F_OK);
//         } catch (err) {
//           movie.poster = "";
//         }
//       })
//     );

//     if (uniqueFilteredMovies.length) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MOVIE_FETCHED,
//         data: uniqueFilteredMovies.sort((a, b) => {
//           // Compare by filmOpeningDate first
//           if (b.filmOpeningDate !== a.filmOpeningDate) {
//             return b.filmOpeningDate - a.filmOpeningDate;
//           }
//           // If filmOpeningDate is equal, compare by movieName
//           return a.movieName.localeCompare(b.movieName);
//         }),
//       });
//     } else {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MOVIE_NOT_FETCHED,
//         data: [],
//       });
//     }
//   } catch (error) {
//     return handleErrorResponse(res, error);
//   }
// };
//new
export const getMoviesByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    if (regionId) {
      const findeRegion = await Region.findOne({
        _id: regionId,
        isActive: true,
      });

      if (!findeRegion) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: "No Movie found in this location",
          data: [],
        });
      }
    }

    const currentTime = moment().utcOffset("+05:30").toDate();

    // if (
    //   regionId == "65c1da3d65d1f285d00320d0" ||
    //   regionId == "66bcbd33e1e7e03658f838e0" ||
    //   regionId == "66a0ae2053ec4e7000c8d1a2"
    // ) {
    //   return false;
    // }

    // Fetch movies and filter by region in one go using aggregation
    const moviesDetails = await Movie.aggregate([
      {
        $match: {
          // status: { $nin: [2, 3] },
          status: 1,
          deletedStatus: 0,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "cinemas", // Assuming the collection name is 'cinemas'
          localField: "cinemaObjectId",
          foreignField: "_id",
          as: "cinemaObject",
        },
      },
      {
        $unwind: "$cinemaObject",
      },
      {
        $match: {
          "cinemaObject.regionId": new mongoose.Types.ObjectId(regionId),
        },
      },
      {
        $project: {
          cinemaObjectId: {
            _id: "$cinemaObject._id",
            regionId: "$cinemaObject.regionId",
          },
          movieCategory: 1,
          name: 1,
          category: 1,
          youtubeVideoUrl: 1,
          poster: 1,
          filmCode: 1,
          duration: 1,
          languages: 1,
          censorRating: 1,
          rating: 1,
          likes: 1,
          averageRating: 1,
          totalLikes: 1,
          filmOpeningDate: 1,
          uniqueFilmCode: 1,
          movieType: 1,
        },
      },
      {
        $sort: { filmOpeningDate: -1 },
      },
    ]);

    const sitesetting = await SiteSetting.findOne();
    const NextExtendedDaysForShows = sitesetting?.showExtendedDays || 10;
    const nextExtendDays = new Date();
    nextExtendDays.setUTCHours(0, 0, 0, 0);
    nextExtendDays.setUTCDate(nextExtendDays.getUTCDate() + NextExtendedDaysForShows);

    const movieIds = moviesDetails.map((movie) => movie._id);
    const showTimingCounts = await Show.aggregate([
      {
        $match: {
          filmObjectId: { $in: movieIds },
          // sessionRealShow: { $gte: currentTime },
          sessionRealShow: {
            $gte: currentTime,
            $lt: nextExtendDays
          },
          deletedStatus: 0,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$filmObjectId",
          count: { $sum: 1 },
        },
      },
    ]);
  //  console.log("now showing movie   region i ",regionId);
  //  console.log("now showing movie   data i ",showTimingCounts);
   
  //  console.log("now showing movie   movieIds i ",movieIds);
   
   
    const showTimingCountMap = new Map();
    showTimingCounts.forEach((count) => {
      showTimingCountMap.set(count._id.toString(), count.count);
    });

    const ratingAndReviews = await RatingAndReview.aggregate([
      {
        $match: {
          movieId: { $in: movieIds },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$movieId",
          totalNumberOfRatings: { $sum: 1 },
          sumOfRatings: { $sum: "$movieRate" },
        },
      },
    ]);

    const ratingMap = new Map();
    ratingAndReviews.forEach((rating) => {
      ratingMap.set(rating._id.toString(), rating);
    });

    const filteredMoviesArray = moviesDetails
      .filter((movie) => {
        const showTimingCount = showTimingCountMap.get(movie._id.toString());
        return showTimingCount > 0;
      })
      .map((movie) => {
        const ratingData = ratingMap.get(movie._id.toString());
        const totalNumberOfRatings = ratingData
          ? ratingData.totalNumberOfRatings
          : 0;
        const sumOfRatings = ratingData ? ratingData.sumOfRatings : 0;
        const averageRating =
          totalNumberOfRatings > 0
            ? sumOfRatings / totalNumberOfRatings
            : movie.rating;

        return {
          ...movie,
          showTimingCount: showTimingCountMap.get(movie._id.toString()),
          averageRating:
            totalNumberOfRatings > 0 ? averageRating : movie.rating,
          totalLikes: movie.totalLikes > 0 ? movie.totalLikes : movie.likes,
        };
      });

    /*   const uniqueFilmCodes = new Set(filteredMoviesArray.map(movie => movie.uniqueFilmCode));
    const uniqueFilteredMovies = Array.from(uniqueFilmCodes).map(uniqueFilmCode => {
      return filteredMoviesArray.find(movie => movie.uniqueFilmCode === uniqueFilmCode);
    }).filter(movie => movie !== null);*/

    const uniqueFilmCodes = new Set(
      filteredMoviesArray.map((obj) =>
        obj.uniqueFilmCode ? obj.uniqueFilmCode : null
      )
    );

    const filteredArray = Array.from(uniqueFilmCodes).map((text) => {
      const movie = moviesDetails.find(
        (obj) => obj.uniqueFilmCode && obj.uniqueFilmCode === text
      );
      return movie ? movie : null;
    });

    const uniqueFilteredMovies = filteredArray.filter(
      (movie) => movie !== null
    );

    // Check if poster files exist in parallel
    // await Promise.all(
    //   uniqueFilteredMovies.map(async (movie) => {
    //     if (movie.poster) {
    //       const posterPath = "./public/uploads/" + movie.poster;
    //       try {
    //         await fs.promises.access(posterPath, fs.constants.F_OK);
    //       } catch (err) {
    //         movie.poster = "";
    //       }
    //     }
    //   })
    // );

    uniqueFilteredMovies.sort((a, b) => {
      if (b.filmOpeningDate !== a.filmOpeningDate) {
        return b.filmOpeningDate - a.filmOpeningDate;
      }
      return a.name.localeCompare(b.name);
    });

    // Setting into the cache
    cacheHelper.setCache(
      cacheKeys.moviesDataByRegion(regionId),
      uniqueFilteredMovies,
      10 * 60
    );
    return res.status(200).json({
      status: StatusCodes.OK,
      message: uniqueFilteredMovies.length
        ? ResponseMessage.MOVIE_FETCHED
        : ResponseMessage.MOVIE_NOT_FETCHED,
      data: uniqueFilteredMovies,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#endregion

//#region upcomingMovies
export const upcomingMovies = async (req, res) => {
  try {
    const regionId = req.query.regionId;

    const upcomingMoviesDetails = await Movie.find(
      {
        status: 2,
        deletedStatus: 0,
        isActive: true,
        filmOpeningDate: { $gt: moment().utcOffset("+05:30").toDate() },
      },
      {
        cinemaId: 1,
        cinemaObjectId: 1,
        filmCode: 1,
        name: 1,
        poster: 1,
        languages: 1,
        createdAt: 1,
        updatedAt: 1,
        filmOpeningDate: 1,
        youtubeVideoUrl: 1,
        starCast: 1,
        category: 1,
        movieCategory: 1,
        movieType: 1,
        linkedNowPlayingMovieCode: 1,
      }
    )
      .populate("cinemaObjectId", "regionId")
      .populate("starCast.starCastId", "name")
      .lean()
      .sort({ filmOpeningDate: 1 });

    if (!upcomingMoviesDetails || upcomingMoviesDetails.length === 0) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }

    for (const movie of upcomingMoviesDetails) {
      if (!movie.linkedNowPlayingMovieCode) continue;

      // find movies by HO code
      const getAllMovieByCode = await Movie.find(
        {
          filmCode: RegExp(movie.linkedNowPlayingMovieCode + "$", "i"),
        },
        { cinemaId: 1 }
      ).lean();

      const allCinemaIds = getAllMovieByCode.map((m) => m.cinemaId);

      if (allCinemaIds.length === 0) continue;

      const cinemaDetails = await Cinema.find(
        {
          cinemaId: { $in: allCinemaIds },
          regionId: new mongoose.Types.ObjectId(regionId),
        },
        { cinemaId: 1 }
      ).lean();

      if (!cinemaDetails.length) continue;

      const createFilmCode =
        cinemaDetails[0].cinemaId + movie.linkedNowPlayingMovieCode;

      const getMovieByFilmCode = await Movie.findOne(
        { filmCode: createFilmCode , poster: { $ne: "" } },
        { _id: 1 }
      ).lean();

      movie.linkedNowPlaingMovieId = getMovieByFilmCode
        ? getMovieByFilmCode._id
        : "";
    }

    const moviesByMonth = upcomingMoviesDetails.reduce((acc, movie) => {
      const releaseMonthYear = new Date(
        movie.filmOpeningDate
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      const movieData = {
        _id: movie._id,
        cinemaId: movie.cinemaId,
        cinemaObjectId: movie.cinemaObjectId,
        filmCode: movie.filmCode,
        name: movie.name,
        poster: movie.poster,
        languages: movie.languages,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
        filmOpeningDate: movie.filmOpeningDate,
        youtubeVideoUrl: movie.youtubeVideoUrl,
        starCast: movie.starCast,
        category: movie.category,
        movieCategory: movie.movieCategory,
        movieType: movie.movieType,
        linkedNowPlayingMovie: movie.linkedNowPlaingMovieId || "",
      };

      if (!acc[releaseMonthYear]) {
        acc[releaseMonthYear] = {
          month: releaseMonthYear,
          movies: [movieData],
        };
      } else {
        acc[releaseMonthYear].movies.push(movieData);
      }

      return acc;
    }, {});

    const organizedMovies = Object.values(moviesByMonth);

    const filterMoviesByMonth = organizedMovies.filter((movie) => {
      const movieReleaseMonth = moment(movie.month, "MMM YYYY");
      const currentMonth = moment();
      return movieReleaseMonth.diff(currentMonth, "months") >= 0;
    });

    cacheHelper.setCache(
      cacheKeys.upcomingMovieData,
      filterMoviesByMonth,
      30 * 60
    );

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MOVIES_DETAILS,
      data: filterMoviesByMonth,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region moviesShowByCinema
export const moviesShowByCinema = async (req, res) => {
  try {
    let { cinemaId, date, regionId } = req.body;
    const showDate = moment(date || new Date()).format("YYYY-MM-DD");
    // if (
    //   regionId == "65c1da3d65d1f285d00320d0" ||
    //   regionId == "66bcbd33e1e7e03658f838e0" ||
    //   regionId == "66a0ae2053ec4e7000c8d1a2"
    // ) {
    //   return false;
    // }
    let cinemaDetails = await Cinema.findById(
      { _id: cinemaId, isActive: true },
      {
        displayName: true,
        address: true,
        googleUrl: true,
        cinemaId: true,
        cinema_images: true,
        cinemaAmenities: true,
        lat: true,
        long: true,
      }
    ).lean();

    const sitesetting = await SiteSetting.findOne();
    cinemaDetails.showExtendedDays = sitesetting?.showExtendedDays || 10;

    const moviesDetails = await Movie.find({
      deletedStatus: 0,
      cinemaObjectId: cinemaId,
    });

    const uniqueCodes = moviesDetails.map((movie) => movie.uniqueFilmCode);
    //   console.log("uniqueCodes",uniqueCodes)

    const moviesByUniqueCode = await Movie.find({
      uniqueFilmCode: { $in: uniqueCodes },
      deletedStatus: 0,
    });
    // console.log("moviesByUniqueCode",moviesByUniqueCode)
    const cinemas = await Cinema.find({
      deletedStatus: 0,
      isActive: true,
      _id: cinemaId,
    });

    const movieDetailsWithShows = await Show.aggregate([
      {
        $match: {
          cinemaObjectId: new mongoose.Types.ObjectId(cinemaId),
          sessionRealShow: {
            $gte: new Date(`${showDate}T00:00:00`),
            $lte: new Date(`${showDate}T23:59:59`),
          },
          screenStatus: { $ne: "C" },
          //  sessionRealShow: { $gte: new Date() },
          isActive: true,
          deletedStatus: 0,
        },
      },
      {
        $lookup: {
          from: "movies",
          let: { filmObjectId: "$filmObjectId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$filmObjectId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "movieDetails",
        },
      },
      {
        $unwind: "$movieDetails",
      },
      {
        $sort: {
          sessionRealShow: 1,
        },
      },
      {
        $group: {
          _id: "$filmObjectId",
          movieDetails: { $first: "$movieDetails" },
          shows: { $push: "$$ROOT" },
        },
      },
      {
        // $project: {
        //   _id: 0,
        //   movieDetails: 1,
        //   shows: 1,
        // },
        $project: {
          _id: 0,
          "movieDetails.name": 1,
          "movieDetails.movieType": 1,
          "movieDetails.censorRating": 1,
          "movieDetails._id": 1,
          "movieDetails.languages": 1,
          "movieDetails.category": 1,
          "movieDetails.cast": 1,
          "movieDetails.uniqueFilmCode": 1,
          "shows.sessionRealShow": 1,
          "shows.sessionAdditionalData": 1,
          "shows.pGroupCode": 1,
          "shows.cinemaId": 1,
          "shows._id": 1,
        },
      },
      {
        $sort: {
          "movieDetails.name": 1,
        },
      },
    ]);

    const uniqueFilteredMovies = movieDetailsWithShows.filter(
      (movie) => movie.movieDetails.uniqueFilmCode
    );

    const cinemaIds = [];
    cinemas.map((cinema) => {
      if (
        cinema?.regionId?.toString() == regionId.toString() &&
        cinema.displayName &&
        cinema.poster
      ) {
        cinemaIds.push(cinema._id);
      }
    });

    let matchstage = {
      cinemaObjectId: { $in: cinemaIds },
      sessionFilmFirstShow: {
        $gte: new Date(`${showDate}T00:00:00`),
        $lte: new Date(`${showDate}T23:59:59`),
      },
      screenStatus: { $ne: "C" },
      sessionRealShow: { $gte: new Date() },
      isActive: true,
      deletedStatus: 0,
    };
    // console.log("archid", matchstage);

    if (moviesDetails.uniqueFilmCode) {
      const filmCodes = moviesByUniqueCode.map((movieDetails) => {
        const filmCodeSlice = movieDetails.filmCode;
        return new RegExp(filmCodeSlice, "i");
      });
      matchstage.filmCode = {
        $in: filmCodes,
      };
    }
    const showTimings = await Show.aggregate([
      {
        $match: matchstage,
      },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaObjectId",
          foreignField: "_id",
          // pipeline: [
          //   {
          //     $match: {
          //       "$isActive": true,
          //     },
          //   },
          // ],
          as: "cinemaDetails",
        },
      },
      {
        $group: {
          _id: {
            cinemaId: "$cinemaId",
            cinemaDetails: "$cinemaDetails",
          },
          timings: {
            $addToSet: {
              startTime: "$sessionRealShow",
              additionalData: "$sessionAdditionalData",
              pGroupCode: "$pGroupCode",
              cinemaId: "$cinemaId",
              sessionId: "$sessionId",
              _id: "$_id",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          cinemaId: "$_id.cinemaId",
          cinemaDetails: {
            $cond: {
              if: { $isArray: "$_id.cinemaDetails" }, // Check if cinemaDetails is an array
              then: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: "$_id.cinemaDetails",
                      in: {
                        _id: "$$this._id",
                        address: "$$this.address",
                        displayName: "$$this.displayName",
                        cinemaId: "$$this.cinemaId",
                        // googleUrl:"$$this.googleUrl",
                        emailId: "$$this.emailId",
                        cinemaAmenities: "$$this.cinemaAmenities",
                        lat: "$$this.lat",
                        long: "$$this.long",
                      },
                    },
                  },
                  0,
                ],
              },
              else: "$_id.cinemaDetails", // If not an array, keep the original value
            },
          },
          screenId: "$_id.screenId",
          sessionId: "$_id.sessionId",
          timings: 1,
        },
      },
      {
        $sort: {
          cinemaId: 1,
        },
      },
      {
        $unwind: "$timings",
      },
      {
        $match: {
          "timings.startTime": { $gte: new Date() },
        },
      },
      {
        $match: {
          "timings.startTime": { $gte: new Date() },
        },
      },
      {
        $sort: {
          "timings.startTime": 1,
        },
      },
      {
        $lookup: {
          from: "prices",
          let: {
            pGroupCode: "$timings.pGroupCode",
            cinemaId: "$cinemaId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$pGroupCode", "$$pGroupCode"] },
                    { $eq: ["$cinemaId", "$$cinemaId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                tTypeDescription: 1,
                currentPrice: 1,
                pGroupCode: 1,
                cinemaId: 1,
                areaCatCode: 1,
              },
            },
          ],
          as: "priceDetails",
        },
      },
      {
        $group: {
          _id: {
            cinemaId: "$cinemaId",
            cinemaDetails: "$cinemaDetails",
          },
          timings: {
            $push: {
              $mergeObjects: [
                "$$CURRENT.timings",
                {
                  priceDetails: {
                    $filter: {
                      input: "$priceDetails",
                      as: "price",
                      cond: {
                        $and: [
                          {
                            $eq: [
                              "$$price.pGroupCode",
                              "$$CURRENT.timings.pGroupCode",
                            ],
                          },
                          { $eq: ["$$price.cinemaId", "$$CURRENT.cinemaId"] },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cinemaId: "$_id.cinemaId",
          cinemaDetails: "$_id.cinemaDetails",
          screenId: "$_id.screenId",
          timings: 1,
          sessionId: 1,
        },
      },
      {
        $sort: {
          cinemaId: 1,
        },
      },
    ]);
    // console.log("showTimings",showTimings);
    const cinemaMap = {};
    const sessionIds = Array.from(
      new Set(
        showTimings.flatMap((timing) =>
          timing.timings.map((tim) => tim.sessionId)
        )
      )
    );

    const seatData = await SeatFilter.find(
      { sessionId: { $in: sessionIds } },
      { area: 1, sessionId: 1, seatsAvail: 1, seatsTotal: 1 }
    );
    for (const timing of showTimings) {
      const cinemaId = timing.cinemaId;
      if (!cinemaMap[cinemaId]) {
        cinemaMap[cinemaId] = {
          cinemaDetails: timing.cinemaDetails,
          timings: [],
        };
      }
      const mtimings = [];
      for (const tim of timing.timings) {
        const area = [];
        for (const price of tim.priceDetails) {
          const seatsData = seatData.find(
            (data) =>
              data.sessionId === tim.sessionId &&
              data.area === price.areaCatCode
          );
          const availableSeats = seatsData ? seatsData.seatsAvail : 0;
          const totalSeats = seatsData ? seatsData.seatsTotal : 0;
          if (totalSeats) {
            area.push({
              code: price.areaCatCode,
              label: price.tTypeDescription,
              pGCode: price.pGroupCode,
              price: price.currentPrice,
              aSeats: availableSeats,
              tSeats: totalSeats,
              statusColour: getSeatStatus(availableSeats, totalSeats),
            });
          }
        }
        mtimings.push({
          sid: tim.sessionId,
          showId: tim._id,
          startTime: tim.startTime,
          aData: tim.additionalData,
          areas: area,
        });
      }
      cinemaMap[cinemaId].timings.push(...mtimings);
    }

    const response = Object.values(cinemaMap);
    // console.log("cinemaMap",cinemaMap);
    let timingCinemawise = response
      .filter((item) => {
        if (item.cinemaDetails._id.toString() == cinemaDetails._id.toString()) {
          return true;
        }
      })
      .map((row) => row.timings)
      .flatMap((item) => item);
    // console.log("timingCinemawise",timingCinemawise);
    function addTimingsToShow(arr, timings) {
      // Iterate through each movieDetail object
      let Data = arr.map((movieDetail) => {
        // Iterate through each show within the current movieDetail
        movieDetail.shows.map((show) => {
          // Find the matching timing for the current show based on showId
          // console.log(show , ":show734")
          const matchingTiming = timings.find(
            (timing) => timing.showId.toString() == show._id.toString()
          );

          // If a matching timing is found, add it to the current show object
          if (matchingTiming) {
            // You can adjust what information from the timing you want to add to the show here
            show.timing = matchingTiming; // Example: adding the entire matching timing object
          }
          return {
            ...show,
            timing: matchingTiming,
          };
        });
        return movieDetail;
      });

      return Data;
    }

    let filterData = addTimingsToShow(uniqueFilteredMovies, timingCinemawise);
    // console.log("filterData",filterData);
    
    if (movieDetailsWithShows.length > 0 || cinemaDetails || response) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIE_DETAILS_WITH_SHOWS,
        data: {
          movieDetailsWithShows: filterData,
          // timings: timingCinemawise,
          cinemaDetails,
          uniqueFilteredMovies,
          timingCinemawise,
        },
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    console.log(error, ":error");
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#endregion
export const rateAndReview = async (req, res) => {
  try {
    let { movieRate, connplexRate, movieReview, movieId } = req.body;

    const existingReview = await RatingAndReview.findOne({
      userId: req.user,
      movieId: movieId,
    });

    if (existingReview) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.RATE_AND_REVIEW_ALREADY_ADDED,
        data: [],
      });
    }

    const addRateAndReview = await RatingAndReview.create({
      connplexRate,
      movieRate,
      movieReview,
      userId: req.user,
      movieId: movieId,
    });
    const ratings = await RatingAndReview.find({
      movieId: movieId,
    });
    const sumOfRatings = ratings.reduce(
      (total, rating) => total + rating.movieRate,
      0
    );
    const totalNumberOfRatings = ratings.length;
    const averageRating = sumOfRatings / totalNumberOfRatings;
    await Movie.findOneAndUpdate(
      { _id: movieId },
      { $set: { averageRating: averageRating } }
    );
    if (addRateAndReview) {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.RATE_AND_REVIEW_RECORED,
        data: [],
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

// //#region like dislike movie by user
export const likeDislikeMovie = async (req, res) => {
  try {
    const { movieId } = req.body;
    let createLike;
    const findIsLiked = await MovieLikes.findOne({
      movieId: movieId,
      userId: req.user,
    });
    if (findIsLiked) {
      findIsLiked.isLiked = findIsLiked.isLiked ? false : true;
      await findIsLiked.save();
    } else {
      createLike = await MovieLikes.create({
        movieId: movieId,
        userId: req.user,
      });
    }
    let totalLikes = await MovieLikes.count({
      movieId: movieId,
      isLiked: true,
    });
    await Movie.findOneAndUpdate(
      { _id: movieId },
      { $set: { totalLikes: totalLikes } }
    );
    // if (totalLikes < movieDetails.likes) {
    //   totalLikes = movieDetails.likes + totalLikes;
    // }
    return res.status(200).json({
      status: StatusCodes.OK,
      message:
        (findIsLiked && findIsLiked.isLiked) || createLike
          ? ResponseMessage.MOVIE_LIKED
          : ResponseMessage.MOVIE_DIS_LIKED,
      data: findIsLiked
        ? { ...findIsLiked._doc, totalLikes }
        : { ...createLike._doc, totalLikes },
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#region movie as interested or uninterested
export const interestedUninterestedMovie = async (req, res) => {
  try {
    const { movieId, isInterested } = req.body;
    const userId = req.user;

    let interestedUninterestedMovieData = await MovieInterested.findOne({
      userId: userId,
      movieId: movieId,
    });

    if (interestedUninterestedMovieData) {
      await MovieInterested.updateOne(
        { userId: userId, movieId: movieId },
        { $set: { isInterested: isInterested } },
        { new: true }
      );
    } else {
      interestedUninterestedMovieData = await MovieInterested.create({
        userId: userId,
        movieId: movieId,
        isInterested: isInterested,
      });
    }
    let isMovieInterestedOrNot = await MovieInterested.findOne({
      userId: userId,
      movieId: movieId,
    });
    let responseMessage = isMovieInterestedOrNot.isInterested
      ? ResponseMessage.MOVIE_INTERESTED_ADDED
      : ResponseMessage.MOVIE_INTERESTED_REMOVED;
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: responseMessage,
      data: interestedUninterestedMovieData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region get interested or uninterested movie by userId
export const interestedMoviesByUserId = async (req, res) => {
  try {
    let { movieId, userId } = req.body;
    const interestedMovie = await MovieInterested.findOne({
      userId: userId,
      movieId: movieId,
    }).populate({
      path: "movieId",
      select: "_id name isActive",
    });

    if (interestedMovie) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIE_INTERESTED_LIST,
        data: interestedMovie,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.MOVIE_INTERESTED_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
//# Get Recent Releases movie

export const getRecentReleasesMoviesByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    if (regionId) {
      const findeRegion = await Region.findOne({
        _id: regionId,
        isActive: true,
      });

      if (!findeRegion) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: "No Movie found in this location",
          data: [],
        });
      }
    }

    const moviesDetails = await Movie.aggregate([
      {
        $match: {
          // status: { $nin: [2, 3] },
          status: 1,
          deletedStatus: 0,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaObjectId",
          foreignField: "_id",
          as: "cinemaObject",
        },
      },
      {
        $unwind: "$cinemaObject",
      },
      {
        $match: {
          "cinemaObject.regionId": new mongoose.Types.ObjectId(regionId),
        },
      },
      {
        $project: {
          cinemaObjectId: {
            _id: "$cinemaObject._id",
            regionId: "$cinemaObject.regionId",
          },
          movieCategory: 1,
          name: 1,
          category: 1,
          youtubeVideoUrl: 1,
          poster: 1,
          filmCode: 1,
          duration: 1,
          languages: 1,
          censorRating: 1,
          rating: 1,
          likes: 1,
          averageRating: 1,
          totalLikes: 1,
          filmOpeningDate: 1,
          uniqueFilmCode: 1,
          movieType: 1,
        },
      },
      {
        $sort: { filmOpeningDate: -1 },
      },
    ]);

    let currentTime = moment()
      .utcOffset("+05:30")
      .format("YYYY-MM-DDTHH:mm:ss");
    let filteredMoviesArray = [];
    await Promise.all(
      moviesDetails.map(async (movie) => {
        const totalRatings = await RatingAndReview.find({
          movieId: movie._id,
          isActive: true,
        });

        let sumOfRatings = 0;
        let totalNumberOfRatings = 0;
        let averageRating = 0;

        if (totalRatings && totalRatings.length > 0) {
          sumOfRatings = totalRatings.reduce(
            (total, rating) => total + rating.movieRate,
            0
          );
          totalNumberOfRatings = totalRatings.length;
          averageRating = sumOfRatings / totalNumberOfRatings;
        }

        if (movie.averageRating > 10) {
          movie.rating = movie.averageRating;
        }

        if (totalRatings.length > 0) {
          movie.averageRating = averageRating;
        } else {
          movie.averageRating = movie.rating;
        }

        if (movie.totalLikes > 0) {
          movie.totalLikes = movie.totalLikes;
        } else {
          movie.totalLikes = movie.likes;
        }

        filteredMoviesArray.push(movie);
      })
    );

    const uniqueFilmCodes = new Set(
      filteredMoviesArray.map((obj) =>
        obj.uniqueFilmCode ? obj.uniqueFilmCode : null
      )
    );

    const filteredArray = Array.from(uniqueFilmCodes).map((text) => {
      const movie = moviesDetails.find(
        (obj) => obj.uniqueFilmCode && obj.uniqueFilmCode === text
      );
      return movie ? movie : null;
    });

    const uniqueFilteredMovies = filteredArray.filter(
      (movie) => movie !== null
    );

    // Check poster availability and prepare cinema data
    // await Promise.all(
    //   uniqueFilteredMovies.map(async (movie) => {
    //     const posterPath = "./public/uploads/" + movie.poster;
    //     try {
    //       await fs.promises.access(posterPath, fs.constants.F_OK);
    //     } catch (err) {
    //       movie.poster = "";
    //     }
    //   })
    // );

    // Get all available shows in a single query
    // const currentTime = moment().utcOffset("+05:30").toDate();
    const cinemaIds = moviesDetails.map((m) => m.cinemaObjectId._id);
    const filmCodes = uniqueFilteredMovies.map((m) => m.filmCode);

    const availableShows = await Show.find({
      filmCode: { $in: filmCodes },
      cinemaObjectId: { $in: cinemaIds },
      sessionRealShow: { $gte: currentTime },
      isActive: true,
      deletedStatus: 0,
    }).select("filmCode");

    // Create a Set of film codes that have available shows
    const filmCodesWithShows = new Set(
      availableShows.map((show) => show.filmCode)
    );

    // Add isShowAvailable flag to each movie
    uniqueFilteredMovies.forEach((movie) => {
      movie.isShowAvailable = filmCodesWithShows.has(movie.filmCode);
    });

    if (uniqueFilteredMovies.length) {
      // Now Playing movies
      let sortByFilmOpeningDate = uniqueFilteredMovies.sort((a, b) => {
        // Compare by filmOpeningDate first
        if (b.filmOpeningDate !== a.filmOpeningDate) {
          return b.filmOpeningDate - a.filmOpeningDate;
        }
        // If filmOpeningDate is equal, compare by movieName
        return a.movieName.localeCompare(b.movieName);
      });

      // Recent Releases movies
      let filterByFilmOpeningDate = sortByFilmOpeningDate.filter(
        (data) =>
          moment().utc().diff(moment(data?.filmOpeningDate), "month") < 4
      );

      cacheHelper.setCache(
        cacheKeys.recentRelaseMovieDataByRegion(regionId),
        { recentReleasesMovies: filterByFilmOpeningDate },
        10 * 60
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIE_FETCHED,
        data: {
          recentReleasesMovies: filterByFilmOpeningDate,
        },
      });
    } else {
      cacheHelper.setCache(
        cacheKeys.recentRelaseMovieDataByRegion(regionId),
        [],
        10 * 60
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIE_NOT_FETCHED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
