import Cinema from "../../models/Cinema.js";
import Price from "../../models/Price.js";
import PricePackage from "../../models/PricePackage.js";
import dotenv from "dotenv";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import Shows from "../../models/Shows.js";
import Movies from "../../models/Movies.js";
import Items from "../../models/Items.js";
import TodayShow from "../../models/TodayShow.js";
import Logs from "../../models/Logs.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";
import { createVistaLog } from "../../services/CommanService.js";

dotenv.config();
const config = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.VISTA_URL}/api.asmx/GetAllDetails?test=string`,
  headers: {},
};
const itemConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.VISTA_URL}/api.asmx/GetAllItems?test=string`,
  headers: {},
};

//#region movie sync cinema wise
export const movieSync = async (strCinemaId, preFetchedData = null, cinemaMap = null) => {
  try {
    let resArray;
    if (preFetchedData) {
      resArray = preFetchedData.data.data.Fillmlist;
    } else {
      const response = await axios.request(config);
      resArray = response.data.data.Fillmlist;
    }

    if (resArray && resArray.length) {
      const selectedMovie = resArray.filter((movie) => {
        let cinemaId = movie.Film_strCode.slice(0, 4);
        return cinemaId == strCinemaId;
      });

      // Fetch existing movies for this cinema to avoid individual lookups
      const existingMovies = await Movies.find({ cinemaId: strCinemaId });
      const existingMovieMap = new Map(existingMovies.map(m => [m.filmCode, m]));

      const bulkOps = [];
      const movieResultMap = new Map();

      for (let i = 0; i < selectedMovie.length; i++) {
        const ele = selectedMovie[i];
        const filmCode = ele.Film_strCode;
        const cinemaId = filmCode.slice(0, 4);
        
        let cinema = null;
        if (cinemaMap) {
          cinema = cinemaMap.get(cinemaId);
        } else {
          cinema = await Cinema.findOne({ cinemaId });
        }

        const exist = existingMovieMap.get(filmCode);
        
        // Parsing logic
        const regex = /\(([^)]+)\)/;
        const regexForCast = /^CAST\s*:\s*(.*?)(?:,\s*$|$)/i;
        const castMatch = ele.Film_strDescription.match(regexForCast);
        let castMembersString = (castMatch && castMatch.length >= 2) ? castMatch[1].trim() : "";
        
        const match = regex.exec(ele.Film_strTitle);
        let languages = (match && match.length >= 2) ? match[1] : null;
        
        const openingDateMatch = ele.Film_dtmOpeningDate.match(/\d+/);
        const openingDate = openingDateMatch ? new Date(parseInt(openingDateMatch[0], 10)) : new Date();

        if (exist) {
          //  console.log("Existing movie", ele.Film_strCode, ele.Film_strTitle);
          // await Movies.findByIdAndUpdate(
          //   { _id: exist._id },
          //   {
          //     $set: {
          //       name: ele.Film_strTitle,
          //       cinemaId,
          //       cinemaObjectId: cinema ? cinema._id : null,
          //       // category: ele.Film_strContent,
          //       [!exist.isDurationEdit
          //         ? "category"
          //         : ""]: ele.Film_strContent,
          //       filmCode: ele.Film_strCode,
          //       censorRating: ele.Film_strCensor,
          //       filmContent: ele.Film_strContent,
          //       description: ele.Film_strDescription,
          //       shortName: ele.Film_strShortName,
          //       signText: ele.Film_strSignText,
          //       filmSignSequence: ele.Film_bytSignSequence,
          //       filmCategoryCode: ele.FilmCat_strCode,
          //       filmCategoryShortName: ele.FilmCat_strShortName,
          //       children: ele.Film_strChildren,
          //       // duration: ele.Film_intDuration,
          //       [!exist.isDurationEdit
          //         ? "duration"
          //         : ""]: ele.Film_intDuration,
          //       filmStatus: ele.Film_strStatus,
          //       filmUpcomingFlag: ele.Film_strUpcomingFlag,
          //       filmFeatureFlag: ele.Film_strFeatureFlag,
          //       filmNowShowingFlag: ele.Film_strNowShowingFlag,
          //       filmOpeningDate: new Date(
          //         parseInt(openingDate.match(/\d+/)[0], 10)
          //       ),
          //       filmDescriptionLong: ele.Film_strDescriptionLong,
          //       status: 1,
          //       cast: castMembersString,
          //       isActive:true,
          //       deletedStatus:0
          //       // languages,
          //     },
          //   }
          // );
        } else {
          const newMovieData = {
            cinemaId,
            cinemaObjectId: cinema ? cinema._id : null,
            category: ele.Film_strContent,
            name: ele.Film_strTitle,
            filmCode: ele.Film_strCode,
            censorRating: ele.Film_strCensor,
            filmContent: ele.Film_strContent,
            description: ele.Film_strDescription,
            shortName: ele.Film_strShortName,
            signText: ele.Film_strSignText,
            filmSignSequence: ele.Film_bytSignSequence,
            filmCategoryCode: ele.FilmCat_strCode,
            filmCategoryShortName: ele.FilmCat_strShortName,
            children: ele.Film_strChildren,
            duration: ele.Film_intDuration,
            filmStatus: ele.Film_strStatus,
            filmUpcomingFlag: ele.Film_strUpcomingFlag,
            filmFeatureFlag: ele.Film_strFeatureFlag,
            filmNowShowingFlag: ele.Film_strNowShowingFlag,
            filmOpeningDate: openingDate,
            filmDescriptionLong: ele.Film_strDescriptionLong,
            status: 1,
            languages,
            cast: castMembersString,
            isActive: true,
          };

          bulkOps.push({
            insertOne: { document: newMovieData }
          });
        }
      }

      if (bulkOps.length > 0) {
        const result = await Movies.bulkWrite(bulkOps);
        // After bulk insert, we need the new IDs. 
        // For simplicity in this step-by-step refactor, we fetch again or map manually.
        // Fetching again is still faster than individual saves.
        const updatedMovies = await Movies.find({ cinemaId: strCinemaId }, { filmCode: 1, _id: 1 });
        updatedMovies.forEach(m => movieResultMap.set(m.filmCode, m._id));
      }

      console.log("movie sync done", strCinemaId, "New added:", bulkOps.length);
      return { movieResultMap, count: bulkOps.length };
    }
    return { movieResultMap: new Map(), count: 0 };
  } catch (error) {
    console.log(error, "cinema wise movie sync error");
    throw error;
  }
};
//#endregion
//#endregion

