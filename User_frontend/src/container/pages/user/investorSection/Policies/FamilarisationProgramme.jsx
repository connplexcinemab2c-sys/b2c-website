import React from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";

export default function FamilarisationProgramme() {
  return (
    <>
      <Index.Box className="investor-board-meeting inverstor-inner-page">
        <Index.Box className="inestor-page-title-box">
          <Index.Typography className="inestor-page-title">
            Familarisation Programme
          </Index.Typography>
        </Index.Box>
        <Index.Box className="investor-card-main-flex">
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.FamilarisationProgrammeExempted}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Familarisation Programme
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
        </Index.Box>
      </Index.Box>
    </>
  );
}
