import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { Admin } from "../../models/Admin.js";
import Movie from "../../models/Movies.js";
import RatingAndReview from "../../models/RatingAndReview.js";
import MovieInterested from "../../models/movieInterested.js";
import {
  handleErrorResponse,
  sanitizeSearchRegex,
} from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { UAParser } from "ua-parser-js";
import Logs from "../../models/Logs.js";
import moment from "moment";
import Show from "../../models/Shows.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";
import { Region } from "../../models/Region.js";
import Cinema from "../../models/Cinema.js";
import SeatFilter from "../../models/SessionAreaCount.js";
import mongoose from "mongoose";
import { deleteS3File } from "../../middleware/ImageUpload.js";

//#region AddEdit Cinema
export const addEditMovie = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let {
      name,
      youtubeVideoUrl,
      duration,
      category,
      cast,
      director,
      trending,
      topFour,
      cinemaId,
      signText,
      shortName,
      description,
      children,
      bookingOpeningDate,
      censorRating,
      languages,
      filmUpcomingFlag,
      filmFeatureFlag,
      filmNowShowingFlag,
      filmOpeningDate,
      status,
      rating,
      likes,
      crew,
      id,
      movieCategory,
      movieType,
      linkNowplayingMovieId
    } = req.body;

    let starArr = req.body.starCast ? JSON.parse(req.body.starCast) : "";
    let crewArr = req.body.crew ? JSON.parse(req.body.crew) : [];

    let array1;
    let array2;
    let crewArray1;
    let crewArray2;

    if (req.body.starCast && id) {
      let movie = await Movie.findById({ _id: id });
      const dataToSet = JSON.parse(req.body.starCast);
      array1 = dataToSet.filter((data) => Object.keys(data).includes("_id"));
      array2 = dataToSet.filter((data) => !Object.keys(data).includes("_id"));

      const remove = [];
      if (array1.length) {
        array1.map(async (data) => {
          await Movie.updateOne(
            { "starCast._id": data._id },
            {
              $set: {
                "starCast.$.starCastId": data.starCastId,
              },
            }
          );
        });
      }

      movie.starCast.map((x) => {
        const obj = array1.find((o) => o._id == x._id);
        if (!obj) {
          remove.push(x);
        }
      });

      if (remove.length) {
        let removeArr = remove.filter((data) => {
          return Object.keys(data._doc).includes("_id");
        });

        removeArr.map(async (data) => {
          await Movie.updateOne(
            { _id: id },
            { $pull: { starCast: { _id: data._id } } }
          );
        });
      }
    }

    if (req.body.crew && id) {
      let movie = await Movie.findById({ _id: id });
      const dataToSet = JSON.parse(req.body.crew);
      crewArray1 = dataToSet.filter((data) =>
        Object.keys(data).includes("_id")
      );
      crewArray2 = dataToSet.filter(
        (data) => !Object.keys(data).includes("_id")
      );

      const removeCrew = [];
      if (crewArray1.length) {
        crewArray1.map(async (data) => {
          await Movie.updateOne(
            { "crew._id": data._id },
            {
              $set: {
                "crew.$.starCastId": data.starCastId,
              },
            }
          );
        });
      }

      movie.crew.map((x) => {
        const obj = crewArray1.find((o) => o._id == x._id);
        if (!obj) {
          removeCrew.push(x);
        }
      });

      if (removeCrew.length) {
        let removeCrewArr = removeCrew.filter((data) => {
          return Object.keys(data._doc).includes("_id");
        });

        removeCrewArr.map(async (data) => {
          await Movie.updateOne(
            { _id: id },
            { $pull: { crew: { _id: data._id } } }
          );
        });
      }
    }

    let exist = await Movie.findOne({
      name,
      deletedStatus: 0,
    });

    // linking process
    const linkMovie = await Movie.findOne({_id: linkNowplayingMovieId, deletedStatus: 0});
    let linkedNowPlayingMovieCode = ""
    if(linkMovie && linkMovie?.filmCode){
      linkedNowPlayingMovieCode = linkMovie.filmCode.substring(4);
    }

    if (exist && !id) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.THIS_MOVIE_ALREADY_EXIST,
        data: [],
      });
    } else if (id) {
      let exist = await Movie.findOne({ _id: id, deletedStatus: 0 });

      if (!exist) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.MOVIES_NOT_FOUND,
          data: [],
        });
      }

      let updated = await Movie.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            youtubeVideoUrl,
            duration,
            category,
            cast,
            trending,
            topFour,
            director,
            censorRating,
            languages,
            cinemaId,
            signText,
            shortName,
            description,
            children,
            bookingOpeningDate,
            filmUpcomingFlag,
            filmFeatureFlag,
            filmNowShowingFlag,
            status,
            filmOpeningDate,
            rating,
            likes,
            movieCategory,
            movieType,
            poster: req.posterUrl,
            linkedNowPlayingMovieCode:linkedNowPlayingMovieCode
          },
          $push: {
            [array2 ? "starCast" : ""]: array2,
            [crewArray2 ? "crew" : ""]: crewArray2,
          },
        },
        { new: true }
      );

      if (!updated) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        await Logs.create({
          title: `Update Movie By Admin`,
          lastSync: Date.now(),
          movieId: updated?._id,
          ipAddress: IpAddress,
          webBrowser: browserName,
        });

        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.MOVIES_UPDATED,
          data: updated,
        });
      }
    } else {
      const newMovie = new Movie({
        name,
        youtubeVideoUrl,
        duration,
        category,
        cast,
        trending,
        topFour,
        director,
        censorRating,
        cinemaId,
        signText,
        shortName,
        description,
        children,
        bookingOpeningDate,
        languages,
        poster: req.posterUrl,
        filmUpcomingFlag,
        filmFeatureFlag,
        filmOpeningDate,
        filmNowShowingFlag,
        rating,
        likes,
        status,
        movieCategory,
        movieType,
        linkedNowPlayingMovieCode:linkedNowPlayingMovieCode
      });

      const data = await newMovie.save();
      let update = await Movie.findByIdAndUpdate(
        { _id: data._id },
        {
          $push: {
            [starArr ? "starCast" : ""]: starArr,
            [crewArr ? "crew" : ""]: crewArr,
          },
        },
        { new: true }
      );

      if (!data) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        await Logs.create({
          title: `New Movie added By Admin`,
          lastSync: Date.now(),
          movieId: update?._id,
          ipAddress: IpAddress,
          webBrowser: browserName,
        });

        cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData]);
        cacheHelper.deleteKeysByPrefix("region_movies_data_");
        cacheHelper.deleteKeysByPrefix("recent_release_region_movie_data_");

        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.MOVIES_ADDED,
          data: update,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
