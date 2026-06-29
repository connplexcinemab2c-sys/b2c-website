import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useEffect } from "react";
import { useState } from "react";

function RefundPolicy() {
  const [cmsText, setCmsText] = useState("");
  useEffect(() => {
    getCMSData();
  }, []);
  const getCMSData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CMS).then((res) => {
      if (res?.status === 200) {
        setCmsText(res?.data?.refundPolicy);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };

  return (
    <Index.Box className="main-privacy">
      <Index.Box className="cus-container">
        <Index.Box className="privacy-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="privacy-header-title"
          >
            Refund Policy
          </Index.Typography>
        </Index.Box>
        <Index.Box className="privacy-body">
          <Index.Box dangerouslySetInnerHTML={{ __html: cmsText }} />
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default RefundPolicy;
