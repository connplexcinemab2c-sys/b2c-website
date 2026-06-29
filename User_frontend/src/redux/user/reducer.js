import type from "./type";

const initialState = {
  userDetails: {},
  userToken: "",
  membershipPlan: null,
  isLoggedIn: false,
  region: "",
  upcomingMoviesList: [],
  isLoading: false,
  otpTimer: { minute: 0, seconds: 30 },
  cinemaData: {},
  openLocation: false,
  movieFilter:{
    priceFilter:[],
    timeFilter:[]
  }
};
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case type.getUserDetails:
      return {
        ...state,
        userDetails: action.payload,
        isLoggedIn: true,
      };
    case type.getUserToken:
      console.log(action.payload , ":action.payload")
      return {
        ...state,
        userToken: action.payload,
      };
    case type.userLogOut:
      return {
        ...state,
        isLoggedIn: false,
        userToken: "",
        region: "",
        userDetails:"",
        membershipPlan: null,
      };
    case type.upcomingMoviesList:
      return {
        ...state,
        upcomingMoviesList: action.payload,
      };
    case type.getOtpTimer:
      return {
        ...state,
        otpTimer: action.payload,
      };
    case type.showLoader:
      return {
        ...state,
        isLoading: true,
      };
    case type.hideLoader:
      return {
        ...state,
        isLoading: false,
      };
    case type.changeRegion:
      return {
        ...state,
        region: action.payload,
      };
    case type.getCinemaData:
      return {
        ...state,
        cinemaData: action.payload,
      };
    case type.openLocation: {
      return {
        ...state,
        openLocation: true,
      };
    }
    case type.closeLocation: {
      return {
        ...state,
        openLocation: false,
      };
    }
    case type.membershipPlan: {
      return {
        ...state,
        membershipPlan: action.payload,
      };
    }
    case type.movieFilter :{
      let movieFilter = {};
      const { priceFilter ,timeFilter } =  action?.payload;

      if(priceFilter.length){
        movieFilter.priceFilter = priceFilter;
      }
      if(timeFilter.length){
        movieFilter.timeFilter = timeFilter;
      }
      return {
        ...state,
        movieFilter:movieFilter
      }
    }

    default:
      return state;
  }
};

export default userReducer;
