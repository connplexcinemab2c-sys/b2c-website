import React, { useEffect } from "react";
import Routers from "./routes/Routes";
import UnderMaintenance from "./components/common/UnderMaintenance";
import "../src/assets/style/global.css";
import "../src/assets/style/global.responsive.css";
import "../src/container/auth/auth.css";
import "../src/container/auth/auth.responsive.css";
import "../src/components/user/defaultLayout/defaultLayout.css";
import "../src/components/user/defaultLayout/defaultLayout.responsive.css";
import "../src/container/pages/user/home/home.css";
import "../src/container/pages/user/home/home.responsive.css";
import "../src/container/pages/user/about/about.css";
import "../src/container/pages/user/about/about.responsive.css";
import "../src/container/pages/user/contact/contact.css";
import "../src/container/pages/user/contact/contact.responsive.css";
import "../src/container/pages/user/movieDetail/movieDetail.css";
import "../src/container/pages/user/movieDetail/movieDetail.responsive.css";
import "../src/container/pages/user/seatManagement/seatManagement.css";
import "../src/container/pages/user/seatManagement/seatManagement.responsive.css";
import "../src/container/pages/user/addSnacks/addSnacks.css";
import "../src/container/pages/user/addSnacks/addSnacks.responsive.css";
import "../src/container/pages/user/gallery/gallery.css";
import "../src/container/pages/user/gallery/gallery.responsive.css";
import "../src/container/pages/user/account/account.css";
import "../src/container/pages/user/account/account.responsive.css";
import "../src/container/pages/user/cinema/cinema.css";
import "../src/container/pages/user/cinema/cinema.responsive.css";
import "../src/container/pages/user/calender/calender.css";
import "../src/container/pages/user/calender/calender.responsive.css";
import "../src/container/pages/user/ecommerce/ecommerce.css";
import "../src/container/pages/user/ecommerce/ecommerce.responsive.css";
import "../src/container/pages/user/privacyPolicy/privacyPolicy.css";
import "../src/container/pages/user/privacyPolicy/privacyPolicy.responsive.css";

import "../src/container/pages/user/refundPolicy/refundPolicy.css";
import "../src/container/pages/user/refundPolicy/refundPolicy.responsive.css";
import "../src/container/pages/user/termsCondition/termsCondition.css";
import "../src/container/pages/user/termsCondition/termsCondition.responsive.css";
import "../src/container/pages/user/legalNotice/legalNotice.css";
import "../src/container/pages/user/legalNotice/legalNotice.responsive.css";
import "../src/container/pages/user/faq/faq.css";
import "../src/container/pages/user/faq/faq.responsive.css";
import "../src/container/pages/user/franchise/franchise.css";
import "../src/container/pages/user/franchise/franchise.responsive.css";
import "../src/container/pages/user/membership/membership.css";
import "../src/container/pages/user/membership/membership.responsive.css";
import "../src/container/pages/user/confirmationScreen/confirmationScreen.css";
import "../src/container/pages/user/confirmationScreen/confirmationScreen.responsive.css";
import "../src/container/pages/user/bookingInfo/bookingInfo.css";
import "../src/container/pages/user/bookingInfo/bookingInfo.responsive.css";
import "../src/container/pages/user/advertise/advertise.css";
import "../src/container/pages/user/advertise/advertise.responsive.css";
import "../src/container/pages/user/career/career.css";
import "../src/container/pages/user/career/career.responsive.css";
import "../src/container/pages/user/transactionFailed/transactionFailed.css";
import "../src/container/pages/user/pageNotFound/pageNotFound.css";
import "swiper/css";
import "swiper/css/navigation";
import "react-toastify/dist/ReactToastify.css";
import "react-lightbox-pack/dist/index.css";
import "react-datetime/css/react-datetime.css";

import "../src/container/pages/user/investorSection/investorSection.css";
import "../src/container/pages/user/investorSection/investorSection.responsive.css";
import { ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "../src/assets/style/slick.css";
// import "../src/assets/style/slick-theme.min.css"
import "./container/pages/user/blog/ckeditor.css";
// import { initGA } from "./utils/Analytics";

function App() {
  const location = useLocation();
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE == "true";
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [location.pathname]);
  // useEffect(() => {
  //   let myElement = document.getElementById("connplex");
  //   myElement.addEventListener("contextmenu", function (event) {
  //     event.preventDefault(); // Prevent the default right-click menu behavior
  //   });
  // }, []);

  const theme = createTheme({
    typography: {
      allVariants: {
        fontFamily: "worksans, sans-serif",
        lineHeight: "normal",
      },
    },
    breakpoints: {
      values: {
        xxs: 0,
        xs: 375,
        sm: 550,
        md: 768,
        lg: 1024,
        xl: 1350,
      },
    },
  });

  // useEffect(() => {
  //   initGA();
  // }, []);

  console.log(isMaintenanceMode, ":isMaintenanceMode")

  if (isMaintenanceMode) {
    return (
      <ThemeProvider theme={theme}>
        <UnderMaintenance />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div
        className={`App ${
          location.pathname === "/" ? "home" : location.pathname.split("/")[1]
        }`}
      >
        <div id={"payment_html"}></div>
        <ToastContainer theme="dark" hideProgressBar />
        <Routers />
      </div>
    </ThemeProvider>
  );
}

export default App;