//#region Shows sync cinema wise
export const showSync = async (Cinema_strID, globalSessions = null, cinemaMap = null, movieMap = null, priceMap = null) => {
  try {
    let resArray;
    if (globalSessions) {
      resArray = globalSessions.data.data.SessionList;
    } else {
      const showConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.VISTA_URL}/api.asmx/GetAllSession?test=string`,
        headers: {},
      };
      const response = await axios.request(showConfig);
      resArray = response.data.data.SessionList;
    }

    if (resArray && resArray.length) {
      const cinemaIdUpper = Cinema_strID.trim().toUpperCase();
      const selectedMovieShows = resArray.filter((show) => {
        return show.Cinema_strID.trim().toUpperCase() == cinemaIdUpper;
      });

      // De-duplicate API response
      const uniqueSelectedShows = Array.from(
        new Map(selectedMovieShows.map((s) => [s.Session_lngSessionId, s])).values()
      );

      // Deactivate shows not in the current Vista list for this cinema
      const sessionIds = uniqueSelectedShows.map(s => parseInt(s.Session_lngSessionId));
      await Shows.updateMany(
        { cinemaId: cinemaIdUpper, sessionId: { $nin: sessionIds }, isActive: true },
        { $set: { isActive: false } }
      );

      const bulkOps = [];
      for (const ele of uniqueSelectedShows) {
        const filmCode = ele.Film_strCode.trim().toUpperCase();
        const pGroupCode = ele.PGroup_strCode.trim().toUpperCase();

        // High-speed Map Lookups
        const cinema = cinemaMap ? cinemaMap.get(cinemaIdUpper) : await Cinema.findOne({ cinemaId: cinemaIdUpper });
        const movieObjectId = movieMap ? movieMap.get(filmCode) : (await Movies.findOne({ filmCode, cinemaId: cinemaIdUpper }))?._id;
        const priceObjectId = priceMap ? priceMap.get(pGroupCode) : (await Price.findOne({ pGroupCode, cinemaId: cinemaIdUpper }))?._id;

        const sessionRealShowMatch = ele.Session_dtmRealShow.match(/\d+/);
        const sessionFinishShowMatch = ele.Session_dtmFinishShow.match(/\d+/);
        const filmFirstShowMatch = ele.Session_dtmFilmFirstShow.match(/\d+/);

        const showData = {
          cinemaId: cinemaIdUpper,
          filmCode: filmCode,
          screenNumber: ele.Screen_bytNum,
          layoutId: ele.Layout_intId,
          screenName: ele.Screen_strName,
          screenStatus: ele.Session_strStatus,
          screenType: ele.Session_strType,
          sessionRealShow: sessionRealShowMatch ? new Date(parseInt(sessionRealShowMatch[0], 10)) : new Date(),
          sessionFinishShow: sessionFinishShowMatch ? new Date(parseInt(sessionFinishShowMatch[0], 10)) : new Date(),
          pGroupCode: ele.PGroup_strCode,
          sessionSeatsAvail: ele.Session_intSeatsAvail,
          sessionSeatsTotal: ele.Session_intSeatsTotal,
          sessionSeatAllocation: ele.Session_strSeatAllocation,
          sessionComments: ele.Session_strComments,
          sessionFilmFirstShow: filmFirstShowMatch ? new Date(parseInt(filmFirstShowMatch[0], 10)) : new Date(),
          sessionHOSessionId: ele.Session_strHOSessionID,
          sessionAdditionalData: ele.Session_strAdditionalData,
          cinOperatorCode: ele.CinOperator_strCode,
          cinemaObjectId: cinema ? cinema._id : null,
          filmObjectId: movieObjectId || null,
          pGroupObjectId: priceObjectId || null,
          isActive: true,
        };

        bulkOps.push({
          updateOne: {
            filter: { sessionId: ele.Session_lngSessionId, cinemaId: cinemaIdUpper },
            update: { $set: showData },
            upsert: true
          }
        });
      }

      if (bulkOps.length > 0) {
        const result = await Shows.bulkWrite(bulkOps);
        const newlyAddedCount = result.upsertedCount || 0;
        console.log("showSync done", cinemaIdUpper, "Shows newly added:", newlyAddedCount);
        return newlyAddedCount;
      }
      return 0;
    }
  } catch (error) {
    console.error("showSync error:", error);
    throw error;
  }
};
//#endregion
//#endregion


export const syncVistaCinemas = async (req, res) => {
  console.log("In sync cinema");

  try {
    cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData]);
    cacheHelper.deleteKeysByPrefix("region_movies_data_");
    cacheHelper.deleteKeysByPrefix("recent_release_region_movie_data_");

    let { strCinemaId } = req.params;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${strCinemaId}`,
      headers: {},
    };
    if (strCinemaId) {
      console.log("Cinema sync with vista service");

      axios
        .request(config)
        .then(async (response) => {

          if (response.data.Status == "0" || !response.data.Status) {
            const cinema = await Cinema.findOne({
              cinemaId: strCinemaId,
              deletedStatus: 0,
            });

            if (
              cinema &&
              cinema.cinemaWebServiceUrl &&
              cinema.cinemaWebServiceUrl2
            ) {
              await Cinema.findOneAndUpdate(
                { cinemaId: strCinemaId, deletedStatus: 0 },
                [
                  {
                    $set: {
                      cinemaWebServiceUrl: cinema.cinemaWebServiceUrl2,
                      cinemaWebServiceUrl2: cinema.cinemaWebServiceUrl,
                    },
                  },
                ]
              );

              let updateUrlConfig = {
                method: "get",
                maxBodyLength: Infinity,
                url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${cinema.cinemaId}&strWebServiceURL=${cinema.cinemaWebServiceUrl2}`,
                headers: {},
              };

              const vistaLogRequest = {
                ...updateUrlConfig,
                queryParameters: {
                  strCinemaId: cinema.cinemaId,
                  strWebServiceURL: cinema.cinemaWebServiceUrl2,
                },
              }; 

              axios.request(updateUrlConfig).then((response)=>{
                 let vistaLogStatus = response.data.Status == 1 ? "Success" : "Failed";

                 createVistaLog(
                   null,
                   null,
                   "Cinema",
                   "UpdateCinemawebservicesURL",
                   vistaLogRequest,
                   response.data,
                   vistaLogStatus
                 );

              }).catch((error)=>{
                createVistaLog(
                  null,
                  null,
                  "Cinema",
                  "UpdateCinemawebservicesURL",
                  vistaLogRequest,
                  error.response.data,
                  "Failed"
                );
              })
            }

            createVistaLog(
              null,
              null,
              "Cinema",
              "DatabaseSync",
              {
                ...config,
                queryParameters: {
                  strCinemaId: strCinemaId,
                },
              },
              response.data,
              "Failed"
            );

            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: response.data.data,
              data: [],
            });
          } else {

            createVistaLog(
              null,
              null,
              "Cinema",
              "DatabaseSync",
              {
                ...config,
                queryParameters: {
                  strCinemaId: strCinemaId,
                },
              },
              response.data,
              "Success"
            );
            await Logs.create({
              title: "Cinema wise sync process has been started",
              lastSync: Date.now(),
            });

            movieSync(strCinemaId).then(() => {
              console.log(390, "priceDataSyncCinemaWise");
              priceDataSyncCinemaWise(strCinemaId).then(() => {
                console.log(390, "priceDataSyncCinemaWise");
                pricePackageDataSyncCinemaWise(strCinemaId).then(() => {
                  console.log(391, "pricePackageDataSyncCinemaWise");
                  showSync(strCinemaId).then(() => {
                    console.log(392, "showSync");
                    todayShowSync(strCinemaId).then(() => {
                      console.log(393, "todayShowSync");
                      itemDataSyncCinemaWise(strCinemaId).then(() => {
                        console.log(394, "item");
                        Logs.create({
                          title: "Cinema wise sync process has been started",
                          lastSync: Date.now(),
                        });
                        console.log("Sync all done for selected cinema");
                      });
                    });
                  });
                });
              });
            });

            let cinemaTemp = await Cinema.findOneAndUpdate(
              { cinemaId: strCinemaId, deletedStatus: 0 },
              {
                lastSync: Date.now(),
                lastSyncStatus: true,
              },
              { new: true }
            );

            return res.status(200).json({
              status: StatusCodes.OK,
              message: ResponseMessage.DATA_SYNCED,
              data: [],
            });
          }
        })
        .catch(async (error) => {
          createVistaLog(
              null,
              null,
              "Cinema",
              "DatabaseSync",
              {
                ...config,
                queryParameters: {
                  strCinemaId: strCinemaId,
                },
              },
              error.response.data,
              "Failed"
            );
          let update = await Cinema.findOneAndUpdate(
            { cinemaId: strCinemaId },
            {
              lastSync: Date.now(),
              lastSyncStatus: false,
            },
            { new: true }
          );
          let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${
              process.env.VISTA_URL
            }/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${
              update.cinemaWebServiceUrl2
                ? update.cinemaWebServiceUrl2
                : update.cinemaWebServiceUrl
            }`,
          };
          const response = await axios.request(config);

          const vistaLogRequest = {
            ...config,
            queryParameters: {
              strCinemaId: strCinemaId,
              strWebServiceURL:
                update.cinemaWebServiceUrl2 || update.cinemaWebServiceUrl,
            },
          };
          let vistaLogStatus = response.data.Status == 1 ? "Success" : "Failed";
          createVistaLog(
            null,
            null,
            "Cinema",
            "UpdateCinemawebservicesURL",
            vistaLogRequest,
            response.data,
            vistaLogStatus
          );
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: "BAD REQUEST",
            data: error.message,
          });
        });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.OK,
      message: "INTERNAL_SERVER_ERROR",
      data: error.message,
    });
  }
};
//#endregion

