import React from "react";
import Index from "../../../Index";

function NotificationTab() {
  return (
    <Index.Box className="account-tab-notification">
      <Index.Box className="account-tab-heading-box">
        <Index.Typography component="span" className="account-tab-heading">
          Notification
        </Index.Typography>
      </Index.Box>
      <Index.Box className="no-found-svg-box">
        <Index.NotificationsIcon />
        You don't seem to have any recent notification.
      </Index.Box>
    </Index.Box>
  );
}

export default NotificationTab;
