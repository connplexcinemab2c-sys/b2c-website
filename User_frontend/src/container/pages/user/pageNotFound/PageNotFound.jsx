import { useCallback, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CustomHeader from "../../../../components/user/defaultLayout/CustomHeader";
import Footer from "../../../../components/user/defaultLayout/Footer";

function PageNotFound() {
  const [settingsState, setSettingsState] = useState({});

  const fetchGeneralSettings = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_GENERAL_SETTINGS
      );
      if (res?.status === 200) {
        setSettingsState(res?.data);
      }
    } catch (error) {
      console.error("Failed to fetch general settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchGeneralSettings();
  }, [fetchGeneralSettings]);

  return (
    <>
      <CustomHeader />
      <Index.Box className="main-page-not-found">
        <Index.Box className="main-content">
          <Index.Box className="page-not-found-wrapper">
            <Index.Box className="page-not-found-img">
              <img src={PagesIndex.Svg.PageNotFound} alt="Transaction Failed" />
            </Index.Box>
            <Index.Typography
              variant="h1"
              component="h1"
              className="page-not-found-title"
            >
              Page Not Available
            </Index.Typography>
            <Index.Typography className="page-not-found-subtitle">
              You didn't break the internet, but we can't find what you are
              looking for.
            </Index.Typography>
            <Index.Box className="page-not-found-btn-box">
              <Index.Link to="/" className="btn btn-primary">
                Back to home
              </Index.Link>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      <Footer settingsState={settingsState} />
    </>
  );
}

export default PageNotFound;
