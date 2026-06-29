import Cinema from "../../models/Cinema.js";
import axios from "axios";
import {
  movieData,
  cinema,
  priceDataSync,
  showDataSync,
  pricePackageDataSync,
  itemDataSync,
  seatFilter,
} from "../../services/VistaService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import Movie from "../../models/Movies.js";
import Price from "../../models/Price.js";
import TodayShow from "../../models/TodayShow.js";
import { dataSyncMail } from "../../utils/Mailers.js";
import Logs from "../../models/Logs.js";
import { itemDataSyncCinemaWise, movieSync, priceDataSyncCinemaWise, pricePackageDataSyncCinemaWise, showSync, todayShowSync } from "./CinemaWiseDataSync.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";
import { createVistaLog } from "../../services/CommanService.js";
import SyncHistory from "../../models/SyncHistory.js";

const sendMail = async (syncResults = []) => {
  let mailData = {
    email: ["nikita.vhits@gmail.com"],
    status: "Auto cinema sync processed",
    syncResults,
  };
  return await dataSyncMail(mailData);
};

export const syncAll = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      message: ResponseMessage.DATA_SYNCED_EMAIL,
      data: [],
    });
    let mailData = {
      email: ["nikita.vhits@gmail.com"],
      status: "",
    };
    Promise.all([
      Promise.resolve(cinema()),
      Promise.resolve(movieData()),
      Promise.resolve(priceDataSync()),
      Promise.resolve(pricePackageDataSync()),
      Promise.resolve(showDataSync()),
      Promise.resolve(itemDataSync()),
      Promise.resolve(todayShowSync()),
    ])
      .then(async (response) => {
        await dataSyncMail(mailData);
      })
      .catch((err) => {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.ERROR_IN_RETRIEVING_DATA_FROM_API,
          data: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.OK,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const itemSync = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      message: ResponseMessage.DATA_SYNCED_EMAIL,
      data: [],
    });
    Promise.all([Promise.resolve(itemDataSync())])
      .then(async () => { })
      .catch((err) => {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.ERROR_IN_RETRIEVING_DATA_FROM_API,
          data: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.OK,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const filterSeat = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      message: ResponseMessage.DATA_SYNCED_EMAIL,
      data: [],
    });
    Promise.all([Promise.resolve(seatFilter())])
      .then(async () => { })
      .catch((err) => {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.ERROR_IN_RETRIEVING_DATA_FROM_API,
          data: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.OK,
      message: HTTPResponsMessages.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

/**
 * HIGH-SPEED PARALLEL SYNC
 * Orchestrates global data fetching and parallelized cinema processing.
 */
export const cinemaSyncBatch = async (req, res) => {
  let findCinema = await Cinema.find(
    {
      cinemaId: { $ne: null },
      deletedStatus: 0,
      isActive: true
    },
    {
      cinemaName: 1,
      cinemaId: 1,
      cinemaWebServiceUrl: 1,
      cinemaWebServiceUrl2: 1,
    }
  );
  const length = findCinema.length;
  let batchSize = 5;
  let skip = 0;
  let hasMore = true;

  // while (skip<length) {
  //   console.log(findCinema); // process your 5 cinema records here
  //   cinemaSync(skip,batchSize);
  //   skip += batchSize;
      
  // }
  for (let i = 0; i < findCinema.length; i += batchSize) {

   cinemaSync(i,batchSize);
}

  

}
export const cinemaSync = async (skip, batchSize, triggerSource = "auto") => {
  try {
    cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData])
    cacheHelper.deleteKeysByPrefix("region_movies_data_");
    cacheHelper.deleteKeysByPrefix("recent_release_region_movie_data_");
    console.log("cache data", cacheHelper.getKeysByPrefix("SYNCE_STARED"));
    if ( cacheHelper.getKeysByPrefix("SYNCE_STARED"+skip).length > 0) {
      console.log("Syncing is already in progress it will restart once it done.")
    } else {
      cacheHelper.setCache("SYNCE_STARED"+skip, true, 1800);
      let findCinema = await Cinema.find(
        {
          cinemaId: { $ne: null },
          deletedStatus: 0,
          isActive: true
        },
        {
          cinemaName: 1,
          cinemaId: 1,
          cinemaWebServiceUrl: 1,
          cinemaWebServiceUrl2: 1,
        }
      ) .skip(skip)
  .limit(batchSize);;

      const syncResults = [];

      console.log("*********** Sync Stareted *********",skip,batchSize, new Date().toLocaleString(), findCinema.length)

      if (findCinema.length > 0) {
        for (const cinema of findCinema) {
          let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${process.env.VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${cinema.cinemaId}`,
            headers: {},
          };
          let syncError = null;
          try {
            let response = await axios.request(config);
            if (response.data.Status == "0" || !response.data.Status) {
              // Determine whether a real URL swap is possible
              const hasUrl2 = !!(cinema.cinemaWebServiceUrl && cinema.cinemaWebServiceUrl2);
              const newActiveUrl = hasUrl2
                ? cinema.cinemaWebServiceUrl2
                : cinema.cinemaWebServiceUrl;

              // Log DatabaseSync failure
              createVistaLog(
                null, null, "Cinema", "DatabaseSync",
                config.url, response.data, "Failed",
                cinema.cinemaId,
                {
                  cinemaName: cinema.cinemaName,
                  triggerSource,
                  failedUrl: cinema.cinemaWebServiceUrl,
                  switchingToUrl: newActiveUrl,
                  urlSwitchAttempted: hasUrl2,
                }
              );

              // Swap URLs in DB only when both exist
              if (hasUrl2) {
                await Cinema.findOneAndUpdate(
                  { cinemaId: cinema.cinemaId, deletedStatus: 0 },
                  [
                    {
                      $set: {
                        cinemaWebServiceUrl: cinema.cinemaWebServiceUrl2,
                        cinemaWebServiceUrl2: cinema.cinemaWebServiceUrl,
                      },
                    },
                  ]
                );
                console.log(
                  `Synchronization Failed for cinema ${cinema.cinemaName} ${cinema.cinemaId} so changed the URL`,
                  new Date().toLocaleString()
                );
              }

              // ALWAYS call UpdateCinemawebservicesURL when DatabaseSync fails (status 0)
              try {
                const updateUrlConfig = {
                  method: "get",
                  maxBodyLength: Infinity,
                  url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${cinema.cinemaId}&strWebServiceURL=${newActiveUrl}`,
                  headers: {},
                };

                const updateResponse = await axios.request(updateUrlConfig);
                const vistaLogStatus = updateResponse.data.Status == 1 ? "Success" : "Failed";

                createVistaLog(
                  null, null, "Cinema", "UpdateCinemawebservicesURL",
                  updateUrlConfig.url, updateResponse.data, vistaLogStatus,
                  cinema.cinemaId,
                  {
                    cinemaName: cinema.cinemaName,
                    triggerSource,
                    previousUrl: cinema.cinemaWebServiceUrl,
                    updatedToUrl: newActiveUrl,
                    urlSwitched: hasUrl2,
                    switchedAt: new Date().toISOString(),
                  }
                );

                console.log(
                  `Vista web service url updated for cinema ${cinema.cinemaName} ${cinema.cinemaId} on ${new Date().toLocaleString()}`
                );
              } catch (updateErr) {
                createVistaLog(
                  null, null, "Cinema", "UpdateCinemawebservicesURL",
                  `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${cinema.cinemaId}&strWebServiceURL=${newActiveUrl}`,
                  updateErr.response?.data, "Failed",
                  cinema.cinemaId,
                  {
                    cinemaName: cinema.cinemaName,
                    triggerSource,
                    previousUrl: cinema.cinemaWebServiceUrl,
                    attemptedUrl: newActiveUrl,
                    urlSwitched: hasUrl2,
                    errorMessage: updateErr.message,
                  }
                );
                console.log(
                  `Failed to update vista web service url for cinema ${cinema.cinemaName} ${cinema.cinemaId} on ${new Date().toLocaleString()}:`,
                  updateErr
                );
              }
            } else {
              createVistaLog(
                null, null, "Cinema", "DatabaseSync",
                config.url, response.data, "Success",
                cinema.cinemaId,
                {
                  cinemaName: cinema.cinemaName,
                  triggerSource,
                  activeUrl: cinema.cinemaWebServiceUrl,
                }
              );
            }


            await Cinema.findOneAndUpdate(
              { cinemaId: cinema.cinemaId, deletedStatus: 0 },
              {
                lastSync: Date.now(),
                lastSyncStatus: true,
              }
            );

            console.log(
              `Synchronization successful for cinema ${cinema.cinemaName} ${cinema.cinemaId}`, new Date().toLocaleString()
            );
            syncResults.push({
              cinemaName: cinema.cinemaName,
              cinemaId: cinema.cinemaId,
              syncStatus: true,
            });
          } catch (error) {
            createVistaLog(
              null,
              null,
              "Cinema",
              "DatabaseSync",
              {
                ...config,
                queryParameters: {
                  strCinemaId: cinema.cinemaId,
                },
              },
              error.response?.data,
              "Failed",
              cinema.cinemaId,
              {
                cinemaName: cinema.cinemaName,
                triggerSource,
                failedUrl: cinema.cinemaWebServiceUrl,
                errorMessage: error.message,
              }
            );
            syncError = error;
            console.error(
              `Synchronization failed for cinema ${cinema.cinemaName}:`,
              error
            );
          }
          
        }

        await seatFilter();

        console.log(ResponseMessage.DATA_SYNCED);
        //await sendMail(syncResults);
        //console.log(syncResults);
        // syncAllCron();
        await syncAllCinema(skip, batchSize, triggerSource)

           await Cinema.findOneAndUpdate(
                { cinemaId: cinema.cinemaId, deletedStatus: 0 },
                {
                  lastSync: Date.now(),
                  lastSyncStatus: true,
                }
              );
        console.log("**********SYNC ENDED****************",skip,batchSize);
        cacheHelper.deleteCache("SYNCE_STARED"+skip);
        return syncResults;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

//#endregion


export const syncAllCinema = async (skip, batchSize, triggerSource = "auto") => {



  let findCinema = await Cinema.find(
    {
      cinemaId: { $ne: null },
      deletedStatus: 0,
      isActive: true
    },
    {
      cinemaName: 1,
      cinemaId: 1,
      cinemaWebServiceUrl: 1,
      cinemaWebServiceUrl2: 1,
    }
  ) .skip(skip)
  .limit(batchSize);;


  for (const cinema of findCinema) {
    var strCinemaId = cinema.cinemaId;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${strCinemaId}`,
      headers: {},
    };
    if (strCinemaId) {
      console.log("Cinema sync with vista service2", strCinemaId)

      try {
        const d = await axios.request(config);

        // console.log(d)

        if (d.data.Status == "0" || !d.data.Status) {
          const cinemaDoc = await Cinema.findOne({ cinemaId: strCinemaId, deletedStatus: 0 });
          const hasUrl2 = !!(cinemaDoc?.cinemaWebServiceUrl && cinemaDoc?.cinemaWebServiceUrl2);
          const newActiveUrl = hasUrl2
            ? cinemaDoc.cinemaWebServiceUrl2
            : cinemaDoc?.cinemaWebServiceUrl;

          // Log DatabaseSync failure
          createVistaLog(
            null, null, "Cinema", "DatabaseSync",
            { ...config, queryParameters: { strCinemaId } },
            d.data, "Failed",
            strCinemaId,
            {
              cinemaName: cinemaDoc?.cinemaName,
              triggerSource,
              failedUrl: cinemaDoc?.cinemaWebServiceUrl,
              switchingToUrl: newActiveUrl,
              urlSwitchAttempted: hasUrl2,
            }
          );

          // Swap URLs in DB only when both exist
          if (hasUrl2) {
            await Cinema.findOneAndUpdate(
              { cinemaId: strCinemaId, deletedStatus: 0 },
              [
                {
                  $set: {
                    cinemaWebServiceUrl: cinemaDoc.cinemaWebServiceUrl2,
                    cinemaWebServiceUrl2: cinemaDoc.cinemaWebServiceUrl,
                  },
                },
              ]
            );
            console.log("Movie Sync Failed for cinema", strCinemaId, "so changed the URL", new Date().toLocaleString());
          }

          // ALWAYS call UpdateCinemawebservicesURL when DatabaseSync fails (status 0)
          try {
            const updateUrlConfig = {
              method: "get",
              maxBodyLength: Infinity,
              url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${newActiveUrl}`,
              headers: {},
            };
            const updateResponse = await axios.request(updateUrlConfig);
            const vistaLogStatus = updateResponse.data.Status == 1 ? "Success" : "Failed";
            createVistaLog(
              null, null, "Cinema", "UpdateCinemawebservicesURL",
              updateUrlConfig.url, updateResponse.data, vistaLogStatus,
              strCinemaId,
              {
                cinemaName: cinemaDoc?.cinemaName,
                triggerSource,
                previousUrl: cinemaDoc?.cinemaWebServiceUrl,
                updatedToUrl: newActiveUrl,
                urlSwitched: hasUrl2,
                switchedAt: new Date().toISOString(),
              }
            );
          } catch (updateErr) {
            createVistaLog(
              null, null, "Cinema", "UpdateCinemawebservicesURL",
              `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${newActiveUrl}`,
              updateErr.response?.data, "Failed",
              strCinemaId,
              {
                cinemaName: cinemaDoc?.cinemaName,
                triggerSource,
                previousUrl: cinemaDoc?.cinemaWebServiceUrl,
                attemptedUrl: newActiveUrl,
                urlSwitched: hasUrl2,
                errorMessage: updateErr.message,
              }
            );
          }
        }
       
        // console.log(d.data);
        //  if (strCinemaId == "CN01") {
        console.log("Movie sync started", strCinemaId)
        await movieSync(strCinemaId);
        console.log("Movie sync ender", strCinemaId)
        await priceDataSyncCinemaWise(strCinemaId);
        // console.log("priceDataSyncCinemaWise","done");
        await pricePackageDataSyncCinemaWise(strCinemaId);
        // console.log("pricePackageDataSyncCinemaWise","done");
        await showSync(strCinemaId);
        console.log("showSync", "done");

        // await todayShowSync(strCinemaId);
        // console.log("todayShowSync", "done");
        await itemDataSyncCinemaWise(strCinemaId);
        // console.log("itemDataSync","done");
        console.log("Sync all done for selected cinema", strCinemaId, new Date().toLocaleString());

         await Cinema.findOneAndUpdate(
            { cinemaId: strCinemaId },
            { lastSync: Date.now(), lastSyncStatus: true },
            { new: true }
          );


        cacheHelper.deleteManyCache([cacheKeys.upcomingMovieData])
        cacheHelper.deleteKeysByPrefix("region_movies_data_");
        cacheHelper.deleteKeysByPrefix("recent_release_region_movie_data_");
        console.log("cleard cached")



        

      } catch (error) {
        console.log(error)
        console.log("Error wilse syncing ", strCinemaId)
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
          error.response?.data,
          "Failed",
          strCinemaId,
          {
            cinemaName: cinema.cinemaName,
            triggerSource,
            failedUrl: cinema.cinemaWebServiceUrl,
            errorMessage: error.message,
          }
        );

         await Cinema.findOneAndUpdate(
            { cinemaId: strCinemaId },
            { lastSync: Date.now(), lastSyncStatus: false },
            { new: true }
          );
      }



    }
  }
  console.log("*********** Sync Ended *********", new Date().toLocaleString())
}

