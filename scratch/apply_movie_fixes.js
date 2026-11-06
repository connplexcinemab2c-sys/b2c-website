const fs = require('fs');
const path = require('path');

// 1. Fix Movies.js
const moviesPath = path.join(__dirname, '..', 'Backend', 'src', 'controller', 'user', 'Movies.js');
let moviesContent = fs.readFileSync(moviesPath, 'utf8');

// Replace dead/leaking block in moviesShowByCinema
const oldMoviesBlock = /const moviesDetails = await Movie\.find\(\{[\s\S]*?const cinemas = await Cinema\.find\(\{[\s\S]*?\n\s*\}\);/m;

const newMoviesBlock = `const cinemaIds = [];
    if (
      cinemaDetails &&
      (!regionId || cinemaDetails.regionId?.toString() == regionId?.toString()) &&
      cinemaDetails.displayName
    ) {
      cinemaIds.push(cinemaDetails._id);
    }`;

if (oldMoviesBlock.test(moviesContent)) {
    moviesContent = moviesContent.replace(oldMoviesBlock, newMoviesBlock);
    console.log('Replaced oldMoviesBlock in Movies.js');
} else {
    console.error('Failed to match oldMoviesBlock in Movies.js');
}

// Remove the second cinemaIds population and dead matchstage.filmCode in moviesShowByCinema
const oldCinemaIdsBlock = /const cinemaIds = \[\];\s*cinemas\.map\([\s\S]*?\n\s*\}\);\s*\n/m;
if (oldCinemaIdsBlock.test(moviesContent)) {
    moviesContent = moviesContent.replace(oldCinemaIdsBlock, '');
    console.log('Removed oldCinemaIdsBlock in Movies.js');
}

const oldMatchFilmCode = /if \(moviesDetails\.uniqueFilmCode\) \{[\s\S]*?matchstage\.filmCode = \{[\s\S]*?\};\s*\n\s*\}/m;
if (oldMatchFilmCode.test(moviesContent)) {
    moviesContent = moviesContent.replace(oldMatchFilmCode, '');
    console.log('Removed oldMatchFilmCode in Movies.js');
}

fs.writeFileSync(moviesPath, moviesContent);
console.log('Saved updated Movies.js');

// 2. Fix Booking.js
const bookingPath = path.join(__dirname, '..', 'Backend', 'src', 'controller', 'booking', 'Booking.js');
let bookingContent = fs.readFileSync(bookingPath, 'utf8');

// In showTimeByCinemaIdAndMovie (around line 1198)
const oldBookingSync = /let movieDetails = await Movie\.findById\(\{ _id: movieId \}\);\s*const uniqueCode = movieDetails\.uniqueFilmCode;\s*const moviesByUniqueCode = await Movie\.find\(\{[\s\S]*?deletedStatus: 0,?\s*\}\);\s*const filmCodes = moviesByUniqueCode[\s\S]*?\);/m;

const newBookingSync = `let movieDetails = await Movie.findById({ _id: movieId }).lean();
    const uniqueCode = movieDetails?.uniqueFilmCode;
    let filmCodes = [];
    if (uniqueCode) {
      const moviesByUniqueCode = await Movie.find(
        { uniqueFilmCode: uniqueCode, deletedStatus: 0 },
        { filmCode: 1 }
      ).lean();
      filmCodes = moviesByUniqueCode
        .map((m) => m?.filmCode)
        .filter(Boolean)
        .map((filmCodeSlice) => new RegExp(filmCodeSlice, "i"));
    } else if (movieDetails?.filmCode) {
      filmCodes = [new RegExp(movieDetails.filmCode, "i")];
    }`;

if (oldBookingSync.test(bookingContent)) {
    bookingContent = bookingContent.replace(oldBookingSync, newBookingSync);
    console.log('Replaced oldBookingSync in Booking.js');
} else {
    console.error('Failed to match oldBookingSync in Booking.js');
}

fs.writeFileSync(bookingPath, bookingContent);
console.log('Saved updated Booking.js');