//#endregion

//#region getMovies
export const getMovies = async (req, res) => {
  try {
    let filterCondition = { status: 1, deletedStatus: 0 };
    let upcomingCondition = {
      status: 2,
      deletedStatus: 0,
    };

    const moviesDetails = await Movie.find(filterCondition)
      .populate("starCast.starCastId")
      .populate("cinemaObjectId")
      .sort({ createdAt: -1 })
      .lean();

    if (!moviesDetails.length) {
      return res.status(404).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MOVIES_NOT_FOUND,
        data: [],
      });
    } else {
      let uniqueFilmCodes = [];
      if (req.query.isUniqueCall == "true") {
        uniqueFilmCodes = moviesDetails
          .map((obj) => obj.filmCode)
          .filter((code) => code); // Only keep truthy values
      } else {
        uniqueFilmCodes = [
          ...new Set(
            moviesDetails
              .map((obj) => obj.uniqueFilmCode)
              .filter((code) => code)
          ),
        ];
      }

      const filteredArray = uniqueFilmCodes.map((code) => {
        // Find the first movie in moviesDetails that matches the code
        return moviesDetails.find((obj) =>
          req.query.isUniqueCall == "true"
            ? obj.filmCode === code
            : obj.uniqueFilmCode === code
        );
      });

      const finalArray = filteredArray.filter((movie) => movie !== null);

      const upcomingMoviesDetails = await Movie.find(upcomingCondition)
        .populate("starCast.starCastId")
        .sort({ createdAt: -1 });
      const combinedArray = [...finalArray, ...upcomingMoviesDetails];

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: combinedArray.sort((a, b) => b.createdAt - a.createdAt),
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getMoviesForGenerateUniqueCode = async (req, res) => {
  try {
    const { search = "", filmCode = "" } = req.query;

    const matchConditions = {
      status: 1,
      isActive: true,
      deletedStatus: 0,
      cinemaObjectId: { $exists: true, $nin: [null, ""] },
      filmCode: { $exists: true, $nin: [null, ""] },
    };

    if (search) {
      const regex = sanitizeSearchRegex(search);
      matchConditions.name = { $regex: regex };
    }

    if (filmCode) {
      const regex = sanitizeSearchRegex(filmCode);
      matchConditions.filmCode = { $regex: regex };
    } else {
      matchConditions.$or = [
        { uniqueFilmCode: { $exists: false } },
        { uniqueFilmCode: null },
        { uniqueFilmCode: "" },
      ];
    }

    const movies = await Movie.aggregate([
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaObjectId",
          foreignField: "_id",
          as: "cinemaObjectId",
        },
      },
      {
        $unwind: {
          path: "$cinemaObjectId",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          name: 1,
          poster: 1,
          uniqueFilmCode: 1,
          "cinemaObjectId._id": 1,
          "cinemaObjectId.name": 1,
          "cinemaObjectId.displayName": 1,
        },
      },
    ]);

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MOVIES_DETAILS,
      data: movies,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region remove Movies
export const removeMovies = async (req, res) => {
  try {
    const { uniqueFilmCode, id } = req.body;

    const updateMethod = id ? "findOneAndUpdate" : "updateMany";
    const updateQuery = id ? { _id: id } : { uniqueFilmCode };
    const updateOptions = id
      ? { $set: { deletedStatus: 1 } }
      : { $unset: { uniqueFilmCode: "" } };

    const removeMovies = await Movie[updateMethod](updateQuery, updateOptions, {
      new: true,
    });

    if (!removeMovies) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData]);
      cacheHelper.deleteKeysByPrefix("region_movies_data_");
      cacheHelper.deleteKeysByPrefix("recent_release_region_movie_data_");
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_REMOVED,
        data: removeMovies,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
//#endregion

//#region editMovies
export const editMovies = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let {
      filmCode,
      name,
      youtubeVideoUrl,
      duration,
      category,
      cast,
      trending,
      topFour,
      director,
      censorRating,
      languages,
      cinemaId,
      signText,
      shortName,
      description,
      children,
      bookingOpeningDate,
      filmUpcomingFlag,
      filmFeatureFlag,
      filmNowShowingFlag,
      status,
      filmOpeningDate,
      convenienceFees,
      rating,
      likes,
      id,
      crew,
      movieCategory,
      movieType,
    } = req.body;
    let starArr = req.body.starCast ? JSON.parse(req.body.starCast) : [];
    let crewArr = req.body.crew ? JSON.parse(crew) : [];
    let array1;
    let array2;
    let crewArray1;
    let crewArray2;
    if (filmCode && id) {
      // let movies = await Movie.find({
      //   filmCode: { $regex: `.*${filmCode.substring(4)}` },
      // });
      let movies = await Movie.find({
        uniqueFilmCode: filmCode,
      });
      if (!movies || movies.length === 0) {
        return res.status(404).json({
          status: StatusCodes.NOT_FOUND,
          message: ResponseMessage.MOVIES_NOT_FOUND,
          data: [],
        });
      }
      await Promise.all(
        movies.map(async (ele) => {
          if (req.files.poster) {
            // fs.unlink("./public/uploads/" + ele.poster, () => {});
            await deleteS3File(ele.poster);
          } else if (req.body.removePosterUrl) {
            // fs.unlink("./public/uploads/" + req.body.removePosterUrl, () => {});
            await deleteS3File(req.body.removePosterUrl);
            ele.poster = "";
            await ele.save();
          } else {
            const findPoster = await Movie.findOne({
              uniqueFilmCode: filmCode,
              poster: { $ne: "" },
            });
            req.posterUrl = ele.poster ? ele.poster : findPoster.poster;
          }

          // if (req.body.starCast) {
          //   let movie = await Movie.findById({ _id: ele._id });
          //   const dataToSet = JSON.parse(req.body.starCast);
          //   array1 = dataToSet.filter((data) =>
          //     Object.keys(data).includes("_id")
          //   );
          //   array2 = dataToSet.filter(
          //     (data) => !Object.keys(data).includes("_id")
          //   );
          //   const remove = [];
          //   if (array1.length) {
          //     array1.map(async (data) => {
          //       await Movie.updateOne(
          //         { _id: ele._id, "starCast._id": data._id },
          //         {
          //           $set: {
          //             "starCast.$.starCastId": data.starCastId,
          //           },
          //         }
          //       );
          //     });
          //   }
          //   movie.starCast.map((x) => {
          //     const obj = array1.find((o) => o._id == x._id);
          //     if (!obj) {
          //       remove.push(x);
          //     }
          //   });
          //   if (remove.length) {
          //     let removeArr = remove.filter((data) => {
          //       return Object.keys(data._doc).includes("_id");
          //     });
          //     removeArr.map(async (data) => {
          //       await Movie.updateOne(
          //         { _id: ele._id },
          //         { $pull: { starCast: { _id: data._id } } }
          //       );
          //     });
          //   }
          // }
          // if (req.body.crew) {
          //   let movie = await Movie.findById({ _id: id });
          //   const dataToSet = JSON.parse(req.body.crew);
          //   crewArray1 = dataToSet.filter((data) =>
          //     Object.keys(data).includes("_id")
          //   );
          //   crewArray2 = dataToSet.filter(
          //     (data) => !Object.keys(data).includes("_id")
          //   );
          //   const remove = [];
          //   if (crewArray1.length) {
          //     crewArray1.map(async (data) => {
          //       await Movie.updateOne(
          //         { "crew._id": data._id },
          //         {
          //           $set: {
          //             "crew.$.starCastId": data.starCastId,
          //           },
          //         }
          //       );
          //     });
          //   }
          //   movie.crew.map((x) => {
          //     const obj = crewArray1.find((o) => o._id == x._id);
          //     if (!obj) {
          //       remove.push(x);
          //     }
          //   });
          //   if (remove.length) {
          //     let removeArr = remove.filter((data) => {
          //       return Object.keys(data._doc).includes("_id");
          //     });
          //     removeArr.map(async (data) => {
          //       await Movie.updateOne(
          //         { _id: ele._id },
          //         { $pull: { crew: { _id: data._id } } }
          //       );
          //     });
          //   }
          // }
          let updated = await Movie.findByIdAndUpdate(
            { _id: ele._id },
            {
              $set: {
                name,
                youtubeVideoUrl,
                duration,
                category,
                cast,
                trending,
                topFour,
                director,
                censorRating,
                languages,
                cinemaId,
                signText,
                shortName,
                description,
                children,
                bookingOpeningDate,
                filmUpcomingFlag,
                filmFeatureFlag,
                filmNowShowingFlag,
                status,
                rating,
                likes,
                filmOpeningDate,
                convenienceFees,
                poster: req.posterUrl,
                movieCategory,
                movieType,
                [starArr.length ? `starCast` : ``]: starArr,
                [crewArr.length ? `crew` : ``]: crewArr,
              },
              // $push: {
              //   [array2.length ? `starCast` : ``]: array2,
              //   [crewArray2.length ? `crew` : ``]: crewArray2,
              // },
            }
          );
          await Logs.create({
            title: `Update Movie By Admin`,
            lastSync: Date.now(),
            movieId: updated?._id,
            ipAddress: IpAddress,
            webBrowser: browserName,
          });
        })
      );

      const findCinema = await Cinema.findOne({
        cinemaId: movies[0].cinemaId ?? "",
        deletedStatus: 0,
      });

      cacheHelper.deleteCache(cacheKeys.upcomingMovieData);
      if (findCinema && findCinema.regionId) {
        const regionId = findCinema.regionId.toString();
        cacheHelper.deleteCache(cacheKeys.moviesDataByRegion(regionId));
        cacheHelper.deleteCache(
          cacheKeys.recentRelaseMovieDataByRegion(regionId)
        );
      }
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_UPDATED,
        data: [],
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.FILMCODE_REQUIRED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Active de-active rate and review
export const activeDeactiveRateReview = async (req, res) => {
  try {
    const { id, isActive } = req.body;
    const findRateReview = await RatingAndReview.findOneAndUpdate(
      { _id: id },
      { $set: { isActive: Boolean(isActive) } },
      { new: true }
    );
    if (findRateReview) {
      const message = findRateReview.isActive
        ? ResponseMessage.RATE_AND_REVIEW_ACTIVATED
        : ResponseMessage.RATE_AND_REVIEW_IN_ACTIVATED;
      return res.status(200).json({
        status: StatusCodes.OK,
        message: message,
        data: findRateReview,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.RATE_AND_REVIEW_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Rate and review
export const listRateAndReview = async (req, res) => {
  try {
    let { movieId } = req.query;
    let condition;
    if (movieId) {
      condition = {
        movieId: movieId,
      };
    } else {
      condition = {};
    }
    const findRateReview = await RatingAndReview.find(condition)
      .populate("userId")
      .populate("movieId")
      .sort({ createdAt: -1 });
    if (findRateReview.length) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.LIST_OF_RATE_REVIEW,
        data: findRateReview,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.RATE_AND_REVIEW_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Active de-active rate and review
export const activeDeactiveMovie = async (req, res) => {
  try {
    const { uniqueFilmCode, isActive, id } = req.body;

    // If id is present, find and update one record, otherwise update many based on uniqueFilmCode
    const updateMethod = id ? "findOneAndUpdate" : "updateMany";
    const updateQuery = id ? { _id: id } : { uniqueFilmCode };
    const updateOptions = { $set: { isActive } };

    const findMovie = await Movie[updateMethod](updateQuery, updateOptions, {
      new: true,
    });

    if (findMovie) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: isActive
          ? ResponseMessage.MOVIE_ACTIVATED
          : ResponseMessage.MOVIE_IN_ACTIVATED,
        data: findMovie,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MOVIES_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#endregion

//#region generate unique movie code
export const generateUniqueMovie = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let { ids, movieId, uniqueFilmCode } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Please provide at least one valid movie ID in 'ids'.",
        data: [],
      });
    }

    const invalidIds = ids.filter((id) => !mongoose.isValidObjectId(id));

    if (invalidIds && invalidIds.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "One or more movie IDs are invalid.",
        data: [],
      });
    }

    ids = ids.map((id) => new mongoose.Types.ObjectId(id));

    if (movieId && !mongoose.isValidObjectId(movieId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid movie ID.",
        data: [],
      });
    }

    const result = await Movie.aggregate([
      {
        $match: {
          _id: { $in: ids },
          filmCode: { $exists: true },
        },
      },
      {
        $project: {
          trimmedCode: {
            $substr: ["$filmCode", 4, { $strLenCP: "$filmCode" }],
          },
        },
      },
      {
        $group: {
          _id: null,
          uniqueTrimmedCodes: { $addToSet: "$trimmedCode" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          allSame: { $eq: [{ $size: "$uniqueTrimmedCodes" }, 1] },
          count: 1,
        },
      },
    ]);

    const isSameFilmCode = result[0]?.allSame;

    if (!isSameFilmCode) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Film code is not same for selected movies",
        data: [],
      });
    }

    let uniqueCode;
    if (uniqueFilmCode) {
      uniqueCode = uniqueFilmCode;
    } else {
      const movieCount = await Movie.distinct("uniqueFilmCode");
      const lastCount =
        movieCount.length > 0
          ? parseInt(movieCount[movieCount.length - 1].slice(2))
          : 0;
      uniqueCode = `CN${(lastCount + 1).toString().padStart(9, "0")}`;
    }

    const findMovieDetails = await Movie.findOne({
      _id: movieId ? movieId : { $in: ids },
      uniqueFilmCode: { $exists: true, $nin: [null, ""] },
      poster: { $ne: "" },
    });

    let updateDetails;
    if (findMovieDetails) {
      const {
        _id,
        name,
        filmCode,
        cinemaId,
        cinemaObjectId,
        ...updateMovieFilDetails
      } = findMovieDetails.toObject();
      updateDetails = {
        uniqueFilmCode: uniqueCode,
        ...updateMovieFilDetails,
      };
    } else {
      updateDetails = {
        uniqueFilmCode: uniqueCode,
      };
    }

    if (uniqueFilmCode) {
      await Movie.updateMany(
        { uniqueFilmCode: uniqueCode, _id: { $nin: ids } },
        {
          $unset: {
            uniqueFilmCode: "",
          },
        }
      );
    }

    const updateMovie = await Movie.updateMany(
      { _id: { $in: ids } },
      {
        $set: updateDetails,
      }
    );
    await Logs.create({
      title: `Generate Unique Code for Movie By Admin`,
      lastSync: Date.now(),
      movieId: updateMovie?._id,
      ipAddress: IpAddress,
      webBrowser: browserName,
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MOVIES_UPDATED,
      data: updateMovie,
    });

    // updateMovie = await Movie.updateMany(
    //   {
    //     _id: { $in: ids },
    //   },
    //   {
    //     $set: {
    //       uniqueFilmCode: uniqueCode,
    //       name: findMovieDetails?.name,
    //       youtubeVideoUrl: findMovieDetails?.youtubeVideoUrl,
    //       duration: findMovieDetails?.duration,
    //       category: findMovieDetails?.category,
    //       censorRating: findMovieDetails?.censorRating,
    //       languages: findMovieDetails?.languages,
    //       description: findMovieDetails?.description,
    //       status: findMovieDetails?.status,
    //       rating: findMovieDetails?.rating,
    //       likes: findMovieDetails?.likes,
    //       filmOpeningDate: findMovieDetails?.filmOpeningDate,
    //       poster: findMovieDetails?.poster,
    //       movieCategory: findMovieDetails?.movieCategory,
    //       movieType: findMovieDetails?.movieType,
    //       starCast: findMovieDetails?.starCast,
    //       crew: findMovieDetails?.crew,
    //     },
    //   }
    // );
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region listing all interested movies
export const listInterestedMovies = async (req, res) => {
  try {
    const interestedMovies = await MovieInterested.find()
      .populate({
        path: "userId",
        select: "_id firstName lastName email mobileNumber isActive profile",
      })
      .populate({
        path: "movieId",
        select: "_id name isActive",
      });

    if (interestedMovies.length === 0) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.MOVIE_INTERESTED_NOT_FOUND,
        data: [],
      });
    }

    const formattedMovies = interestedMovies.map((movie) => ({
      id: movie._id,
      userDetails: movie.userId,
      movieDetails: movie.movieId,
      isInterested: movie.isInterested,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    }));

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MOVIE_INTERESTED_LIST,
      data: formattedMovies.reverse(),
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

// demo

export const getMoviesWithTodayShowTimings = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const startTime = new Date(`${today}T00:00:00`);
    const endTime = new Date(`${today}T23:59:59`);

    // 1. Fetch active regions
    const regions = await Region.find({
      isActive: true,
      deletedStatus: 0,
    }).select("_id region");

    const regionMap = new Map();
    const regionIds = [];

    regions.forEach((region) => {
      regionIds.push(region._id.toString());
      regionMap.set(region._id.toString(), region.region);
    });

    // 2. Fetch active cinemas in those regions
    const cinemas = await Cinema.find({
      regionId: { $in: regionIds },
      isActive: true,
      deletedStatus: 0,
    }).select("_id displayName regionId cinemaId");

    const cinemaMap = new Map();
    const cinemaIds = [];

    cinemas.forEach((cinema) => {
      cinemaIds.push(cinema._id);
      cinemaMap.set(cinema._id.toString(), {
        displayName: cinema.displayName,
        cinemaCode: cinema.cinemaId,
        regionId: cinema.regionId?.toString(),
        regionName: regionMap.get(cinema.regionId?.toString()) || "",
      });
    });

    // 3. Fetch today's shows
    const shows = await Show.find({
      cinemaObjectId: { $in: cinemaIds },
      sessionRealShow: { $gte: startTime, $lte: endTime },
      isActive: true,
      deletedStatus: 0,
      screenStatus: { $ne: "C" },
    })
      .sort({ sessionRealShow: 1 })
      .select("_id sessionId sessionRealShow cinemaObjectId filmObjectId");

    // 4. Fetch related movies
    const movieIds = [...new Set(shows.map((s) => s.filmObjectId.toString()))];

    const movies = await Movie.find({
      _id: { $in: movieIds },
      isActive: true,
      deletedStatus: 0,
    }).select("_id name uniqueFilmCode filmCode");

    const movieMap = new Map();
    movies.forEach((movie) => {
      movieMap.set(movie._id.toString(), {
        name: movie.name,
        uniqueFilmCode: movie.uniqueFilmCode,
        filmCode: movie.filmCode,
      });
    });

    // 5. Group shows by cinemaId + movieId
    const grouped = shows.reduce((acc, show) => {
      const cinemaId = show.cinemaObjectId.toString();
      const movieId = show.filmObjectId.toString();
      const key = `${cinemaId}-${movieId}`;

      const cinemaData = cinemaMap.get(cinemaId) || {};
      const movieData = movieMap.get(movieId) || {};

      if (!acc[key]) {
        acc[key] = {
          regionId: cinemaData.regionId || "",
          regionName: cinemaData.regionName || "",
          cinemaId,
          cinemaCode: cinemaData.cinemaCode || "",
          cinemaName: cinemaData.displayName || "",
          movieId,
          name: movieData.name || "",
          uniqueFilmCode: movieData.uniqueFilmCode || "",
          filmCode: movieData.filmCode || "",
          showTimings: [],
        };
      }

      acc[key].showTimings.push({
        showId: show._id,
        sessionId: show.sessionId,
        startTime: show.sessionRealShow,
      });

      return acc;
    }, {});

    const finalArray = Object.values(grouped);

    return res.status(200).json({
      status: 200,
      message: finalArray.length
        ? "Today's show timings fetched."
        : "No shows found.",
      data: finalArray,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error?.message || error,
    });
  }

  //   try {
  //     const today = moment().format("YYYY-MM-DD");
  //     const startTime = new Date(`${today}T00:00:00`);
  //     const endTime = new Date(`${today}T23:59:59`);

  //     // 1. Get all active cinemas in active regions
  //     const regions = await Region.find({
  //       isActive: true,
  //       deletedStatus: 0,
  //     }).select("_id region");
  //     // const regionIds = regions.map((r) => r._id.toString());
  //   const regionMap = new Map();
  //     const regionIds = [];

  //     regions.forEach((region) => {
  //       regionIds.push(region._id.toString());
  //       regionMap.set(region._id.toString(), region.region);
  //     });
  //     const cinemas = await Cinema.find({
  //       regionId: { $in: regionIds },
  //       isActive: true,
  //       deletedStatus: 0,
  //     }).select("_id displayName regionId cinemaId");

  //     const cinemaMap = new Map();
  //     const cinemaIds = [];

  //       cinemas.forEach((cinema) => {
  //       cinemaIds.push(cinema._id);
  //       cinemaMap.set(cinema._id.toString(), {
  //         displayName: cinema.displayName,
  //         cinemaCode: cinema.cinemaId,
  //          regionId: cinema.regionId?.toString(),
  //         regionName: regionMap.get(cinema.regionId?.toString()) || "",
  //       });
  //     });

  //     // 2. Get all shows for today
  //     const shows = await Show.find({
  //       cinemaObjectId: { $in: cinemaIds },
  //       sessionRealShow: { $gte: startTime, $lte: endTime },
  //       isActive: true,
  //       deletedStatus: 0,
  //       screenStatus: { $ne: "C" },
  //     })
  //       .sort({ sessionRealShow: 1 }) // <-- Add this
  //       .select("_id sessionId sessionRealShow cinemaObjectId filmObjectId");

  //     const movieIds = [...new Set(shows.map((s) => s.filmObjectId.toString()))];
  //     const movies = await Movie.find({
  //       _id: { $in: movieIds },
  //       isActive: true,
  //       deletedStatus: 0,
  //     }).select("_id name uniqueFilmCode filmCode");

  //     const movieMap = new Map();
  //    movies.forEach((movie) => {
  //       movieMap.set(movie._id.toString(), {
  //         name: movie.name,
  // uniqueFilmCode: movie.uniqueFilmCode,
  //         filmCode: movie.filmCode,
  //       });
  //     });

  //     // 3. Construct the response
  //     // const grouped = {};

  //     // for (const show of shows) {
  //     //   const cinemaId = show.cinemaObjectId.toString();
  //     //   const movieId = show.filmObjectId.toString();
  //     //   const key = `${cinemaId}-${movieId}`;

  //     //   if (!grouped[key]) {
  //     //     grouped[key] = {
  //     //       cinemaId,
  //     //       cinemaName: cinemaMap.get(cinemaId) || "",
  //     //       movieId,
  //     //       name: movieMap.get(movieId) || "",
  //     //       showTimings: [],
  //     //     };
  //     //   }

  //     //   grouped[key].showTimings.push({
  //     //     showId: show._id,
  //     //     sessionId: show.sessionId,
  //     //     startTime: show.sessionRealShow,
  //     //   });
  //     // }
  //     const grouped = shows.reduce((acc, show) => {
  //       const cinemaId = show.cinemaObjectId.toString();
  //       const movieId = show.filmObjectId.toString();
  //       const key = `${cinemaId}-${movieId}`;
  //   const cinemaData = cinemaMap.get(cinemaId) || {};
  //       const movieData = movieMap.get(movieId) || {};
  //       if (!acc[key]) {
  //         acc[key] = {
  //             regionId: cinemaData.regionId || "",
  //           regionName: cinemaData.regionName || "",
  //           cinemaId,
  //           cinemaCode: cinemaData.cinemaCode || "",
  //           cinemaName: cinemaData.displayName || "",
  //           movieId,
  //           name: movieData.name || "",
  //           uniqueFilmCode: movieData.uniqueFilmCode || "",
  //           filmCode: movieData.filmCode || "",
  //           showTimings: [],
  //         };
  //       }
  //       acc[key].showTimings.push({
  //         showId: show._id,
  //         sessionId: show.sessionId,
  //         startTime: show.sessionRealShow,
  //       });

  //       return acc;
  //     }, {});

  //     const finalArray = Object.values(grouped);

  //     return res.status(200).json({
  //       status: 200,
  //       message: finalArray.length ? "Today's show timings fetched." : "No shows found.",
  //       data: finalArray,
  //     });
  //   } catch (error) {
  //     return handleErrorResponse(res, error);
  //   }
};

export const getMoviesForFilterList = async (req, res) => {
  try {
    // Fetch both Now Showing and Upcoming movies
    const movies = await Movie.find(
      {
        status: { $in: [1, 2] },
        deletedStatus: 0,
      },
      {
        _id: 1,
        name: 1,
        filmCode: 1,
        uniqueFilmCode: 1,
      }
    ).lean();

    if (!movies.length) {
      return res.status(404).json({
        status: StatusCodes.BAD_REQUEST,
        message: "No movies found",
        data: [],
      });
    }

    const isUniqueCall = req.query.isUniqueCall === "true";
    const uniqueMap = new Map();

    for (const movie of movies) {
      const key = isUniqueCall ? movie.filmCode : movie.uniqueFilmCode;

      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: movie._id,
          name: movie.name,
          filmCode: movie.filmCode,
          uniqueFilmCode: movie.uniqueFilmCode || "",
          isActive: true,
        });
      }
    }

    const uniqueMovies = Array.from(uniqueMap.values());

    return res.status(200).json({
      status: StatusCodes.OK,
      message: "Unique movie names fetched successfully",
      data: uniqueMovies,
      // data:movies
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
