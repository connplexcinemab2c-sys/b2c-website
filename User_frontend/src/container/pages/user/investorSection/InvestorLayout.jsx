import React, { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CustomHeader from "../../../../components/user/defaultLayout/CustomHeader";
import Footer from "../../../../components/user/defaultLayout/Footer";

export default function InvestorLayout() {
  useEffect(() => {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      window.location.replace("https://theconnplex.com/investors");
    }
  }, []);
  const navigate = PagesIndex.useNavigate();
  const [settingsState, setSettingsState] = useState({});
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const fetchGeneralSettings = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_GENERAL_SETTINGS
      );
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
      navigate("/");
    }
  }, [fetchGeneralSettings, isUnderMaintenance, navigate]);

  return (
    <>
      <CustomHeader />
      <Index.Box className="main-about">
        <PagesIndex.BannerImage
          bannerImage={PagesIndex.Jpg.aboutBanner}
          bannerImageWidth="900"
          bannerImageHeight="570"
          bannerTitle="Investors"
        />

        <Index.Box className="cus-container">
          <Index.Box className="inevestor-flex">
            <Index.Box className="inverstor-left-main">
              <PagesIndex.InvestorSection />
            </Index.Box>
            <Index.Box className="inverstor-right-main">
              <Index.Box className="inverstor-containt-main">
                <Outlet />
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      {/* <Footer /> */}
      <Footer settingsState={settingsState} />
    </>
  );
}
