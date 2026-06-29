import Footer from "./Footer";
// import Header from "./Header";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import CustomHeader from "./CustomHeader";
import { updateMovieFilter } from "../../../redux/user/action";
import { useEffect, useState } from "react";
import { useCallback } from "react";

const locationArrForMovieFilter = ["/movie-details","/seat-management"]

const Layout = () => {
  const { isLoading, userToken } = PagesIndex.useSelector((state) => state.UserReducer);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [settingsState, setSettingsState] = useState({});

  const location = PagesIndex.useLocation();
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();

  const fetchGeneralSettings = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(PagesIndex.Api.GET_GENERAL_SETTINGS);
      if (res?.status === 200) {
        setIsUnderMaintenance(res?.data?.underMaintenance);
        setSettingsState(res?.data);
      }
    } catch (error) {
      console.error("Failed to fetch general settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchGeneralSettings();
    if (isUnderMaintenance) {
      navigate('/');
    }
  }, [fetchGeneralSettings, isUnderMaintenance, navigate]);

  useEffect(() => {
    if (!locationArrForMovieFilter.includes(location?.pathname)) {
      dispatch(updateMovieFilter({ priceFilter: [], timeFilter: [] }));
    }
  }, [location, dispatch]);

  if (isUnderMaintenance) {
    return <img src={PagesIndex.Jpg.underMaintenance} alt="Under Maintenance" />;
  }

  return (
    <>
      {/* <Header /> */}
      <CustomHeader />
      <Index.Box className="main-content">
        {isLoading && <PagesIndex.Loader primary />}
        <PagesIndex.Outlet />
      </Index.Box>
      <Footer key={userToken} settingsState={settingsState} />
    </>
  );
};

export default Layout;
