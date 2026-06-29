import React from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";

export default function Loader({ primary, secondary }) {
  return (
    <>
      {primary && <Index.Box className="spinner-box">
        <Index.Box className="configure-border-1">
          <Index.Box className="configure-core"></Index.Box>
        </Index.Box>
        <Index.Box className="configure-border-2">
          <Index.Box className="configure-core">
            <img
              src={PagesIndex.Png.ConnplexLogoIcon}
              width="512"
              height="512"
              className="head-logo-icon"
              alt="Company Logo"
            />
          </Index.Box>
        </Index.Box>
      </Index.Box>}
      {secondary && <Index.Box class="loader-box">
        <Index.Box class="loader"></Index.Box>
      </Index.Box>}
    </>
  );
}