//#region syncAllCron
export const syncAllCron = async (req, res) => {
  try {
    console.log("startSync", new Date().toLocaleString());
    let mailData = {
      email: ["nikita.vhits@gmail.com"],
      status: "",
    };

    movieData()
      .then(() => {
        console.log("Moviedata", new Date().toLocaleString());
        showDataSync()
          .then(() => {
            console.log("showDataSync", new Date().toLocaleString());

            priceDataSync()
              .then(() => {
                console.log("priceDataSync", new Date().toLocaleString());

                pricePackageDataSync()
                  .then(() => {
                    console.log(
                      "pricePackageDataSync",
                      new Date().toLocaleString()
                    );

                    itemDataSync()
                      .then(() => {
                        console.log(
                          "itemDataSync",
                          new Date().toLocaleString()
                        );

                        todayShowSync()
                          .then(async () => {
                            console.log("itemDataSync done", new Date().toLocaleString());
                            Logs.create({
                              title: "Cinema wise auto sync process has been started",
                              lastSync: Date.now(),
                            });
                            mailData.status = "Auto cinema sync process is successfully done";

                            await Cinema.updateMany(
                              { deletedStatus: 0 },
                              {
                                lastSync: new Date().toISOString(),
                                lastSyncStatus: true,
                              },
                              { upsert: true }
                            );

                            console.log("Auto Datasync proccess is successfully done", new Date().toISOString());
                          })
                          .catch((err) => { console.log("err itemDataSync:", err); });
                      })
                      .catch((err) => { console.log("err todayShowSync:", err); });
                  })
                  .catch((err) => { console.log("err showDataSync:", err); });
              })
              .catch((err) => { console.log("err pricePackageDataSync:", err); });
          })
          .catch((err) => {
            console.log("err:::300", err);
          });
      })
      .catch((err) => {
        console.log("err:::304", err);
      });
    
  } catch (error) {
    console.log(error, "Something went wrong");
  }
};
//#endregion

