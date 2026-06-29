import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useState, useEffect } from "react";
function MembershipTermsAndCondition() {
  const [cmsText, setCmsText] = useState("");
  useEffect(() => {
    getCMSData();
  }, []);
  const getCMSData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CMS).then((res) => {
      if (res?.status === 200) {
        setCmsText(res?.data?.membership_terms_and_conditions);
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

        <Index.Box className="terms-body member-term-body"
          sx={{
            color: "#ffffff",
            "& p": {
              marginBottom: "18px",
              lineHeight: "1.7",
            },
          }}>
          <Index.Box dangerouslySetInnerHTML={{ __html: cmsText }} />
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default MembershipTermsAndCondition;
