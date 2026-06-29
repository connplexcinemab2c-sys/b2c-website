import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Transaction from "../../models/Transaction.js";
import {
  createVistaLog,
  getSeatStatus,
  handleErrorResponse,
} from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import Movie from "../../models/Movies.js";
import Cinema from "../../models/Cinema.js";
import moment from "moment";
import momentTimezone from "moment-timezone";
import Show from "../../models/Shows.js";
import mongoose from "mongoose";
import { bookingSuccess } from "../../utils/Mailers.js";
import SeatFilter from "../../models/SessionAreaCount.js";
import { rollbackCoupanService } from "../../services/vistaServices/promotionCoupan.js";
import BookingSession from "../../models/BookingSession.js";
import { createLog } from "../../services/LogsServices.js";

//#region initBooking
export const initBooking = async (req, res) => {
  try {
    let { strCinemaId, movieId } = req.params;
    // Check if the movie is deactivated by admin and user is in booking mode.
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.MOVIE_NO_LONGER_AVAILABLE,
        data: [],
      });
    }

    const deviceType = req.headers["x-device-type"] || "";

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/InitBooking?strCinemaId=${strCinemaId}`,
      headers: {},
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     strCinemaId: strCinemaId,
    //   },
    // };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          let transId = response.data.data;
          let isDuplicate = true;

          while (isDuplicate) {
            const existingTransaction = await Transaction.findOne({
              initTransId: transId,
            });

            if (!existingTransaction) {
              isDuplicate = false;
              break;
            }

            const retryResponse = await axios.request(config);
            if (retryResponse.data.Status == 1) {
              transId = retryResponse.data.data;
            } else {
              return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: retryResponse.data,
              });
            }
          }

          createLog({
            transaction_id: transId,
            type: "Booking",
            step: {
              logType: "bookingStarted",
              success: true,
              message: "Init Booking Successful",
              timestamp: new Date().toISOString(),
            },
          });

          await new Transaction({
            initTransId: transId,
            ...(deviceType ? { bookedFrom: deviceType } : {}),
            logs: [{ initBooking: new Date() }],
          }).save();
          const newBookingSession = await new BookingSession({
            initTransId: transId,
          }).save();
          // createVistaLog(
          //   null,
          //   null,
          //   "Ticket",
          //   "InitBooking",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.TRANS_ID,
            data: {
              ...response.data,
              initTransId: transId,
              bookingSessionId: newBookingSession._id,
            },
          });
        } else {
          // createVistaLog(
          //   null,
          //   null,
          //   "Ticket",
          //   "InitBooking",
          //   vistaLogRequest,
          //   response.data,
          //   "Failed"
          // );

          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //     null,
        //     null,
        //     "Ticket",
        //     "InitBooking",
        //     vistaLogRequest,
        //     error.response.data,
        //     "Failed"
        //   );
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

const handleBookingReinitiation = async (cinemaId, strTransId, deviceType) => {
  // Check existing transaction is having seat data or not
  const existingTransaction = await Transaction.findOne(
    {
      initTransId: strTransId,
    },
    {
      addSeatData: 1,
      setSeatData: 1,
      initTransId: 1,
      logs: 1,
    }
  );

  // If there's existing transaction with both addSeatData and setSeatData, re-initiate booking
  if (
    existingTransaction &&
    existingTransaction.addSeatData != null &&
    existingTransaction.setSeatData != null
  ) {
    createLog({
      transaction_id: strTransId,
      type: "Booking",
      step: {
        logType: "DuplicateTransactionId",
        success: true,
        message: "Re-initiating booking due to existing seat data",
        timestamp: new Date().toISOString(),
      },
    });

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/InitBooking?strCinemaId=${cinemaId}`,
      headers: {},
    };

    const response = await axios.request(config);
    if (response.data.Status == 1) {
      let newTransId = response.data.data;
      let isDuplicate = true;

      while (isDuplicate) {
        const existingTrans = await Transaction.findOne({
          initTransId: newTransId,
        });

        if (!existingTrans) {
          isDuplicate = false;
          break;
        }

        const retryResponse = await axios.request(config);
        if (retryResponse.data.Status == 1) {
          newTransId = retryResponse.data.data;
        } else {
          throw new Error("Failed to get a unique transId");
        }
      }
      createLog({
        transaction_id: newTransId,
        type: "Booking",
        step: {
          logType: "ReInitiatedBooking",
          success: true,
          message: "Init Booking Successful for re-initiated booking",
          timestamp: new Date().toISOString(),
        },
      });

      await new Transaction({
        initTransId: newTransId,
        ...(deviceType ? { bookedFrom: deviceType } : {}),
        logs: [{ ReInitBooking: new Date() }],
      }).save();

      return newTransId;
    } else {
      createLog({
        transaction_id: strTransId,
        type: "Booking",
        step: {
          logType: "FailedReInitiatedBooking",
          success: true,
          message: "Init Booking Successful for re-initiated booking",
          timestamp: new Date().toISOString(),
        },
      });
      throw new Error("Failed to re-initiate booking");
    }
  }
  console.log("No re-initiation needed for transId:", strTransId);
  return strTransId;
};