//#region Sync Vista Cinemas
export const syncVistaCinemas = async (req, res) => {
  try {
    let { strCinemaId } = req.params;
    if (strCinemaId) {
      axios
        .request(config)
        .then(async (response) => {


          if (response.data.Status == "0" || !response.data.Status) {
            const cinema = await Cinema.findOne({ cinemaId: strCinemaId, deletedStatus: 0 });
            const hasUrl2 = !!(cinema?.cinemaWebServiceUrl && cinema?.cinemaWebServiceUrl2);
            const newActiveUrl = hasUrl2
              ? cinema.cinemaWebServiceUrl2
              : cinema?.cinemaWebServiceUrl;

            // Log DatabaseSync failure
            createVistaLog(
              null, null, "Cinema", "DatabaseSync",
              { ...config, queryParameters: { strCinemaId } },
              response.data, "Failed",
              strCinemaId,
              {
                cinemaName: cinema?.cinemaName,
                triggerSource: "manual",
                failedUrl: cinema?.cinemaWebServiceUrl,
                switchingToUrl: newActiveUrl,
                urlSwitchAttempted: hasUrl2,
              }
            );

            // Swap URLs in DB only when both exist
            if (hasUrl2) {
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
            }

            // ALWAYS call UpdateCinemawebservicesURL when DatabaseSync fails (status 0)
            try {
              const updateUrlConfig = {
                method: "get",
                maxBodyLength: Infinity,
                url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${newActiveUrl}`,
                headers: {},
              };
              const updateResponse = await axios.request(updateUrlConfig);
              const vistaLogStatus = updateResponse.data.Status == 1 ? "Success" : "Failed";
              createVistaLog(
                null, null, "Cinema", "UpdateCinemawebservicesURL",
                updateUrlConfig.url, updateResponse.data, vistaLogStatus,
                strCinemaId,
                {
                  cinemaName: cinema?.cinemaName,
                  triggerSource: "manual",
                  previousUrl: cinema?.cinemaWebServiceUrl,
                  updatedToUrl: newActiveUrl,
                  urlSwitched: hasUrl2,
                  switchedAt: new Date().toISOString(),
                }
              );
            } catch (updateErr) {
              createVistaLog(
                null, null, "Cinema", "UpdateCinemawebservicesURL",
                `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${newActiveUrl}`,
                updateErr.response?.data, "Failed",
                strCinemaId,
                {
                  cinemaName: cinema?.cinemaName,
                  triggerSource: "manual",
                  previousUrl: cinema?.cinemaWebServiceUrl,
                  attemptedUrl: newActiveUrl,
                  urlSwitched: hasUrl2,
                  errorMessage: updateErr.message,
                }
              );
            }

            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: response.data.data,
              data: [],
            });
          } else {
            createVistaLog(
              null, null, "Cinema", "DatabaseSync",
              { ...config, queryParameters: { strCinemaId } },
              response.data, "Success",
              strCinemaId,
              {
                triggerSource: "manual",
              }
            );
          }

          await Cinema.findOneAndUpdate(
            { cinemaId: strCinemaId },
            {
              lastSync: Date.now(),
              lastSyncStatus: true,
            }
          );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CINEMA_DATA_SYNCED,
            data: [],
          });
        })
        .catch(async (error) => {
          // Fetch cinema BEFORE updating lastSync so we have the original URLs
          const cinemaDoc = await Cinema.findOne({ cinemaId: strCinemaId, deletedStatus: 0 });
          const hasUrl2 = !!(cinemaDoc?.cinemaWebServiceUrl && cinemaDoc?.cinemaWebServiceUrl2);
          const newActiveUrl = hasUrl2
            ? cinemaDoc.cinemaWebServiceUrl2
            : cinemaDoc?.cinemaWebServiceUrl;

          await Cinema.findOneAndUpdate(
            { cinemaId: strCinemaId },
            { lastSync: Date.now(), lastSyncStatus: false },
            { new: true }
          );

          // Log DatabaseSync exception failure
          createVistaLog(
            null, null, "Cinema", "DatabaseSync",
            { ...config, queryParameters: { strCinemaId } },
            error.response?.data, "Failed",
            strCinemaId,
            {
              cinemaName: cinemaDoc?.cinemaName,
              triggerSource: "manual",
              failedUrl: cinemaDoc?.cinemaWebServiceUrl,
              switchingToUrl: newActiveUrl,
              urlSwitchAttempted: hasUrl2,
              errorMessage: error.message,
            }
          );

          // Swap URLs in DB only when both exist
          if (hasUrl2) {
            await Cinema.findOneAndUpdate(
              { cinemaId: strCinemaId, deletedStatus: 0 },
              [
                {
                  $set: {
                    cinemaWebServiceUrl: cinemaDoc.cinemaWebServiceUrl2,
                    cinemaWebServiceUrl2: cinemaDoc.cinemaWebServiceUrl,
                  },
                },
              ]
            );
          }

          // ALWAYS call UpdateCinemawebservicesURL when DatabaseSync fails
          try {
            const updateUrlConfig = {
              method: "get",
              maxBodyLength: Infinity,
              url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${newActiveUrl}`,
              headers: {},
            };
            const updateUrlResponse = await axios.request(updateUrlConfig);
            const vistaLogStatus = updateUrlResponse.data.Status == 1 ? "Success" : "Failed";
            createVistaLog(
              null, null, "Cinema", "UpdateCinemawebservicesURL",
              updateUrlConfig.url, updateUrlResponse.data, vistaLogStatus,
              strCinemaId,
              {
                cinemaName: cinemaDoc?.cinemaName,
                triggerSource: "manual",
                previousUrl: cinemaDoc?.cinemaWebServiceUrl,
                updatedToUrl: newActiveUrl,
                urlSwitched: hasUrl2,
                switchedAt: new Date().toISOString(),
              }
            );
          } catch (updateErr) {
            createVistaLog(
              null, null, "Cinema", "UpdateCinemawebservicesURL",
              `${process.env.VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${strCinemaId}&strWebServiceURL=${newActiveUrl}`,
              updateErr.response?.data, "Failed",
              strCinemaId,
              {
                cinemaName: cinemaDoc?.cinemaName,
                triggerSource: "manual",
                previousUrl: cinemaDoc?.cinemaWebServiceUrl,
                attemptedUrl: newActiveUrl,
                urlSwitched: hasUrl2,
                errorMessage: updateErr.message,
              }
            );
          }

          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: error.message,
          });
        });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.OK,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
//#endregion

//#region Sync Status and History APIs
export const getSyncStatus = async (req, res) => {
  try {
    const currentSync = await SyncHistory.findOne({ status: "running" }).sort({ startTime: -1 });
    const lastSync = await SyncHistory.findOne({ status: "completed" }).sort({ endTime: -1 });

    let status = "idle";
    let currentProgress = null;

    if (currentSync) {
      status = "running";
      currentProgress = {
        startTime: currentSync.startTime,
        cinemasSynced: currentSync.cinemasSynced,
        totalCinemas: currentSync.totalCinemas,
        moviesAdded: currentSync.moviesAdded,
        showsAdded: currentSync.showsAdded,
      };
    }

    let nextSyncTime = null;
    if (lastSync) {
      // Assuming 15 minute cron
      nextSyncTime = new Date(lastSync.startTime.getTime() + 15 * 60 * 1000);
    } else if (currentSync) {
        nextSyncTime = new Date(currentSync.startTime.getTime() + 15 * 60 * 1000);
    }

    return res.status(200).json({
      status: 200,
      message: "Sync status retrieved successfully",
      data: {
        currentSyncStatus: status,
        lastSyncTime: lastSync ? lastSync.endTime : null,
        nextSyncTime: nextSyncTime,
        currentProgress: currentProgress,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const getSyncHistory = async (req, res) => {
  try {
    const history = await SyncHistory.find().sort({ startTime: -1 }).limit(50);
    return res.status(200).json({
      status: 200,
      message: "Sync history retrieved successfully",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
//#endregion
