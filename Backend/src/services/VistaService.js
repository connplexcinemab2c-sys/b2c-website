import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import Movie from "../models/Movies.js";
import Cinema from "../models/Cinema.js";
import Show from "../models/Shows.js";
import Price from "../models/Price.js";
import PricePackage from "../models/PricePackage.js";
import Item from "../models/Items.js";
import SeatFilter from "../models/SessionAreaCount.js";
import moment from "moment-timezone";
import http from "http";
import { createVistaLog } from "./CommanService.js";

const config = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.VISTA_URL}/api.asmx/GetAllDetails?test=string`,
  headers: {},
};

const showConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.VISTA_URL}/api.asmx/GetAllSession?test=string`,
  headers: {},
};

const itemConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.VISTA_URL}/api.asmx/GetAllItems?test=string`,
  timeout: 30000,
  httpsAgent: new http.Agent({ keepAlive: true }),
  headers: {},
};

export const movieData = async () => {
  try {
    const response = await axios.request(config);
    if (response.data.data.Fillmlist.length) {
      const resArray = response.data.data.Fillmlist;
      const demoResult = [];
      let newlyAddedCount = 0;
      
      const existingMovies = await Movie.find({ status: 1 });
      for (let i = 0; i < existingMovies.length; i++) {
        const existingMovie = existingMovies[i];
        const found = resArray.find(
          (ele) => ele.Film_strCode === existingMovie.filmCode
        );
        if (!found) {
          await Movie.findByIdAndUpdate(
            { _id: existingMovie._id },
            { $set: { status: 3 } }
          );
        }
      }

      for (let i = 0; i < resArray.length; i++) {
        const ele = resArray[i];
        let castMembersString = "";
        let cinema;
        const exist = await Movie.findOne({
          filmCode: ele.Film_strCode,
        });

        let cinemaId = null;
        if (ele.Film_strCode) {
          cinema = await Cinema.findOne({
            cinemaId: {
              $regex: ele.Film_strCode.slice(0, 4),
              $options: "i",
            },
          });
          cinemaId = ele.Film_strCode.slice(0, 4);
        }

        const openingDate = ele.Film_dtmOpeningDate;

        if (exist && exist?.duration !== ele.Film_intDuration) {
          exist.isDurationEdit = true;
        }

        if (exist && exist?.category !== ele.Film_strContent) {
          exist.isCategoryEdit = true;
        }

        if (exist) {
          await Movie.findByIdAndUpdate(
            { _id: exist._id },
            {
              $set: {
                cinemaId: cinemaId,
                cinemaObjectId: cinema ? cinema._id : null,
                [!exist.isDurationEdit ? "category" : ""]: ele.Film_strContent,
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
                [!exist.isDurationEdit ? "duration" : ""]: ele.Film_intDuration,
                filmStatus: ele.Film_strStatus,
                filmUpcomingFlag: ele.Film_strUpcomingFlag,
                filmFeatureFlag: ele.Film_strFeatureFlag,
                filmNowShowingFlag: ele.Film_strNowShowingFlag,
                filmOpeningDate: new Date(
                  parseInt(openingDate.match(/\d+/)[0], 10)
                ),
                filmDescriptionLong: ele.Film_strDescriptionLong,
                status: 1,
                cast: castMembersString,
              },
            }
          );
        } else {
          newlyAddedCount++;
          await new Movie({
            cinemaId: cinemaId,
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
            filmOpeningDate: new Date(
              parseInt(openingDate.match(/\d+/)[0], 10)
            ),
            filmDescriptionLong: ele.Film_strDescriptionLong,
            status: 1,
            cast: castMembersString,
          }).save();
        }
      }
      return newlyAddedCount;
    }
    return 0;
  } catch (error) {
    throw error;
  }
};

export const cinema = async () => {
  try {
    const response = await axios.request(config);
    if (response.data.data.CinemaList.length) {
      const resArray = response.data.data.CinemaList;
      const demoResult = [];
      let number = 0;

      for (let i = 0; i < resArray.length; i++) {
        const ele = resArray[i];
        const exist = await Cinema.findOne({
          cinemaId: ele.Cinema_strID.toUpperCase(),
        });
        const lastDataRefresh =
          ele.Cinema_dtmLastDataRefresh !== null
            ? ele.Cinema_dtmLastDataRefresh
            : moment();
        if (exist) {
          await Cinema.findByIdAndUpdate(
            { _id: exist._id },
            {
              $set: {
                cinemaId: ele.Cinema_strID.toUpperCase(),
                cinemaName: ele.Cinema_strName,
                cinemaWebServiceUrl: ele.Cinema_strWebServiceURL,
                cinemaWebServiceUrl2: ele.Cinema_strWebServiceURL2,
                cinemaWebServiceUrl3: ele.Cinema_strWebServiceURL3,
                cinemaWebServiceLogin: ele.Cinema_strWebServiceLogin,
                cinemaWebServicePWD: ele.Cinema_strWebServicePWD,
                cinemaLicenseName: ele.Cinema_strLicenseName,
                cinemaLicenseNumber: ele.Cinema_strLicenseNo,
                cinemaIsOnline: ele.Cinema_strIsOnline,
                cinemaSyncSequence: ele.Cinema_intSyncSequence,
                cinemaWebServiceVersion: ele.Cinema_strWebServiceVersion,
                cinemaVistaRemoteVersion: ele.Cinema_strVistaRemoteVersion,
                cinemaBranchCode: ele.Cinema_strBranchCode,
                cinemaLastDataRefresh: moment(lastDataRefresh).utcOffset(
                  "+5:30"
                ),
              },
            }
          );
        } else {
          await new Cinema({
            cinemaId: ele.Cinema_strID.toUpperCase(),
            cinemaName: ele.Cinema_strName,
            cinemaWebServiceUrl: ele.Cinema_strWebServiceURL,
            cinemaWebServiceUrl2: ele.Cinema_strWebServiceURL2,
            cinemaWebServiceUrl3: ele.Cinema_strWebServiceURL3,
            cinemaWebServiceLogin: ele.Cinema_strWebServiceLogin,
            cinemaWebServicePWD: ele.Cinema_strWebServicePWD,
            cinemaLicenseName: ele.Cinema_strLicenseName,
            cinemaLicenseNumber: ele.Cinema_strLicenseNo,
            cinemaIsOnline: ele.Cinema_strIsOnline,
            cinemaSyncSequence: ele.Cinema_intSyncSequence,
            cinemaWebServiceVersion: ele.Cinema_strWebServiceVersion,
            cinemaVistaRemoteVersion: ele.Cinema_strVistaRemoteVersion,
            cinemaBranchCode: ele.Cinema_strBranchCode,
            cinemaLastDataRefresh: moment(lastDataRefresh).utcOffset("+5:30"),
          }).save();
        }
        demoResult.push(number++);
      }
      return demoResult;
    }
  } catch (error) {
    throw error;
  }
};

export const priceDataSync = async () => {
  try {
    const response = await axios.request(config);
    if (response.data.data.Price.length) {
      const resArray = response.data.data.Price;

      const uniqueResArray = Array.from(
        new Map(
          resArray.map((p) => [
            `${p.Cinema_strID || ""}-${p.PGroup_strCode || ""}-${p.TType_strCode || ""}-${p.AreaCat_strCode || ""}-${p.BFee_strCode || ""}`.toUpperCase(),
            p,
          ])
        ).values()
      );

      const bulkOps = [];
      const incomingKeys = [];

      for (let i = 0; i < uniqueResArray.length; i++) {
        const ele = uniqueResArray[i];
        const cinemaIdUpper = (ele.Cinema_strID || "").toUpperCase();
        const cinemaObjectId = await Cinema.findOne({
          cinemaId: cinemaIdUpper,
        });

        const priceEffectFromMatch = ele.Price_dtmEffectFrom ? ele.Price_dtmEffectFrom.match(/\d+/) : null;
        const priceEffectTillMatch = ele.Price_dtmEffectTill ? ele.Price_dtmEffectTill.match(/\d+/) : null;

        const priceData = {
          cinemaId: cinemaIdUpper,
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
            ? moment(ele.Price_dtmEffectFrom).utcOffset("+5:30")
            : moment().utcOffset("+5:30"),
          priceEffectTill: priceEffectTillMatch
            ? moment(ele.Price_dtmEffectTill).utcOffset("+5:30")
            : moment().utcOffset("+5:30"),
          priceTax1: ele.Price_curTax1,
          priceTax2: ele.Price_curTax2,
          priceTax3: ele.Price_curTax3,
          priceTax4: ele.Price_curTax4,
          priceAdditionalData: ele.Price_strAdditionalData,
          tTypeHOCode: ele.TType_strHOCode,
          cinemaObjectId: cinemaObjectId ? cinemaObjectId._id : null,
          deletedStatus: 0,
        };

        incomingKeys.push({
          cinemaId: priceData.cinemaId,
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

      if (bulkOps.length > 0) {
        const result = await Price.bulkWrite(bulkOps);
        const newlyAddedCount = result.upsertedCount || 0;

        const allCurrentPrices = await Price.find(
          {},
          { cinemaId: 1, pGroupCode: 1, tTypeCode: 1, areaCatCode: 1, bFeeCode: 1, _id: 1 }
        );

        const toDelete = allCurrentPrices.filter((existing) => {
          return !incomingKeys.some(
            (inc) =>
              inc.cinemaId === existing.cinemaId &&
              inc.pGroupCode === existing.pGroupCode &&
              inc.tTypeCode === existing.tTypeCode &&
              inc.areaCatCode === existing.areaCatCode &&
              inc.bFeeCode === existing.bFeeCode
          );
        });

        if (toDelete.length > 0) {
          await Price.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
        }
        return newlyAddedCount;
      }
    }
    return 0;
  } catch (error) {
    throw error;
  }
};

export const pricePackageDataSync = async () => {
  try {
    const response = await axios.request(config);
    if (response.data.data.Prices_Packages.length) {
      const resArray = response.data.data.Prices_Packages;

      const uniqueResArray = Array.from(
        new Map(
          resArray.map((p) => [
            `${p.Cinema_strID}-${p.PPack_strCode}-${p.PGroup_strCode}-${p.TType_strCode}`.toUpperCase(),
            p,
          ])
        ).values()
      );

      const bulkOps = [];
      const incomingKeys = [];

      for (let i = 0; i < uniqueResArray.length; i++) {
        const ele = uniqueResArray[i];
        const cinemaIdUpper = ele.Cinema_strID.toUpperCase();
        const pPackCodeUpper = ele.PPack_strCode.toUpperCase();
        const pGroupCodeUpper = ele.PGroup_strCode.toUpperCase();
        const tTypeCodeUpper = ele.TType_strCode.toUpperCase();

        const cinemaObjectId = await Cinema.findOne({
          cinemaId: cinemaIdUpper,
        });

        const pPackStamp = ele.PPack_dtmStamp;

        const pkgData = {
          cinemaId: cinemaIdUpper,
          pPackCode: pPackCodeUpper,
          pGroupCode: pGroupCodeUpper,
          tTypeCode: tTypeCodeUpper,
          tTypeChildCode: ele.TType_strChildCode,
          itemStrItemId: ele.Item_strItemId,
          pPackQuantity: ele.PPack_curQuantity,
          pPackPriceEach: ele.PPack_curPriceEach,
          pPackStamp: moment(pPackStamp).utcOffset("+5:30"),
          priceTax1: ele.Price_curTax1,
          priceTax2: ele.Price_curTax2,
          priceTax3: ele.Price_curTax3,
          priceTax4: ele.Price_curTax4,
          cinemaObjectId: cinemaObjectId ? cinemaObjectId._id : null,
          deletedStatus: 0,
        };

        incomingKeys.push({
          cinemaId: cinemaIdUpper,
          pPackCode: pPackCodeUpper,
          pGroupCode: pGroupCodeUpper,
          tTypeCode: tTypeCodeUpper,
        });

        bulkOps.push({
          updateOne: {
            filter: {
              cinemaId: cinemaIdUpper,
              pPackCode: pPackCodeUpper,
              pGroupCode: pGroupCodeUpper,
              tTypeCode: tTypeCodeUpper,
            },
            update: { $set: pkgData },
            upsert: true,
          },
        });
      }

      if (bulkOps.length > 0) {
        const result = await PricePackage.bulkWrite(bulkOps);
        const newlyAddedCount = result.upsertedCount || 0;

        const allCurrentPkgs = await PricePackage.find(
          {},
          { cinemaId: 1, pPackCode: 1, pGroupCode: 1, tTypeCode: 1, _id: 1 }
        );

        const toDelete = allCurrentPkgs.filter((existing) => {
          return !incomingKeys.some(
            (inc) =>
              inc.cinemaId === existing.cinemaId &&
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
        return newlyAddedCount;
      }
    }
    return 0;
  } catch (error) {
    throw error;
  }
};

export const showDataSync = async () => {
  try {
    const response = await axios.request(showConfig);
    if (response.data.data.SessionList.length) {
      const resArray = response.data.data.SessionList;
      let totalUpserted = 0;

      const allCinemas = await Cinema.find();
      for (let j = 0; j < allCinemas.length; j++) {
        const selectedItems = resArray.filter((item) => {
          return item.Cinema_strID == allCinemas[j].cinemaId;
        });

        const sessionIds = selectedItems.map((s) =>
          parseInt(s.Session_lngSessionId)
        );

        const bulkOps = [];
        for (let i = 0; i < selectedItems.length; i++) {
          const ele = selectedItems[i];
          const cinemaIdUpper = ele.Cinema_strID.toUpperCase();
          const cinemaObjectId = await Cinema.findOne({
            cinemaId: cinemaIdUpper,
          });

          const filmObjectId = await Movie.findOne(
            {
              filmCode: ele.Film_strCode.toUpperCase(),
              cinemaId: cinemaIdUpper,
            },
            { filmCode: true }
          );
          const pGroupObjectId = await Price.findOne({
            pGroupCode: ele.PGroup_strCode.toUpperCase(),
            cinemaId: cinemaIdUpper,
          });

          const sessionRealshow = ele.Session_dtmRealShow;
          const sessionFinishShow = ele.Session_dtmFinishShow;
          const filmFirstShow = ele.Session_dtmFilmFirstShow;

          const showData = {
            cinemaId: cinemaIdUpper,
            filmCode: ele.Film_strCode.toUpperCase(),
            screenNumber: ele.Screen_bytNum,
            layoutId: ele.Layout_intId,
            screenName: ele.Screen_strName,
            screenStatus: ele.Session_strStatus,
            screenType: ele.Session_strType,
            sessionRealShow: moment(sessionRealshow).utcOffset("+5:30"),
            sessionFinishShow: moment(sessionFinishShow).utcOffset("+5:30"),
            pGroupCode: ele.PGroup_strCode,
            sessionSeatsAvail: ele.Session_intSeatsAvail,
            sessionSeatsTotal: ele.Session_intSeatsTotal,
            sessionSeatAllocation: ele.Session_strSeatAllocation,
            sessionComments: ele.Session_strComments,
            sessionFilmFirstShow: moment(filmFirstShow).utcOffset("+5:30"),
            sessionHOSessionId: ele.Session_strHOSessionID,
            sessionAdditionalData: ele.Session_strAdditionalData,
            cinOperatorCode: ele.CinOperator_strCode,
            cinemaObjectId: cinemaObjectId ? cinemaObjectId._id : null,
            filmObjectId: filmObjectId ? filmObjectId._id : null,
            pGroupObjectId: pGroupObjectId ? pGroupObjectId._id : null,
            isActive: true,
          };

          bulkOps.push({
            updateOne: {
              filter: {
                sessionId: ele.Session_lngSessionId,
                cinemaId: cinemaIdUpper,
              },
              update: { $set: showData },
              upsert: true,
            },
          });
        }

        if (bulkOps.length > 0) {
          const result = await Show.bulkWrite(bulkOps);
          totalUpserted += result.upsertedCount || 0;

          await Show.updateMany(
            {
              sessionId: { $nin: sessionIds },
              cinemaId: allCinemas[j].cinemaId,
              isActive: true,
            },
            {
              $set: {
                isActive: false,
              },
            }
          );
        }
      }
      return totalUpserted;
    }
    return 0;
  } catch (error) {
    throw error;
  }
};

export const itemDataSync = async () => {
  try {
    const response = await axios.request(itemConfig);
    if (response.data.data.Itemlist.length) {
      const resArray = response.data.data.Itemlist;
      let totalUpserted = 0;

      const allCinemas = await Cinema.find();
      for (let j = 0; j < allCinemas.length; j++) {
        const selectedItems = resArray.filter((item) => {
          return item.Cinema_strID == allCinemas[j].cinemaId;
        });
        let insertedItemIds = [];
        const bulkOps = [];

        for (let i = 0; i < selectedItems.length; i++) {
          const ele = selectedItems[i];
          const cinemaObjectId = allCinemas[j];
          const itemDateStamp = ele.Item_dtmStamp;

          const itemData = {
            cinemaId: ele.Cinema_strID.toUpperCase(),
            itemId: ele.Item_strID,
            itemDescription: ele.Item_strDescription,
            layoutId: ele.Layout_intId,
            itemPrice: ele.Item_intPrice,
            itemMasterItemCode: ele.Item_strMasterItemCode,
            itemAdditionalData: ele.Item_strAdditionalData,
            itemDateStamp: moment(itemDateStamp).utcOffset("+5:30"),
            itemTax1: ele.Item_intTax1,
            itemTax2: ele.Item_intTax2,
            itemTax3: ele.Item_intTax3,
            itemTax4: ele.Item_intTax4,
            itemPackage: ele.Item_strPackage,
            cinemaOprCode: ele.CinOperator_strCode,
            cinemaObjectId: cinemaObjectId ? cinemaObjectId._id : null,
            oldItemDescription: ele.Item_strDescription,
            isActive: true
          };

          bulkOps.push({
            updateOne: {
              filter: {
                itemId: ele.Item_strID,
                cinemaId: ele.Cinema_strID.toUpperCase(),
              },
              update: { $set: itemData },
              upsert: true,
            },
          });
          insertedItemIds.push(ele.Item_strID);
        }

        if (bulkOps.length > 0) {
          const result = await Item.bulkWrite(bulkOps);
          totalUpserted += result.upsertedCount || 0;

          await Item.updateMany(
            {
              itemId: { $nin: insertedItemIds },
              cinemaId: allCinemas[j].cinemaId,
              isActive: true,
            },
            {
              $set: { isActive: false, type: "Other" },
            }
          );
        }
      }
      return totalUpserted;
    }
    return 0;
  } catch (error) {
    throw error;
  }
};

export const seatFilter = async () => {
  try {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/Session_AreaCount`,
      headers: {},
    };
    const response = await axios.request(config);
    await SeatFilter.deleteMany({});
    if (response.data.data.ItemPrice.length) {
      const resArray = response.data.data.ItemPrice;
      for (let i = 0; i < resArray.length; i++) {
        const ele = resArray[i];
        await new SeatFilter({
          cinemaId: ele.Cinema_strID,
          sessionId: ele.Session_lngSessionId,
          seatsAvail: ele.SessAC_intSeatsAvail,
          seatAllocation: ele.SessAC_strSeatAllocation,
          seatsTotal: ele.SessAC_intSeatsTotal,
          area: ele.AreaCat_strCode,
          filmCode: ele.Film_strCode,
        }).save();
      }
    }
  } catch (error) {
    throw error;
  }
};