//#region Cinema wise price sync
export const priceDataSyncCinemaWise = async (strCinemaId, preFetchedData = null, cinemaMap = null) => {
  try {
    let resArray;
    if (preFetchedData) {
      resArray = preFetchedData.data.data.Price;
    } else {
      const response = await axios.request(config);
      resArray = response.data.data.Price;
    }

    if (resArray && resArray.length) {
      const selectedPrice = resArray.filter((price) => {
        return price.Cinema_strID == strCinemaId;
      });

      // De-duplicate API response to prevent multiple ops for same key
      const uniqueSelectedPrice = Array.from(
        new Map(
          selectedPrice.map((p) => [
            `${p.Cinema_strID || ""}-${p.PGroup_strCode || ""}-${p.TType_strCode || ""}-${p.AreaCat_strCode || ""}-${p.BFee_strCode || ""}`.toUpperCase(),
            p,
          ])
        ).values()
      );

      const bulkOps = [];
      const incomingKeys = [];

      for (let i = 0; i < uniqueSelectedPrice.length; i++) {
        const ele = uniqueSelectedPrice[i];
        const cinemaId = (ele.Cinema_strID || "").toUpperCase();

        let cinema = null;
        if (cinemaMap) {
          cinema = cinemaMap.get(cinemaId);
        } else {
          cinema = await Cinema.findOne({ cinemaId });
        }

        const priceEffectFromMatch = ele.Price_dtmEffectFrom ? ele.Price_dtmEffectFrom.match(/\d+/) : null;
        const priceEffectTillMatch = ele.Price_dtmEffectTill ? ele.Price_dtmEffectTill.match(/\d+/) : null;

        const priceData = {
          cinemaId: cinemaId,
          pGroupCode: (ele.PGroup_strCode || "").toUpperCase(),
          tTypeCode: (ele.TType_strCode || "").toUpperCase(),
          areaCatCode: (ele.AreaCat_strCode || "").toUpperCase(),
          bFeeCode: (ele.BFee_strCode || "").toUpperCase(),
          tTypeDescription: ele.TType_strDescription,
          tTypeDescriptionAlt: ele.TType_strDescriptionAlt,
          priceSequence: ele.Price_intSequence,
          currentPrice: ele.Price_curPrice,
          priceChildTicket: ele.Price_strChildTicket,
          pricePackage: ele.Price_strPackage,
          priceComp: ele.Price_strComp,
          priceEffectFrom: priceEffectFromMatch
            ? new Date(parseInt(priceEffectFromMatch[0], 10))
            : new Date(),
          priceEffectTill: priceEffectTillMatch
            ? new Date(parseInt(priceEffectTillMatch[0], 10))
            : new Date(),
          priceTax1: ele.Price_curTax1,
          priceTax2: ele.Price_curTax2,
          priceTax3: ele.Price_curTax3,
          priceTax4: ele.Price_curTax4,
          priceAdditionalData: ele.Price_strAdditionalData,
          tTypeHOCode: ele.TType_strHOCode,
          cinemaObjectId: cinema ? cinema._id : null,
          deletedStatus: 0,
        };

        incomingKeys.push({
          pGroupCode: priceData.pGroupCode,
          tTypeCode: priceData.tTypeCode,
          areaCatCode: priceData.areaCatCode,
          bFeeCode: priceData.bFeeCode,
        });

        bulkOps.push({
          updateOne: {
            filter: {
              cinemaId: priceData.cinemaId,
              pGroupCode: priceData.pGroupCode,
              tTypeCode: priceData.tTypeCode,
              areaCatCode: priceData.areaCatCode,
              bFeeCode: priceData.bFeeCode,
            },
            update: { $set: priceData },
            upsert: true,
          },
        });
      }

      const priceResultMap = new Map();
      if (bulkOps.length > 0) {
        const result = await Price.bulkWrite(bulkOps);
        const newlyAddedCount = result.upsertedCount || 0;

        // Deferred Deletion: Remove prices no longer in Vista
        // We use $or to match the specific combinations for this cinema
        const allCurrentPrices = await Price.find(
          { cinemaId: strCinemaId.toUpperCase() },
          { pGroupCode: 1, tTypeCode: 1, areaCatCode: 1, bFeeCode: 1, _id: 1 }
        );

        const toDelete = allCurrentPrices.filter((existing) => {
          return !incomingKeys.some(
            (inc) =>
              inc.pGroupCode === existing.pGroupCode &&
              inc.tTypeCode === existing.tTypeCode &&
              inc.areaCatCode === existing.areaCatCode &&
              inc.bFeeCode === existing.bFeeCode
          );
        });

        if (toDelete.length > 0) {
          await Price.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
        }

        // Re-map for showSync dependency
        const updatedPrices = await Price.find(
          { cinemaId: strCinemaId.toUpperCase() },
          { pGroupCode: 1, _id: 1 }
        );
        updatedPrices.forEach((p) => priceResultMap.set(p.pGroupCode, p._id));

        console.log("Pricing sync done", strCinemaId, "Newly added:", newlyAddedCount);
        return { priceResultMap, count: newlyAddedCount };
      }
      return { priceResultMap: new Map(), count: 0 };
    }
  } catch (error) {
    console.error("Price sync error:", error);
    throw error;
  }
};
//#endregion

