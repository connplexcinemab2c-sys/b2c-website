import React from "react";
import PagesIndex from "./PageIndex";
import Index from "./Index";

const Loader = () => {
  return (
    <>
      <Index.Box className="spinner-box">
        <Index.Box className="configure-border-1">
          <Index.Box className="configure-core"></Index.Box>
        </Index.Box>
        <Index.Box className="configure-border-2">
          <Index.Box className="configure-core">
            <img
              src={PagesIndex.Png.connplexlogoIcon}
              width="512"
              height="512"
              className="head-logo-icon"
              alt="Company Logo"
            />
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </>
  );
};

export default Loader;