export const getShowCinemaCount = async () => {
  try {
    const response = await axios.request(showConfig);
    if (response.data.data.SessionList.length) {
      const resArray = response.data.data.SessionList;
      let dataBaseActiveShows = await Show.find(
        { isActive: true },
        { sessionId: true, filmCode: true, cinemaId: true }
      );
      const vistaraCinemaCounts = resArray.reduce((acc, session) => {
        acc[session.Cinema_strID] = (acc[session.Cinema_strID] || 0) + 1;
        return acc;
      }, {});

      const databaseCinemaCounts = dataBaseActiveShows.reduce((acc, session) => {
        acc[session.cinemaId] = (acc[session.cinemaId] || 0) + 1;
        return acc;
      }, {});

      let sortDatabaseCinemaCounts = Object.fromEntries(
        Object.entries(databaseCinemaCounts).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      );

      const unmatched = Object.keys(sortDatabaseCinemaCounts).reduce((acc, cinemaId) => {
        if (sortDatabaseCinemaCounts[cinemaId] !== vistaraCinemaCounts[cinemaId]) {
          acc[cinemaId] = {
            databaseCount: sortDatabaseCinemaCounts[cinemaId],
            vistaraCount: vistaraCinemaCounts[cinemaId] || 0
          };
        }
        return acc;
      }, {});
      
      return { vistaraCinemaCounts, databaseCinemaCounts: sortDatabaseCinemaCounts, unmatched };
    }
  } catch (error) {
    throw error;
  }
};