//#region Cinema wise price package sync
export const pricePackageDataSyncCinemaWise = async (strCinemaId, preFetchedData = null, cinemaMap = null) => {
  try {
    let resArray;
    if (preFetchedData) {
      resArray = preFetchedData.data.data.Prices_Packages;
    } else {
      const response = await axios.request(config);
      resArray = response.data.data.Prices_Packages;
    }

    if (resArray && resArray.length) {
      const cinemaIdUpper = strCinemaId.trim().toUpperCase();
      const selectedPricePackage = resArray.filter((pricePackage) => {
        return pricePackage.Cinema_strID.trim().toUpperCase() == cinemaIdUpper;
      });

      // De-duplicate API response
      const uniqueSelectedPkgs = Array.from(
        new Map(
          selectedPricePackage.map((p) => [
            `${p.Cinema_strID}-${p.PPack_strCode}-${p.PGroup_strCode}-${p.TType_strCode}`.toUpperCase(),
            p,
          ])
        ).values()
      );

      const bulkOps = [];
      const incomingKeys = [];

      for (let i = 0; i < uniqueSelectedPkgs.length; i++) {
        const ele = uniqueSelectedPkgs[i];

        const cinema = cinemaMap
          ? cinemaMap.get(cinemaIdUpper)
          : await Cinema.findOne({ cinemaId: cinemaIdUpper });
        const pPackStampMatch = ele.PPack_dtmStamp.match(/\d+/);

        const pricePkgData = {
          cinemaId: cinemaIdUpper,
          pPackCode: ele.PPack_strCode.trim().toUpperCase(),
          pGroupCode: ele.PGroup_strCode.trim().toUpperCase(),
          tTypeCode: ele.TType_strCode.trim().toUpperCase(),
          tTypeChildCode: ele.TType_strChildCode,
          itemStrItemId: ele.Item_strItemId,
          pPackQuantity: ele.PPack_curQuantity,
          pPackPriceEach: ele.PPack_curPriceEach,
          pPackStamp: pPackStampMatch
            ? new Date(parseInt(pPackStampMatch[0], 10))
            : new Date(),
          priceTax1: ele.Price_curTax1,
          priceTax2: ele.Price_curTax2,
          priceTax3: ele.Price_curTax3,
          priceTax4: ele.Price_curTax4,
          cinemaObjectId: cinema ? cinema._id : null,
          deletedStatus: 0,
        };

        incomingKeys.push({
          pPackCode: pricePkgData.pPackCode,
          pGroupCode: pricePkgData.pGroupCode,
          tTypeCode: pricePkgData.tTypeCode,
        });

        bulkOps.push({
          updateOne: {
            filter: {
              cinemaId: cinemaIdUpper,
              pPackCode: pricePkgData.pPackCode,
              pGroupCode: pricePkgData.pGroupCode,
              tTypeCode: pricePkgData.tTypeCode,
            },
            update: { $set: pricePkgData },
            upsert: true,
          },
        });
      }

      if (bulkOps.length > 0) {
        const result = await PricePackage.bulkWrite(bulkOps);
        const newlyAddedCount = result.upsertedCount || 0;

        // Deferred Deletion
        const allCurrentPkgs = await PricePackage.find(
          { cinemaId: cinemaIdUpper },
          { pPackCode: 1, pGroupCode: 1, tTypeCode: 1, _id: 1 }
        );

        const toDelete = allCurrentPkgs.filter((existing) => {
          return !incomingKeys.some(
            (inc) =>
              inc.pPackCode === existing.pPackCode &&
              inc.pGroupCode === existing.pGroupCode &&
              inc.tTypeCode === existing.tTypeCode
          );
        });

        if (toDelete.length > 0) {
          await PricePackage.deleteMany({
            _id: { $in: toDelete.map((d) => d._id) },
          });
        }
        console.log(
          "PricePackage sync done",
          cinemaIdUpper,
          "Newly added:",
          newlyAddedCount
        );
        return newlyAddedCount;
      }
      return 0;
    }
  } catch (error) {
    console.error("PricePackage sync error:", error);
    throw error;
  }
};
//#endregion

