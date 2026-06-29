import React from "react";
import Index from "../../../Index";
import { useState } from "react";
import { useEffect } from "react";
import PagesIndex from "../../../PagesIndex";

function TermsConition() {

  const [cmsText, setCmsText] = useState("");
  useEffect(() => {
    getCMSData();
  }, []);
  const getCMSData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CMS).then((res) => {
      if (res?.status === 200) {
        setCmsText(res?.data?.termsCondition);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };

  return (
    <Index.Box className="main-terms">
      <Index.Box className="cus-container">
        <Index.Box className="terms-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="terms-header-title"
          >
            Terms & Conditions
          </Index.Typography>
        </Index.Box>
        <Index.Box className="terms-body">
          <Index.Box dangerouslySetInnerHTML={{ __html: cmsText }} />
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );

}

export default TermsConition;