//#region addSeats
export const addSeats = async (req, res) => {
  let { id, showId } = req.body;
  const cinemaId = id.split("|")[0];
  let strTransId = id.split("|")[1];
  const strSessId = id.split("|")[2];
  const strType = id.split("|")[3];
  const intQty = id.split("|")[4];
  try {
    const findShowById = await Show.findById({ _id: showId });
    if (findShowById) {
      const findActiveShowByCinemaId = await Show.find({
        filmCode: findShowById?.filmCode,
        sessionId: strSessId,
        isActive: true,
      });

      if (findActiveShowByCinemaId.length == 0) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.SHOW_NOT_AVAILABLE,
          data: [],
        });
      }
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SHOW_NOT_AVAILABLE,
        data: [],
      });
    }

    try {
      const deviceType = req.headers["x-device-type"] || "";
      strTransId = await handleBookingReinitiation(
        cinemaId,
        strTransId,
        deviceType
      );
    } catch (error) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
        data: null,
      });
    }

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/AddSeats?CinemaId=${cinemaId}&strTransId=${strTransId}&strSessId=${strSessId}&strType=${strType}&intQty=${intQty}`,
      headers: {},
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     CinemaId: cinemaId,
    //     strTransId: strTransId,
    //     strSessId: strSessId,
    //     strType: strType,
    //     intQty: intQty,
    //   },
    // };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          createLog({
            transaction_id: strTransId,
            session_id: strSessId,
            type: "Booking",
            step: {
              // logType: "bookingStarted",
              success: true,
              message: "Add Seats Successful",
              timestamp: new Date().toISOString(),
            },
          });

          await Transaction.findOneAndUpdate(
            { initTransId: strTransId },
            {
              $set: { addSeatData: response.data.data },
              $push: {
                logs: {
                  addSeat: new Date(),
                },
              },
            }
          ).sort({ createdAt: -1 });
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "AddSeats",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ADD_SEAT_SUCCESS,
            data: response.data,
          });
        } else {
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "AddSeats",
          //   vistaLogRequest,
          //   response.data,
          //   "Failed"
          // );

          createLog({
            transaction_id: strTransId,
            session_id: strSessId,
            type: "Booking",
            step: {
              success: false,
              // logType: "bookingStarted",
              message: "Add Seats Failed",
              error: response.data,
              timestamp: new Date().toISOString(),
            },
          });
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   strTransId,
        //   null,
        //   "Ticket",
        //   "AddSeats",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        createLog({
          transaction_id: strTransId,
          session_id: strSessId,
          type: "Booking",
          step: {
            // logType: "bookingStarted",
            success: false,
            message: "Add Seats Failed",
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    createLog({
      transaction_id: strTransId,
      type: "Booking",
      step: {
        // logType: "bookingStarted",
        success: true,
        message: "Add Seats Successful",
        timestamp: new Date().toISOString(),
      },
    });
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region setSeats
export const setSeats = async (req, res) => {
  try {
    let {
      cinemaId,
      strTransId,
      lngSessionId,
      strSelectedSeats,
      movieObjId,
      cinemaObjId,
      showObjId,
      paymentsBreakup,
    } = req.body;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/SetSeats?strCinemaId=${cinemaId}&strTransId=${strTransId}&lngSessionId=${lngSessionId}&strSelectedSeats=${strSelectedSeats}`,
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     strCinemaId: cinemaId,
    //     strTransId: strTransId,
    //     lngSessionId: lngSessionId,
    //     strSelectedSeats: strSelectedSeats,
    //   },
    // };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          createLog({
            transaction_id: strTransId,
            type: "Booking",
            step: {
              success: true,
              message: "Set Seats Successful",
              timestamp: new Date().toISOString(),
            },
          });
          await Transaction.findOneAndUpdate(
            { initTransId: strTransId },
            {
              $set: {
                setSeatData: response.data.data,
                movieId: movieObjId,
                cinemaId: cinemaObjId,
                showId: showObjId,
                // paymentsBreakup: JSON.parse(paymentsBreakup),
              },
            }
          ).sort({ createdAt: -1 });
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "SetSeats",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SET_SEAT_SUCCESS,
            data: response.data.data,
          });
        } else {
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "SetSeats",
          //   vistaLogRequest,
          //   response.data,
          //   "Failed"
          // );

          createLog({
            transaction_id: strTransId,
            type: "Booking",
            step: {
              success: false,
              message: "Set Seats Failed",
              error: response.data,
              timestamp: new Date().toISOString(),
            },
          });
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   strTransId,
        //   null,
        //   "Ticket",
        //   "SetSeats",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        createLog({
          transaction_id: strTransId,
          type: "Booking",
          step: {
            success: false,
            message: "Set Seats Failed",
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    createLog({
      transaction_id: strTransId,
      type: "Booking",
      step: {
        success: false,
        message: "Set Seats Failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
    });
    return handleErrorResponse(res, error);
  }
};
//#endregion

export const moviesDetailsWithshow = async (req, res) => {
  try {
    let { id } = req.body;
    const regionId = id.split("|")[0];
    const movieId = id.split("|")[2];
    const date = id.split("|")[1];

    const moviesDetails = await Movie.findOne({
      _id: movieId,
      deletedStatus: 0,
    });

    const uniqueCode = moviesDetails.uniqueFilmCode;

    if (!uniqueCode) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }

    const moviesByUniqueCode = await Movie.find({
      uniqueFilmCode: uniqueCode,
      deletedStatus: 0,
    });
    const showDate = moment(date || new Date()).format("YYYY-MM-DD");
    const cinemas = await Cinema.find({ deletedStatus: 0, isActive: true });

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
      sessionRealShow: {
        $gte: new Date(`${showDate}T00:00:00`),
        $lte: new Date(`${showDate}T23:59:59`),
      },
      screenStatus: { $ne: "C" },
      //  sessionRealShow: { $gte: new Date() },
      isActive: true,
      deletedStatus: 0,
    };

    if (moviesDetails.uniqueFilmCode) {
      const filmCodes = moviesByUniqueCode.map((movieDetails) => {
        const filmCodeSlice = movieDetails.filmCode;
        // .slice(4);
        return new RegExp(filmCodeSlice, "i");
      });
      matchstage.filmCode = {
        $in: filmCodes,
      };
      // matchstage.filmCode = {
      //   $regex: moviesDetails.filmCode.slice(
      //     moviesDetails.filmCode.includes("CN") ? 4 : 10,
      //     moviesDetails.filmCode.length
      //   ),
      //   $options: "i",
      // };
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

    const cinemaMap = {};
    // Fetch all unique session IDs from showTimings
    const sessionIds = Array.from(
      new Set(
        showTimings.flatMap((timing) =>
          timing.timings.map((tim) => tim.sessionId)
        )
      )
    );

    // Batch fetch seat data for all session IDs
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
          // Find the corresponding seat data for the session and area code
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
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MOVIES_DETAILS,
      data: response,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#region getSeatLayout
export const getSeatLayout = async (req, res) => {
  try {
    let { strCinemaId, strSessId } = req.params;

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/GetSeatLayout?strCinemaId=${strCinemaId}&strTransId=&strSessId=${strSessId}`,
      headers: {},
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     strCinemaId: strCinemaId,
    //     strTransId: "",
    //     strSessId: strSessId
    //   },
    // };

    axios
      .request(config)
      .then((response) => {
        // let vistaLogStatus = response.data.Status == 1 ? "Success" : "Failed";

        //   createVistaLog(
        //     null,
        //     null,
        //     "Ticket",
        //     "GetSeatLayout",
        //     vistaLogRequest,
        //     response.data,
        //     vistaLogStatus
        //   );

        if (response.data.data.length !== 0) {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SEAT_LAYOUT,
            data: response.data,
          });
        } else {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   null,
        //   null,
        //   "Ticket",
        //   "GetSeatLayout",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region ShowTimeByMovieID
export const showTimeByCinemaIdAndMovie = async (req, res) => {
  try {
    let { id } = req.body;
    const cinemaId = id.split("|")[0];
    const movieId = id.split("|")[2];
    const date = id.split("|")[1];
    const showDate = moment(date || new Date()).format("YYYY-MM-DD");
    const nextDate = moment(date || new Date())
      .add(1, "days")
      .format("YYYY-MM-DD");

    const cinema = await Cinema.findOne({ _id: cinemaId, deletedStatus: 0 });
    let movieDetails = await Movie.findById({ _id: movieId });
    const uniqueCode = movieDetails.uniqueFilmCode;
    const moviesByUniqueCode = await Movie.find({
      uniqueFilmCode: uniqueCode,
      deletedStatus: 0,
    });

    const filmCodes = moviesByUniqueCode.map((movieDetails) => {
      const filmCodeSlice = movieDetails?.filmCode;
      return new RegExp(filmCodeSlice, "i");
    });

    let showTimings = [];
    if (cinema.displayName && cinema.poster) {
      showTimings = await Show.aggregate([
        {
          $match: {
            cinemaObjectId: new mongoose.Types.ObjectId(cinemaId),
            filmCode: { $in: filmCodes },
            // {
            //   $regex: movieDetails.filmCode.slice(
            //     10,
            //     movieDetails.filmCode.length
            //   ),
            //   $options: "i",
            // },
            sessionRealShow: {
              $gte: new Date(`${showDate}T00:00:00`),
              $lte: new Date(`${showDate}T23:59:59`),
            },
            //sessionRealShow: { $gte: new Date() },
            screenStatus: { $ne: "C" },
            isActive: true,
            deletedStatus: 0,
          },
        },
        {
          $project: {
            _id: 1,
            sessionId: 1,
            sessionRealShow: 1,
            sessionFinishShow: 1,
            sessionFilmFirstShow: 1,
            cinemaId: 1,
            screenName: 1,
            cinemaObjectId: 1,
            pGroupCode: 1,
            sessionAdditionalData: 1,
          },
        },
        {
          $sort: {
            sessionRealShow: 1, // 1 for ascending order, -1 for descending order
          },
        },
      ]);
    }

    const movie = await Movie.findOne({ _id: movieId, deletedStatus: 0 });
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MOVIES_DETAILS,
      data: showTimings,
      movie,
      cinema,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getBookingDetailsByTransId
export const bookingDetailsByTransId = async (req, res) => {
  try {
    const { initTransId } = req.body;

    const bookingDetails = await getBookingDetailsByTransId(initTransId);

    if (!bookingDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.BOOKING_DETAILS,
      data: bookingDetails,
    });

  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region MyBookingsUser
export const getAllBookingUser = async (req, res) => {
  try {
    const bookingDetails = await Transaction.find(
      {
        userId: req.user,
        status: { $in: [1, 3, 6, 4] },
        deletedStatus: 0,
      },
      {
        "addSeatData.strBookId": true,
        "setSeatData.strSeatInfo": true,
        cancellationStatus: true,
        initTransId: true,
        cinemaId: true,
        movieId: true,
        showId: true,
        paymentsStatus: true,
        userId: true,
        commitStatus: true,
        refundStatus: true,
        paymentsBreakup: true,
        "paymentResponse.id": true,
        "paymentResponse.amount": true,
        "paymentResponse.status": true,
        "paymentResponse.method": true,
        "paymentResponse.payment_mode": true,
        foodAndBvgResponse: true,
        fAndBDetails: true,
        status: true,
        finalBookingCalculation: true,
      }
    )
      .populate({
        path: "cinemaId",
        select: [
          "cinemaName",
          "address",
          "googleUrl",
          "emailId",
          "convenienceFees",
        ],
      })
      .populate({
        path: "movieId",
        select: ["name", "poster", "category"],
      })
      .populate({
        path: "showId",
        select: ["sessionRealShow", "screenName"],
      })
      .populate({
        path: "couponId",
        select: [
          "_id",
          "couponId",
          "couponTitle",
          "discountType",
          "couponCategory",
          "discount",
          "couponUpTo",
          "couponType",
        ],
      })
      .sort({ createdAt: -1 });
    if (!bookingDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BOOKING_DETAILS,
        data: bookingDetails,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region get all food and beverage order history by users
export const getAllFoodAndBvgOrderHistory = async (req, res) => {
  try {
    const foodAndBvgOrderDetails = await Transaction.find(
      {
        userId: req.user,
        status: { $in: [1, 3, 6] },
        deletedStatus: 0,
      },
      {
        userId: true,
        foodAndBvgResponse: true,
        fAndBDetails: true,
      }
    ).sort({ createdAt: -1 });
    if (!foodAndBvgOrderDetails) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.FOOD_BVG_ORDER_NOT_FOUND,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FOOD_BVG_ORDER_LIST,
        data: foodAndBvgOrderDetails,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region AddConcessionsInBooking
// export const addConcessionsInBooking = async (req, res) => {
//   try {
//     let { cinemaId, strTransId, orderXml } = req.body;
//     let config = {
//       method: "get",
//       maxBodyLength: Infinity,
//       url: `${process.env.VISTA_URL}/api.asmx/AddMultiConcessions?strCinemaId=${cinemaId}&strTransId=${strTransId}&strCstrOrderXmlardNumber=${orderXml}`,
//       headers: {},
//     };
//     axios
//       .request(config)
//       .then(async (response) => {
//         if (response.data.Status == 1) {
//           return res.status(200).json({
//             status: StatusCodes.OK,
//             message: ResponseMessage.CONSSESION,
//             data: response.data,
//           });
//         } else {
//           return res.status(400).json({
//             status: StatusCodes.BAD_REQUEST,
//             message: ResponseMessage.BAD_REQUEST,
//             data: response.data,
//           });
//         }
//       })
//       .catch((error) => {
//         return res.status(400).json({
//           status: StatusCodes.BAD_REQUEST,
//           message: ResponseMessage.BAD_REQUEST,
//           data: error.message,
//         });
//       });
//   } catch (error) {
//     return handleErrorResponse(res, error);
//   }
// };
//#endregion

//#region tempCancell
export const tempCancel = async (req, res) => {
  try {
    let { CinemaId, strTransId } = req.params;

    const bookingData = await Transaction.findOne({
      initTransId: strTransId,
    });
    if (bookingData && bookingData?.coupan?.lngSessionId) {
      const rollbackResponse = await rollbackCoupanService({
        lngSessionId: bookingData.coupan.lngSessionId,
        coupanCode: bookingData.coupan.coupanCode,
        cinemaId: CinemaId,
      });
      //  if (!rollbackResponse?.blnSuccess.includes("true")) {
      //       return res.status(400).json({
      //         status: StatusCodes.BAD_REQUEST,
      //         message: ResponseMessage.COUPON_ROLLBACK_FAILED,
      //         data: [],
      //       });
      //     }
      await Transaction.findOneAndUpdate(
        { initTransId: strTransId },
        {
          $unset: {
            "coupan.coupanCode": "",
            "coupan.lngSessionId": "",
            "coupan.discountOn": "",
            "coupan.discountValue": "",
          },
        }
      );
    }
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/CancelTrans?strCinemaId=${CinemaId}&strTransId=${strTransId}`,
      headers: {},
    };

    const vistaLogRequest = {
      ...config,
      queryParameters: {
        strCinemaId: CinemaId,
        strTransId: strTransId,
      },
    };

    let vistaLogData = {
      initTransId: strTransId,
      userId: null,
      moduleName: "Ticket",
      type: "CancelTrans",
      vistaRequest: vistaLogRequest,
    };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "CancelTrans",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.TRANS_CANCELL,
            data: response.data,
          });
        } else {
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "CancelTrans",
          //   vistaLogRequest,
          //   response.data,
          //   "Failed"
          // );
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   strTransId,
        //   null,
        //   "Ticket",
        //   "CancelTrans",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Transaction report
// export const transactionReport = async (req, res) => {
//   try {
//     let {
//       fromDate,
//       toDate,
//       cinemaIds,
//       movieIds,
//       paymentStatus,
//       refundStatus,
//       currentPageNumber = 0,
//       foodIds,
//       bookingStatus,
//     } = req.body;

//     let query = {
//       paymentResponse: { $ne: null },
//     };

//     fromDate =
//       fromDate &&
//       fromDate !== "null" &&
//       fromDate !== "undefined" &&
//       fromDate.trim() !== ""
//         ? fromDate
//         : null;
//     toDate =
//       toDate &&
//       toDate !== "null" &&
//       toDate !== "undefined" &&
//       toDate.trim() !== ""
//         ? toDate
//         : null;

//     if (fromDate || toDate) {
//       query.createdAt = {};
//       if (fromDate) {
//         const start = moment(fromDate).startOf("day").toDate();
//         query.createdAt.$gte = start;
//       }

//       if (toDate) {
//         const end = moment(toDate).endOf("day").toDate();
//         query.createdAt.$lte = end;
//       }
//     } else {
//       const startOfToday = moment().startOf("day").toDate();
//       const endOfToday = moment().endOf("day").toDate();

//       query.createdAt = {
//         $gte: startOfToday,
//         $lte: endOfToday,
//       };
//     }

//     const bookingDetails = await Transaction.find(query)
//       .populate("cinemaId")
//       .populate("movieId")
//       .populate("showId")
//       .populate("userId");

//     if (bookingDetails.length) {
//       return res.status(StatusCodes.OK).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.REPORT_DETAILS,
//         data: bookingDetails.reverse(),
//       });
//     } else {
//       return res.status(StatusCodes.OK).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.FAIL_TO_FETCH,
//         data: [],
//       });
//     }
//   } catch (error) {
//     return handleErrorResponse(res, error);
//   }
// };
//#endregion

export const transactionReport = async (req, res) => {
  try {
    let {
      fromDate,
      toDate,
      cinema,
      movie,
      search,
      page = 1,
      limit = 10,
      showAbortedTransaction,
    } = req.body;

    const exportSheet = req.body.exportSheet === "true";

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Base filter
    const matchStage = {
      paymentResponse: { $ne: null },
    };

    if (showAbortedTransaction === "No") {
      matchStage.status = { $ne: 0 }; // Exclude aborted transactions
    }

    if (fromDate) {
      matchStage.createdAt = matchStage.createdAt || {};
      matchStage.createdAt.$gte = new Date(
        moment(fromDate).startOf("day").toISOString()
      );
    }

    if (toDate) {
      matchStage.createdAt = matchStage.createdAt || {};
      matchStage.createdAt.$lte = new Date(
        moment(toDate).endOf("day").toISOString()
      );
    }

    if (cinema) {
      matchStage.cinemaId = new mongoose.Types.ObjectId(cinema);
    }

    const pipeline = [
      { $match: matchStage },

      // Join user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },

      // Join movie
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movieId",
        },
      },
      { $unwind: "$movieId" },

      // Join cinema
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaId",
          foreignField: "_id",
          as: "cinemaId",
        },
      },
      { $unwind: "$cinemaId" },

      // Join show
      {
        $lookup: {
          from: "shows",
          localField: "showId",
          foreignField: "_id",
          as: "showId",
        },
      },
      {
        $unwind: {
          path: "$showId",
          preserveNullAndEmptyArrays: true,
        },
      },

       {
  $lookup: {
    from: "rewards",
    let: { transactionId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$transactionId", "$$transactionId"] },
              { $eq: ["$type", "earned"] }
            ]
          }
        }
      },
      {
        $project: {
          type: 1,
          coins: 1,
          lastName: 1,
          isExpired: 1,
          expiryDate: 1
        }
      }
    ],
    as: "rewardData"
  }
      },
     { $unwind: { path: "$rewardData", preserveNullAndEmptyArrays: true } },
    ];

    // Filter by movie uniqueFilmCode
    if (movie) {
      pipeline.push({
        $match: {
          "movieId.uniqueFilmCode": movie,
        },
      });
    }

    // Add search filter
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      const isBooleanSearch =
        search.toLowerCase() === "success"
          ? true
          : search.toLowerCase() === "fail"
          ? false
          : null;

      pipeline.push({
        $match: {
          $or: [
            // { "userId.firstName": { $regex: searchRegex } },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: [
                      { $toLower: "$userId.firstName" },
                      " ",
                      { $toLower: "$userId.lastName" },
                    ],
                  },
                  regex: searchRegex,
                },
              },
            },
            { "userId.email": { $regex: searchRegex } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$userId.mobileNumber" },
                  regex: search, // pass plain string (not /regex/i)
                  options: "i",
                },
              },
            },
            // { "userId.mobileNumber": { $regex: searchRegex } },
            { "movieId.signText": { $regex: searchRegex } },
            { "movieId.shortName": { $regex: searchRegex } },
            { "cinemaId.displayName": { $regex: searchRegex } },
            { "paymentResponse.amount": { $regex: searchRegex } },
            ...(isBooleanSearch !== null
              ? [
                  { paymentsStatus: isBooleanSearch },
                  { commitStatus: isBooleanSearch },
                  { refundStatus: isBooleanSearch },
                ]
              : []),
          ],
        },
      });
    }

    // Clone pipeline to count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Transaction.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add sort, skip, limit
    pipeline.push({ $sort: { createdAt: -1 } });
    // console.log({exportSheet});
    if (!exportSheet) {
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
    }

    // Run main aggregation
    const result = await Transaction.aggregate(pipeline);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message:
        result.length > 0
          ? ResponseMessage.REPORT_DETAILS
          : ResponseMessage.FAIL_TO_FETCH,
      data: result,
      total,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