//#region Cinema wise item sync
export const itemDataSyncCinemaWise = async (strCinemaId, preFetchedData = null, cinemaMap = null) => {
  try {
    let resArray;
    if (preFetchedData) {
      resArray = preFetchedData.data.data.Itemlist;
    } else {
      const response = await axios.request(itemConfig);
      resArray = response.data.data.Itemlist;
    }

    if (resArray && resArray.length) {
      const selectedItems = resArray.filter((item) => {
        return item.Cinema_strID == strCinemaId;
      });

      const cinemaIdUpper = strCinemaId.toUpperCase();
      const existingItems = await Items.find({ cinemaId: cinemaIdUpper });
      const existingItemMap = new Map(existingItems.map(i => [i.itemId, i]));

      const bulkOps = [];
      const insertedItemIds = [];

      for (let i = 0; i < selectedItems.length; i++) {
        const ele = selectedItems[i];
        insertedItemIds.push(ele.Item_strID);
        
        const cinema = cinemaMap ? cinemaMap.get(cinemaIdUpper) : await Cinema.findOne({ cinemaId: cinemaIdUpper });
        const exist = existingItemMap.get(ele.Item_strID);

        const itemDateStampMatch = ele.Item_dtmStamp.match(/\d+/);
        const itemDateStamp = itemDateStampMatch ? new Date(parseInt(itemDateStampMatch[0], 10)) : new Date();

        const itemData = {
          cinemaId: cinemaIdUpper,
          itemId: ele.Item_strID,
          itemDescription: ele.Item_strDescription,
          layoutId: ele.Layout_intId,
          itemPrice: ele.Item_intPrice,
          itemMasterItemCode: ele.Item_strMasterItemCode,
          itemAdditionalData: ele.Item_strAdditionalData,
          itemDateStamp: itemDateStamp,
          itemTax1: ele.Item_intTax1,
          itemTax2: ele.Item_intTax2,
          itemTax3: ele.Item_intTax3,
          itemTax4: ele.Item_intTax4,
          itemPackage: ele.Item_strPackage,
          cinemaOprCode: ele.CinOperator_strCode,
          cinemaObjectId: cinema ? cinema._id : null,
          oldItemDescription: ele.Item_strDescription,
          isActive: true,
        };

        // If exists and has manual edits, preserve description (maintaining existing logic)
        if (exist && exist.isEdit) {
          delete itemData.itemDescription;
        }

        bulkOps.push({
          updateOne: {
            filter: { itemId: ele.Item_strID, cinemaId: cinemaIdUpper },
            update: { $set: itemData },
            upsert: true
          }
        });
      }

      if (bulkOps.length > 0) {
        const result = await Items.bulkWrite(bulkOps);
        const newlyAddedCount = result.upsertedCount || 0;
        console.log("Item sync done", cinemaIdUpper, "Newly added:", newlyAddedCount);
        
        // Deactivate items not in the current list
        await Items.updateMany(
          { cinemaId: cinemaIdUpper, itemId: { $nin: insertedItemIds }, isActive: true },
          { $set: { isActive: false, type: "Other" } }
        );

        return newlyAddedCount;
      }
      return 0;
    }
  } catch (error) {
    console.error("itemDataSyncCinemaWise error:", error);
    throw error;
  }
};
//#endregion

