import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import {
  getMoviesByCinema,
  getShowsByCinema,
} from "../../services/VistaDirectService.js";

/**
 * Get all movies directly from Vista API grouped by cinema
 * @route GET /api/vista-direct/movies
 */
export const getVistaMoviesByCinema = async (req, res) => {
  try {
    const result = await getMoviesByCinema();

    return res.status(200).json({
      status: StatusCodes.OK,
      message: result.message,
      totalCinemas: result.totalCinemas,
      totalMovies: result.totalMovies,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

/**
 * Get all shows/sessions directly from Vista API grouped by cinema
 * @route GET /api/vista-direct/shows
 */
export const getVistaShowsByCinema = async (req, res) => {
  try {
    const result = await getShowsByCinema();

    return res.status(200).json({
      status: StatusCodes.OK,
      message: result.message,
      totalCinemas: result.totalCinemas,
      totalShows: result.totalShows,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};
