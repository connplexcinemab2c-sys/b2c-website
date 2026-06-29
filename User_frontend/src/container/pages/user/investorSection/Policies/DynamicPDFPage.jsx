import React, { useEffect, useState } from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";
import { useLocation, useParams } from "react-router-dom";
const PolicySubSections = [
  {
    title: "Board Diversity Policy",
    path: "/board-diversity-policy",
    pdf: PagesIndex.Pdf.BoardDiversityPolicy,
  },
  {
    title: "Brief Profile of Board of Directors including Directorship",
    path: "/brief-profile-of-board-of-directors",
    pdf: PagesIndex.Pdf.BriefProfileOfBoardOfDirectorsIncludingDirectorship,
  },
  {
    title: "Code of conduct for prevention of Insider Trading",
    path: "/code-of-conduct-insider-trading",
    pdf: PagesIndex.Pdf.CodeOfConductForPreventionOfInsiderTrading,
  },
  {
    title: "Code of Conduct Independent Director",
    path: "/code-of-conduct-independent-director",
    pdf: PagesIndex.Pdf.CodeOfConductIndependentDirector,
  },
  {
    title: "Code of Conduct of Employee",
    path: "/code-of-conduct-employee",
    pdf: PagesIndex.Pdf.CodeOfConductOfEmployee,
  },
  {
    title: "Leak of UPSI",
    path: "/leak-of-upsi",
    pdf: PagesIndex.Pdf.LeakOfUPSI,
  },
  {
    title: "Policy for determining Material Subsidiary",
    path: "/policy-material-subsidiary",
    pdf: PagesIndex.Pdf.PolicyForDeterminingMaterialSubsidiary,
  },
  {
    title: "Policy of Preservation of Documents",
    path: "/policy-preservation-documents",
    pdf: PagesIndex.Pdf.PolicyOfPreservationOfDocuments,
  },
  {
    title: "Term Condition of Appointment of ID",
    path: "/term-condition-appointment-id",
    pdf: PagesIndex.Pdf.TermConditionOfAppointmentOfID,
  },
  {
    title: "Website Content Archival Policy",
    path: "/website-content-archival-policy",
    pdf: PagesIndex.Pdf.WebsiteContentArchivalPolicy,
  },
];

export default function DynamicPDFPage() {
  const params = useParams();

  const [pageData, setPageData] = useState(
    PolicySubSections.find((item) => item.path === `/${params.pageSlug}`)
  );

  useEffect(() => {
    setPageData(
      PolicySubSections.find((item) => item.path === `/${params.pageSlug}`)
    );
  }, [params.pageSlug]);

  console.log("pageData", pageData);

  return (
    <>
      <Index.Box className="investor-board-meeting inverstor-inner-page">
        <Index.Box className="inestor-page-title-box">
          <Index.Typography className="inestor-page-title">
            {pageData?.title}
          </Index.Typography>
        </Index.Box>
        <Index.Box className="investor-card-main-flex">
          <a
            className="investor-card"
            target="_blank"
            href={pageData?.pdf}
          >
            <Index.Box className="investor-content-flex">
              <Index.Typography className="investor-card-title">
                {pageData?.title}
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
