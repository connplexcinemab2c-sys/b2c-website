import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Fix Movies.js
const moviesJsPath = path.join(__dirname, '..', 'Backend', 'src', 'controller', 'user', 'Movies.js');
let moviesContent = fs.readFileSync(moviesJsPath, 'utf8');

const oldMoviesShowByCinema = `    let cinemaDetails = await Cinema.findById(
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

    const cinemaIds = [];
    if (
      cinemaDetails &&
      (!regionId || cinemaDetails.regionId?.toString() == regionId?.toString()) &&
      cinemaDetails.displayName
    ) {
      cinemaIds.push(cinemaDetails._id);
    }

    const movieDetailsWithShows = await Show.aggregate([
      {
        $match: {
          cinemaObjectId: new mongoose.Types.ObjectId(cinemaId),`;

const newMoviesShowByCinema = `    if (!cinemaId || cinemaId === "null" || cinemaId === "undefined") {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: {
          movieDetailsWithShows: [],
          cinemaDetails: null,
          uniqueFilteredMovies: [],
          timingCinemawise: [],
        },
      });
    }

    let cinemaQuery;
    if (mongoose.Types.ObjectId.isValid(cinemaId)) {
      cinemaQuery = { _id: new mongoose.Types.ObjectId(cinemaId), isActive: true, deletedStatus: 0 };
    } else {
      cinemaQuery = { cinemaId: String(cinemaId).trim().toUpperCase(), isActive: true, deletedStatus: 0 };
    }

    let cinemaDetails = await Cinema.findOne(
      cinemaQuery,
      {
        displayName: true,
        address: true,
        googleUrl: true,
        cinemaId: true,
        cinema_images: true,
        cinemaAmenities: true,
        lat: true,
        long: true,
        regionId: true,
      }
    ).lean();

    if (!cinemaDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: "Cinema not found",
        data: {
          movieDetailsWithShows: [],
          cinemaDetails: null,
          uniqueFilteredMovies: [],
          timingCinemawise: [],
        },
      });
    }

    const sitesetting = await SiteSetting.findOne();
    cinemaDetails.showExtendedDays = sitesetting?.showExtendedDays || 10;

    const targetCinemaObjectId = cinemaDetails._id;
    const cinemaIds = [targetCinemaObjectId];

    const movieDetailsWithShows = await Show.aggregate([
      {
        $match: {
          cinemaObjectId: targetCinemaObjectId,`;

const normalize = (str) => str.replace(/\r\n/g, '\n');

if (normalize(moviesContent).includes(normalize(oldMoviesShowByCinema))) {
  moviesContent = normalize(moviesContent).replace(normalize(oldMoviesShowByCinema), normalize(newMoviesShowByCinema));
  fs.writeFileSync(moviesJsPath, moviesContent, 'utf8');
  console.log('✓ Successfully patched Backend/src/controller/user/Movies.js');
} else {
  console.error('✗ Could not find oldMoviesShowByCinema in Movies.js');
}

// 2. Fix Booking.js (moviesDetailsWithshow)
const bookingJsPath = path.join(__dirname, '..', 'Backend', 'src', 'controller', 'booking', 'Booking.js');
let bookingContent = fs.readFileSync(bookingJsPath, 'utf8');

const oldMoviesDetailsWithShow = `export const moviesDetailsWithshow = async (req, res) => {
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
    });`;

const newMoviesDetailsWithShow = `export const moviesDetailsWithshow = async (req, res) => {
  try {
    let { id } = req.body;
    if (!id || typeof id !== "string" || !id.includes("|")) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }
    const parts = id.split("|");
    const regionId = (parts[0] || "").trim();
    const date = (parts[1] || "").trim();
    const movieId = (parts[2] || "").trim();

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }

    const moviesDetails = await Movie.findOne({
      _id: new mongoose.Types.ObjectId(movieId),
      deletedStatus: 0,
    });

    if (!moviesDetails || !moviesDetails.uniqueFilmCode) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }

    const uniqueCode = moviesDetails.uniqueFilmCode;

    const moviesByUniqueCode = await Movie.find({
      uniqueFilmCode: uniqueCode,
      deletedStatus: 0,
    });
    const showDate = moment(date || new Date()).format("YYYY-MM-DD");
    const cinemas = await Cinema.find({ deletedStatus: 0, isActive: true });

    const cinemaIds = [];
    cinemas.forEach((cinema) => {
      if (
        (!regionId || (cinema?.regionId && cinema.regionId.toString() === regionId)) &&
        cinema.displayName
      ) {
        cinemaIds.push(cinema._id);
      }
    });`;

if (normalize(bookingContent).includes(normalize(oldMoviesDetailsWithShow))) {
  bookingContent = normalize(bookingContent).replace(normalize(oldMoviesDetailsWithShow), normalize(newMoviesDetailsWithShow));
  fs.writeFileSync(bookingJsPath, bookingContent, 'utf8');
  console.log('✓ Successfully patched Backend/src/controller/booking/Booking.js');
} else {
  console.error('✗ Could not find oldMoviesDetailsWithShow in Booking.js');
}