// Get booking session by session ID
export const getBookingSessionById = async (req, res) => {
  try {
    let { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message:
          "Invalid booking session ID. Please provide a valid booking session ID.",
        data: [],
      });
    }

    const now = momentTimezone.tz("Asia/Kolkata");
    const findSession = await BookingSession.findOne({
      _id: id,
    });

    if (!findSession) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Booking session not found",
        data: [],
      });
    }

    if (findSession && findSession.sessionEndTime < now.toDate()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Booking session expire",
        data: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Booking session fetched",
      data: findSession,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const transactionDateWiseReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate)
      return res.status(400).json({ message: "From & To date required" });

    const timezone = "Asia/Kolkata";
    const start = momentTimezone
      .tz(fromDate, "YYYY-MM-DD", timezone)
      .startOf("day")
      .toISOString();
    const end = momentTimezone
      .tz(toDate, "YYYY-MM-DD", timezone)
      .endOf("day")
      .toISOString();

    // 💰 Total Tickets Revenue
    const ticketRevenueResult = await Transaction.aggregate([
      {
        $match: {
          deletedStatus: 0,
          paymentsStatus: true,
          commitStatus: true,
          "commitBookingData.strBookId": { $exists: true, $ne: "" },
          createdAt: { $gte: new Date(start), $lte: new Date(end) },
        },
      },
      {
        $group: {
          _id: null,
          totalTicketsRevenue: {
            // $sum: { $toDouble: "$paymentResponse.amount" },
            $sum: { $toDouble: "$finalBookingCalculation.finalAmount" },
          },
        },
      },
    ]);
    const totalTicketsRevenue =
      ticketRevenueResult[0]?.totalTicketsRevenue || 0;

    // ✅ Shipped & Payment Success but Booking Failed
    const [shippedCount, paymentSuccessBookingFailed] = await Promise.all([
      Transaction.countDocuments({
        deletedStatus: 0,
        paymentsStatus: true,
        commitStatus: true,
        "commitBookingData.strBookId": { $exists: true, $ne: "" },
        createdAt: { $gte: new Date(start), $lte: new Date(end) },
      }),
      Transaction.countDocuments({
        deletedStatus: 0,
        paymentsStatus: true,
        $or: [
          { commitStatus: false },
          { commitStatus: { $exists: false } },
          { "commitBookingData.strBookId": "" },
        ],
        createdAt: { $gte: new Date(start), $lte: new Date(end) },
      }),
    ]);

    // 🔴 Payment failed
    const failedCount = await Transaction.countDocuments({
      deletedStatus: 0,
      paymentsStatus: false,
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    });

    // 🔵 Discounts & Convenience Fees (successful payments)
    const discountAndFeesResult = await Transaction.aggregate([
      {
        $match: {
          deletedStatus: 0,
          paymentsStatus: true,
          createdAt: { $gte: new Date(start), $lte: new Date(end) },
        },
      },
      {
        $group: {
          _id: null,
          totalDiscount: {
            $sum: { $toDouble: "$finalBookingCalculation.totalDiscount" },
          },
          convenienceFees: {
            $sum: {
              $toDouble:
                "$finalBookingCalculation.convenienceFeesObject.convenienceFees",
            },
          },
        },
      },
    ]);
    const discountData = discountAndFeesResult[0] || {};

    // 🔴 Total transactions (all with payment response)
    const totalTransactions = await Transaction.countDocuments({
      deletedStatus: 0,
      paymentResponse: { $ne: null },
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    });

    return res.status(200).json({
      fromDate,
      toDate,
      report: {
        salesTotal: Number(totalTicketsRevenue).toFixed(2),
        discountTotal: Number(discountData.totalDiscount || 0).toFixed(2),
        convenienceFees: Number(discountData.convenienceFees || 0).toFixed(2),
        shipped: shippedCount,
        failed: failedCount,
        paymentSuccessBookingFailed,
        totalTransactions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTransactionPaymentResponse = async(req, res) => {
  try {
    const { transId } = req.params;
    const transaction = await Transaction.findOne({ initTransId: transId, }).sort({ createdAt: -1 });

    if(!transaction) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Transaction not found",
        data: []
      })
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message:"Transaction payment response fetched successfully",
      data: transaction
    })

  } catch (error) {
     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message:"Error fetching transaction payment response",
      data: []
    })
  }
}

