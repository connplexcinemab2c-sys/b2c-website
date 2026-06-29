import axios from "axios";
import dotenv from "dotenv";
import moment from "moment-timezone";
dotenv.config();

const movieConfig = {
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

/**
 * Get all movies directly from Vista API grouped by cinema
 * No database operations - returns raw Vista response formatted
 */
export const getMoviesByCinema = async () => {
  try {
    const response = await axios.request(movieConfig);

    if (!response.data?.data?.Fillmlist?.length) {
      return {
        success: true,
        message: "No movies found",
        data: {},
        cinemas: [],
      };
    }

    const filmList = response.data.data.Fillmlist;
    const cinemaList = response.data.data.CinemaList || [];

    // Create cinema lookup map with full details
    const cinemaMap = {};
    cinemaList.forEach((cinema) => {
      cinemaMap[cinema.Cinema_strID?.toUpperCase()] = {
        cinemaId: cinema.Cinema_strID,
        cinemaName: cinema.Cinema_strName,
        webServiceUrl: cinema.Cinema_strWebServiceURL,
        webServiceUrl2: cinema.Cinema_strWebServiceURL2,
        licenseName: cinema.Cinema_strLicenseName,
        licenseNumber: cinema.Cinema_strLicenseNo,
        isOnline: cinema.Cinema_strIsOnline,
        branchCode: cinema.Cinema_strBranchCode,
      };
    });

    // Group movies by cinema
    const moviesByCinema = {};

    filmList.forEach((film) => {
      const cinemaId = film.Film_strCode?.slice(0, 4)?.toUpperCase();

      if (!cinemaId) return;

      if (!moviesByCinema[cinemaId]) {
        const cinemaDetails = cinemaMap[cinemaId] || {};
        moviesByCinema[cinemaId] = {
          cinemaId: cinemaId,
          cinemaName: cinemaDetails.cinemaName || cinemaId,
          cinemaDetails: cinemaDetails,
          movies: [],
        };
      }

      const openingDate = film.Film_dtmOpeningDate;
      let parsedOpeningDate = null;
      if (openingDate) {
        const match = openingDate.match(/\d+/);
        if (match) {
          parsedOpeningDate = new Date(parseInt(match[0], 10));
        }
      }

      moviesByCinema[cinemaId].movies.push({
        filmCode: film.Film_strCode,
        name: film.Film_strTitle,
        shortName: film.Film_strShortName,
        description: film.Film_strDescription,
        descriptionLong: film.Film_strDescriptionLong,
        duration: film.Film_intDuration,
        censorRating: film.Film_strCensor,
        category: film.Film_strContent,
        status: film.Film_strStatus,
        upcomingFlag: film.Film_strUpcomingFlag,
        featureFlag: film.Film_strFeatureFlag,
        nowShowingFlag: film.Film_strNowShowingFlag,
        openingDate: parsedOpeningDate,
        categoryCode: film.FilmCat_strCode,
        categoryShortName: film.FilmCat_strShortName,
        children: film.Film_strChildren,
        signText: film.Film_strSignText,
        signSequence: film.Film_bytSignSequence,
      });
    });

    // Add movie count for each cinema
    Object.keys(moviesByCinema).forEach((cinemaId) => {
      moviesByCinema[cinemaId].totalMovies = moviesByCinema[cinemaId].movies.length;
    });

    // Create cinemas array for dropdown
    const cinemas = Object.values(moviesByCinema).map((cinema) => ({
      cinemaId: cinema.cinemaId,
      cinemaName: cinema.cinemaName,
      totalMovies: cinema.totalMovies,
      ...cinema.cinemaDetails,
    }));

    return {
      success: true,
      message: "Movies fetched successfully",
      totalCinemas: Object.keys(moviesByCinema).length,
      totalMovies: filmList.length,
      cinemas: cinemas,
      data: moviesByCinema,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all shows/sessions directly from Vista API grouped by cinema
 * Includes cinema details and movie details
 * No database operations - returns raw Vista response formatted
 */
export const getShowsByCinema = async () => {
  try {
    // Fetch both sessions and movie details in parallel
    const [showResponse, movieResponse] = await Promise.all([
      axios.request(showConfig),
      axios.request(movieConfig),
    ]);

    if (!showResponse.data?.data?.SessionList?.length) {
      return {
        success: true,
        message: "No shows found",
        data: {},
        cinemas: [],
      };
    }

    const sessionList = showResponse.data.data.SessionList;
    const filmList = movieResponse.data?.data?.Fillmlist || [];
    const cinemaList = movieResponse.data?.data?.CinemaList || [];

    // Create cinema lookup map with full details
    const cinemaMap = {};
    cinemaList.forEach((cinema) => {
      cinemaMap[cinema.Cinema_strID?.toUpperCase()] = {
        cinemaId: cinema.Cinema_strID,
        cinemaName: cinema.Cinema_strName,
        webServiceUrl: cinema.Cinema_strWebServiceURL,
        webServiceUrl2: cinema.Cinema_strWebServiceURL2,
        licenseName: cinema.Cinema_strLicenseName,
        licenseNumber: cinema.Cinema_strLicenseNo,
        isOnline: cinema.Cinema_strIsOnline,
        branchCode: cinema.Cinema_strBranchCode,
      };
    });

    // Create movie lookup map
    const movieMap = {};
    filmList.forEach((film) => {
      movieMap[film.Film_strCode?.toUpperCase()] = {
        filmCode: film.Film_strCode,
        name: film.Film_strTitle,
        shortName: film.Film_strShortName,
        duration: film.Film_intDuration,
        censorRating: film.Film_strCensor,
        category: film.Film_strContent,
        status: film.Film_strStatus,
        upcomingFlag: film.Film_strUpcomingFlag,
        nowShowingFlag: film.Film_strNowShowingFlag,
      };
    });

    // Group shows by cinema
    const showsByCinema = {};

    sessionList.forEach((session) => {
      const cinemaId = session.Cinema_strID?.toUpperCase();
      const filmCode = session.Film_strCode?.toUpperCase();

      if (!cinemaId) return;

      if (!showsByCinema[cinemaId]) {
        const cinemaDetails = cinemaMap[cinemaId] || {};
        showsByCinema[cinemaId] = {
          cinemaId: cinemaId,
          cinemaName: cinemaDetails.cinemaName || cinemaId,
          cinemaDetails: cinemaDetails,
          shows: [],
          movieWise: {},
        };
      }

      // Get movie details
      const movieDetails = movieMap[filmCode] || {
        filmCode: filmCode,
        name: filmCode,
      };

      // Parse dates
      const sessionRealShow = session.Session_dtmRealShow
        ? moment(session.Session_dtmRealShow).utcOffset("+5:30").toDate()
        : null;
      const sessionFinishShow = session.Session_dtmFinishShow
        ? moment(session.Session_dtmFinishShow).utcOffset("+5:30").toDate()
        : null;
      const filmFirstShow = session.Session_dtmFilmFirstShow
        ? moment(session.Session_dtmFilmFirstShow).utcOffset("+5:30").toDate()
        : null;

      const showData = {
        sessionId: session.Session_lngSessionId,
        filmCode: filmCode,
        movieName: movieDetails.name,
        movieDetails: movieDetails,
        screenNumber: session.Screen_bytNum,
        screenName: session.Screen_strName,
        layoutId: session.Layout_intId,
        status: session.Session_strStatus,
        type: session.Session_strType,
        sessionRealShow: sessionRealShow,
        sessionFinishShow: sessionFinishShow,
        sessionFilmFirstShow: filmFirstShow,
        pGroupCode: session.PGroup_strCode,
        seatsAvailable: session.Session_intSeatsAvail,
        seatsTotal: session.Session_intSeatsTotal,
        seatAllocation: session.Session_strSeatAllocation,
        comments: session.Session_strComments,
        hoSessionId: session.Session_strHOSessionID,
        additionalData: session.Session_strAdditionalData,
        operatorCode: session.CinOperator_strCode,
      };

      showsByCinema[cinemaId].shows.push(showData);

      // Group by movie within cinema
      if (!showsByCinema[cinemaId].movieWise[filmCode]) {
        showsByCinema[cinemaId].movieWise[filmCode] = {
          filmCode: filmCode,
          movieName: movieDetails.name,
          movieDetails: movieDetails,
          shows: [],
        };
      }
      showsByCinema[cinemaId].movieWise[filmCode].shows.push(showData);
    });

    // Add counts and convert movieWise to array
    Object.keys(showsByCinema).forEach((cinemaId) => {
      showsByCinema[cinemaId].totalShows = showsByCinema[cinemaId].shows.length;
      showsByCinema[cinemaId].totalMovies = Object.keys(showsByCinema[cinemaId].movieWise).length;

      // Convert movieWise object to array and add show counts
      const movieWiseArray = Object.values(showsByCinema[cinemaId].movieWise).map((movie) => ({
        ...movie,
        totalShows: movie.shows.length,
      }));
      showsByCinema[cinemaId].movieWise = movieWiseArray;
    });

    // Create cinemas array for dropdown
    const cinemas = Object.values(showsByCinema).map((cinema) => ({
      cinemaId: cinema.cinemaId,
      cinemaName: cinema.cinemaName,
      totalShows: cinema.totalShows,
      totalMovies: cinema.totalMovies,
      ...cinema.cinemaDetails,
    }));

    return {
      success: true,
      message: "Shows fetched successfully",
      totalCinemas: Object.keys(showsByCinema).length,
      totalShows: sessionList.length,
      cinemas: cinemas,
      data: showsByCinema,
    };
  } catch (error) {
    throw error;
  }
};
