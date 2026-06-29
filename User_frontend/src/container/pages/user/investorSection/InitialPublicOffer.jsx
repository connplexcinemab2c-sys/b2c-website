import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

export default function InitialPublicOffer() {
  return (
    <>
      <Index.Box className="investor-board-meeting inverstor-inner-page">
        <Index.Box className="inestor-page-title-box">
          <Index.Typography className="inestor-page-title">
            Initial Public Offer
          </Index.Typography>
        </Index.Box>
        <Index.Box className="investor-card-main-flex">
          {/* <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Abridged Prospectus
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a> */}

          {/* <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Basis of Allotment Advertisement
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a> */}
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.DraftRedHerringProspectus}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Draft Red Herring Prospectus
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          {/* <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                GID
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                IPO Application Form
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Material Contracts to the Issue
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Material Documents
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Pre Issue Advertisement
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Prospectus
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Red Herring Prospectus
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a> */}
        </Index.Box>
      </Index.Box>
    </>
  );
}