// Booking Details by Transaction ID
export const getBookingDetailsByTransId = async (initTransId) => {
  try {
    const projection = {
      "addSeatData.strBookId": 1,
      "setSeatData.strSeatInfo": 1,
      "addSeatData.curTicketsTotal": 1,
      "addSeatData.curTicketsTax1": 1,
      "addSeatData.curTicketsTax2": 1,
      cancellationStatus: 1,
      initTransId: 1,
      cinemaId: 1,
      movieId: 1,
      showId: 1,
      paymentsStatus: 1,
      userId: 1,
      commitStatus: 1,
      refundStatus: 1,
      paymentsBreakup: 1,
      "paymentResponse.id": 1,
      "paymentResponse.amount": 1,
      "paymentResponse.status": 1,
      "paymentResponse.method": 1,
      "foodAndBvgResponse.curTotal": 1,
      "foodAndBvgResponse.curTicketsTotal": 1,
      "foodAndBvgResponse.curFoodTotal": 1,
      "foodAndBvgResponse.curTicketsTax": 1,
      "foodAndBvgResponse.curFoodTax": 1,
      "foodAndBvgResponse.curTicketsTax1": 1,
      "foodAndBvgResponse.curTicketsTax2": 1,
      "foodAndBvgResponse.curFoodTax1": 1,
      "foodAndBvgResponse.curFoodTax2": 1,
      "commitBookingData.curTicketsTotal": 1,
      "commitBookingData.curTicketsTax1": 1,
      "commitBookingData.curTicketsTax2": 1,
      fAndBDetails: 1,
      finalBookingCalculation: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const bookingDetails = await Transaction.findOne(
      { initTransId },
      projection
    )
      .populate({
        path: "cinemaId",
        select: "cinemaName convenienceFees address displayName googleUrl GSTNumber",
      })
      .populate({
        path: "movieId",
        select: "name poster languages censorRating category",
      })
      .populate({
        path: "showId",
        select: "sessionRealShow screenName",
      })
      .populate({
        path: "userId",
        select: "firstName lastName",
      })
      .populate({
        path: "couponId",
        select:
          "_id couponId couponTitle discountType couponCategory discount couponUpTo couponType",
      })
      .sort({ createdAt: -1 })
      .lean(); // optional but recommended for performance

    return bookingDetails;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
}