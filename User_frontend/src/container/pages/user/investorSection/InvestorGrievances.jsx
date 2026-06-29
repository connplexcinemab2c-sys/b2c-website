import React from "react";
import Index from "../../../Index";

export default function InvestorGrievances() {
  return (
    <>
      <Index.Box className="investor-board-meeting inverstor-inner-page">
        <Index.Box className="inestor-page-title-box">
          <Index.Typography className="inestor-page-title">
            Investor Grievances
          </Index.Typography>
        </Index.Box>
        <Index.Box className="investor-content-main">
          <Index.Typography className="investor-content-title">
            For any investor complaints/grievances, kindly mail us on:
          </Index.Typography>
          <Index.Link href="" className="investor-mail-link">
            connplex.smeipo@linkintime.co.in
          </Index.Link>
          <Index.Link href="" className="investor-mail-link">
            cs@theconnplex.com
          </Index.Link>
          <Index.Link href="" className="investor-mail-link">
            grievance@theconnplex.com
          </Index.Link>
        </Index.Box>
      </Index.Box>
    </>
  );
}
