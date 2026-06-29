import type from "./type";

const getUserData = (payload) => ({
  type: type.getUserDetails,
  payload,
});
const getUserToken = (payload) => ({
  type: type.getUserToken,
  payload,
});
const userLogOut = () => ({
  type: type.userLogOut,
});
const changeRegion = (payload) => ({
  type: type.changeRegion,
  payload,
});
const showLoader = (payload) => ({
  type: type.showLoader,
  payload,
});
const getOtpTimer = (payload) => ({
  type: type.getOtpTimer,
  payload,
});
const hideLoader = (payload) => ({
  type: type.hideLoader,
  payload,
});
const upcomingMoviesList = (payload) => ({
  type: type.upcomingMoviesList,
  payload,
});
const getCinemaData = (payload) => ({
  type: type.getCinemaData,
  payload,
});
const openLocationModel = (payload) => ({
  type: type.openLocation,
  payload,
});
const closeLocationModel = (payload) => ({
  type: type.closeLocation,
  payload,
});

const updateMovieFilter = (payload) => ({
  type: type.movieFilter,
  payload,
})

const membershipPlanAction = (payload) => ({
  type: type.membershipPlan,
  payload,
});
export {
  closeLocationModel,
  openLocationModel,
  membershipPlanAction,
  getUserData,
  changeRegion,
  userLogOut,
  upcomingMoviesList,
  showLoader,
  hideLoader,
  getUserToken,
  getOtpTimer,
  getCinemaData,
  updateMovieFilter
};
