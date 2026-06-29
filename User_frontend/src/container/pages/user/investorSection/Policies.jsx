import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

export default function Policies() {
  return (
    <>
      <Index.Box className="investor-board-meeting inverstor-inner-page">
        <Index.Box className="inestor-page-title-box">
          <Index.Typography className="inestor-page-title">
            Policies
          </Index.Typography>
        </Index.Box>
        <Index.Box className="investor-card-main-flex">
          {/* <a className="investor-card" target="_blank" href="">
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                POSH Policy
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
            href={PagesIndex.Pdf.VigilMechanismPolicy}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Vigil Mechanism(Whistle Blower) Policy
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.PolicyonRelatedPartyTransactionExempted}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Policy on Related Party Transaction
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.PolicyforDeterminationofMateriality}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Policy for Determination of Materiality
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.PoliciesonPaymentstoNonExecutiveDirectors}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Policies on Payments to Non-Executive Directors
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.NRCPolicy}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                NRC Policy
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
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
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.DividendDistributionPolicyExempted}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                Dividend Distribution Policy
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.CSRPolicy}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                CSR Policy
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={
              PagesIndex.Pdf
                .CodeOfPracticesAndProceduresForFaiDisclosureOfUnpublishedPriceSensitiveInformation
            }
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                CODE OF PRACTICES AND PROCEDURES FOR FAIR DISCLOSURE OF
                UNPUBLISHED PRICE SENSITIVE INFORMATION
              </Index.Typography>
              <img
                src={PagesIndex.Svg.pdfIcon}
                alt="download"
                className="investor-card-icon"
              />
            </Index.Box>
          </a>
          <a
            className="investor-card"
            target="_blank"
            href={PagesIndex.Pdf.COCforDirKMPExempted}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                COC for Dir_KMP
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
