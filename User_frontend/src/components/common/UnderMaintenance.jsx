import React from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";

export default function UnderMaintenance() {
  return (
    <Index.Box className="maintenance-container">
      <Index.Box className="maintenance-content">
        <Index.Box className="maintenance-icon">
          <img
            src={PagesIndex.Png.ConnplexLogoIcon}
            width="120"
            height="120"
            alt="Connplex Logo"
          />
        </Index.Box>
        <Index.Typography variant="h5" className="maintenance-title">
          We're Under Maintenance
        </Index.Typography>
        <Index.Typography variant="body1" className="maintenance-description">
          We're currently performing scheduled maintenance to improve your experience.
        </Index.Typography>
        <Index.Typography variant="body2" className="maintenance-note">
          Thank you for your patience!
        </Index.Typography>
      </Index.Box>
    </Index.Box>
  );
}
