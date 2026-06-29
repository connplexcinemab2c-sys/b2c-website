import React from "react";
import Index from "../../../Index";
import { useState } from "react";
import { useEffect } from "react";
import PagesIndex from "../../../PagesIndex";

function LegalNotice() {
  const [cmsText, setCmsText] = useState("");
  useEffect(() => {
    getCMSData();
  }, []);
  const getCMSData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CMS).then((res) => {
      if (res?.status === 200) {
        setCmsText(res?.data?.legal_notice);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };
  return (
    <Index.Box className="main-legal-notice">
      <Index.Box className="cus-container">
        <Index.Box className="legal-notice-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="legal-notice-header-title"
          >
            Legal Notice
          </Index.Typography>
        </Index.Box>
        <Index.Box className="legal-notice-body">
          <Index.Box dangerouslySetInnerHTML={{ __html: cmsText }} />
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default LegalNotice;
