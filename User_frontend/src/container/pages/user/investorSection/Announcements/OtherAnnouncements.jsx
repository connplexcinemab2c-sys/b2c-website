import React from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";

export default function OtherAnnouncements() {
  const announcementsList = [
    {
      title: "INTIMATION UNDER REGULATION 30 OF SEBI(LODR) - 11.07.2026",
      pdf: PagesIndex.Pdf.IntimationUnderRegulation30_11_07_2026,
    },
  ];

  return (
    <>
      <Index.Box className="investor-board-meeting inverstor-inner-page">
        <Index.Box className="inestor-page-title-box">
          <Index.Typography className="inestor-page-title">
            Other Announcements
          </Index.Typography>
        </Index.Box>
        <Index.Box className="investor-card-main-flex">
          {announcementsList.map((announcement, index) => (
            <a
              key={index}
              className="investor-card"
              target="_blank"
              rel="noopener noreferrer"
              href={announcement.pdf}
            >
              <Index.Box className="investor-content-flex">
                <Index.Typography className="investor-card-title">
                  {announcement.title}
                </Index.Typography>
                <img
                  src={PagesIndex.Svg.pdfIcon}
                  alt="download"
                  className="investor-card-icon"
                />
              </Index.Box>
            </a>
          ))}
        </Index.Box>
      </Index.Box>
    </>
  );
}