//#region Today's Shows sync cinema wise
export const todayShowSync = async (strCinemaId, preFetchedData = null, cinemaMap = null, movieMap = null, priceMap = null) => {
  try {
    let resArray;
    if (preFetchedData) {
      resArray = preFetchedData.data.data.SessionList;
    } else {
      const showConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.VISTA_URL}/api.asmx/GetAllSession?test=string`,
        headers: {},
      };
      const response = await axios.request(showConfig);
      resArray = response.data.data.SessionList;
    }

    if (resArray && resArray.length) {
      const selectedShows = resArray.filter((item) => {
        return item.Cinema_strID == strCinemaId;
      });

      // De-duplicate API response by sessionId
      const uniqueSelectedShows = Array.from(
        new Map(selectedShows.map((s) => [s.Session_lngSessionId, s])).values()
      );

      const bulkOps = [];
      const cinemaIdUpper = strCinemaId.toUpperCase();
      const incomingSessionIds = [];

      for (let i = 0; i < uniqueSelectedShows.length; i++) {
        const ele = uniqueSelectedShows[i];
        incomingSessionIds.push(ele.Session_lngSessionId);

        // High speed Map lookups
        const cinema = cinemaMap
          ? cinemaMap.get(cinemaIdUpper)
          : await Cinema.findOne({ cinemaId: cinemaIdUpper });
        const filmObjectId = movieMap
          ? movieMap.get(ele.Film_strCode.toUpperCase())
          : (
              await Movies.findOne({
                filmCode: ele.Film_strCode.toUpperCase(),
                cinemaId: cinemaIdUpper,
              })
            )?._id;
        const pGroupObjectId = priceMap
          ? priceMap.get(ele.PGroup_strCode.toUpperCase())
          : (
              await Price.findOne({
                pGroupCode: ele.PGroup_strCode.toUpperCase(),
                cinemaId: cinemaIdUpper,
              })
            )?._id;

        const sessionRealshowMatch = ele.Session_dtmRealShow.match(/\d+/);
        const sessionFinishShowMatch = ele.Session_dtmFinishShow.match(/\d+/);
        const filmFirstShowMatch = ele.Session_dtmFilmFirstShow.match(/\d+/);

        const todayShowData = {
          sessionId: ele.Session_lngSessionId,
          cinemaId: ele.Cinema_strID,
          filmCode: ele.Film_strCode,
          screenNumber: ele.Screen_bytNum,
          layoutId: ele.Layout_intId,
          screenName: ele.Screen_strName,
          screenStatus: ele.Session_strStatus,
          screenType: ele.Session_strType,
          sessionRealShow: sessionRealshowMatch
            ? new Date(parseInt(sessionRealshowMatch[0], 10))
            : new Date(),
          sessionFinishShow: sessionFinishShowMatch
            ? new Date(parseInt(sessionFinishShowMatch[0], 10))
            : new Date(),
          pGroupCode: ele.PGroup_strCode,
          sessionSeatsAvail: ele.Session_intSeatsAvail,
          sessionSeatsTotal: ele.Session_intSeatsTotal,
          sessionSeatAllocation: ele.Session_strSeatAllocation,
          sessionComments: ele.Session_strComments,
          sessionFilmFirstShow: filmFirstShowMatch
            ? new Date(parseInt(filmFirstShowMatch[0], 10))
            : new Date(),
          sessionHOSessionId: ele.Session_strHOSessionID,
          sessionAdditionalData: ele.Session_strAdditionalData,
          cinOperatorCode: ele.CinOperator_strCode,
          cinemaObjectId: cinema ? cinema._id : null,
          filmObjectId: filmObjectId || null,
          pGroupObjectId: pGroupObjectId || null,
          isActive: true,
          deletedStatus: 0,
        };

        bulkOps.push({
          updateOne: {
            filter: {
              sessionId: ele.Session_lngSessionId,
              cinemaId: cinemaIdUpper,
            },
            update: { $set: todayShowData },
            upsert: true,
          },
        });
      }
if (bulkOps.length > 0) {
  const result = await TodayShow.bulkWrite(bulkOps);
  const newlyAddedCount = result.upsertedCount || 0;

  // Deferred Deletion: Remove today's shows no longer in Vista for this cinema
  await TodayShow.deleteMany({
    cinemaId: cinemaIdUpper,
    sessionId: { $nin: incomingSessionIds },
  });
  console.log(
    "todayShowSync done",
    strCinemaId,
    "Newly added:",
    newlyAddedCount
  );
  return newlyAddedCount;
}
return 0;
}
} catch (error) {
console.error("todayShowSync error:", error);
throw error;
}
};//#endregion
