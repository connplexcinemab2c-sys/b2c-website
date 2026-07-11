import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";


const PolicySubSections  = [
  {
    title: "Board Diversity Policy",
    path: "/board-diversity-policy"
  },
  {
    title: "Brief Profile of Board of Directors including Directorship",
    path: "/brief-profile-of-board-of-directors"
  },
  {
    title: "Code of conduct for prevention of Insider Trading",
    path: "/code-of-conduct-insider-trading"
  },
  {
    title: "Code of Conduct Independent Director",
    path: "/code-of-conduct-independent-director"
  },
  {
    title: "Code of Conduct of Employee",
    path: "/code-of-conduct-employee"
  },
  {
    title: "Leak of UPSI",
    path: "/leak-of-upsi"
  },
  {
    title: "Policy for determining Material Subsidiary",
    path: "/policy-material-subsidiary"
  },
  {
    title: "Policy of Preservation of Documents",
    path: "/policy-preservation-documents"
  },
  {
    title: "Term Condition of Appointment of ID",
    path: "/term-condition-appointment-id"
  },
  {
    title: "Website Content Archival Policy",
    path: "/website-content-archival-policy"
  }
];



function InvestorSection() {
    useEffect(() => {
      if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        window.location.replace("https://theconnplex.com/investors");
      }
    }, [])
  // for page redirect
  const location = PagesIndex.useLocation();
  const downloadFile = () => {
    const downloadUrl =
      "https://drive.google.com/uc?export=download&id=1Ea08_CxSvVxwUwp9NlVZ61VeiBB9oxRS"; // Your direct download link
    window.open(downloadUrl, "_blank"); // Open the download link in a new tab
  };

  // for submenu dropdown
  const [openAnnouncements, setOpenAnnouncements] = React.useState(false);
  const handleClickAnnouncements = () => {
    setOpenAnnouncements((prevState) => !prevState);
  };
  const isActiveRoute =
    location?.pathname?.includes("/investors/board-meeting") ||
    location?.pathname?.includes("/investors/compliances") ||
    location?.pathname?.includes("/investors/general-meeting") ||
    location?.pathname?.includes("/investors/other-announcements");
  React.useEffect(() => {
    if (isActiveRoute) {
      setOpenAnnouncements(true);
    } else {
      setOpenAnnouncements(false);
    }
  }, [location?.pathname]);

  // for committees collapse
  const [openCommittees, setOpenCommittees] = React.useState(false);

  const handleClickCommittees = () => {
    setOpenCommittees((prevState) => !prevState);
  };
  useEffect(() => {
    if (
      location?.pathname?.includes("/investors/posh-committee") ||
      location?.pathname?.includes("/investors/greviances") ||
      location?.pathname?.includes("/investors/various-commitee-for-board")
    ) {
      setOpenCommittees(true);
    } else {
      setOpenCommittees(false);
    }
  }, [location?.pathname]);

  // for Initial Public Offer submenu dropdown
  const [openInitialPublicOffer, setOpenInitialPublicOffer] =
    React.useState(false);
  const handleClickInitialPublicOffer = () => {
    setOpenInitialPublicOffer((prevState) => !prevState);
  };
  useEffect(() => {
    if (
      location?.pathname?.includes("/investors/abridged-prospectus") ||
      location?.pathname?.includes(
        "/investors/basis-of-allotment-advertisement"
      ) ||
      location?.pathname?.includes("/investors/draft-red-herring-prospectus") ||
      location?.pathname?.includes("/investors/gid") ||
      location?.pathname?.includes("/investors/ipo-application-form") ||
      location?.pathname?.includes(
        "/investors/material-contracts-to-the-issue"
      ) ||
      location?.pathname?.includes("/investors/material-documents") ||
      location?.pathname?.includes("/investors/pre-issue-advertisement") ||
      location?.pathname?.includes("/investors/prospectus") ||
      location?.pathname?.includes("/investors/red-herring-prospectus")
    ) {
      setOpenInitialPublicOffer(true);
    } else {
      setOpenInitialPublicOffer(false);
    }
  }, [location?.pathname]);

  // for Polices Offer submenu dropdown
  const [openPolicies, setOpenPolicies] = React.useState(false);

  const handleClickPolicies = () => {
    setOpenPolicies((prevState) => !prevState);
  };
  useEffect(() => {
    if (
      PolicySubSections.map((item) => `/investors${item.path}`).includes(location?.pathname) ||
      location?.pathname?.includes("/investors/posh-policy") ||
      location?.pathname?.includes("/investors/vigil-mechanism-policy") ||
      location?.pathname?.includes(
        "/investors/policy-on-related-party-transaction"
      ) ||
      location?.pathname?.includes(
        "/investors/policy-for-determination-of-materiality"
      ) ||
      location?.pathname?.includes(
        "/investors/policies-on-payments-to-non-executive-directors"
      ) ||
      location?.pathname?.includes("/investors/nrc-policy") ||
      location?.pathname?.includes("/investors/familarisation-programme") ||
      location?.pathname?.includes("/investors/dividend-distribution-policy") ||
      location?.pathname?.includes("/investors/csr-policy") ||
      location?.pathname?.includes(
        "/investors/code-of-practices-and-procedures"
      ) ||
      location?.pathname?.includes("/investors/coc-for-dir-kmp")
    ) {
      setOpenPolicies(true);
    } else {
      setOpenPolicies(false);
    }
  }, [location?.pathname]);

  return (
    <>
      {/* <Index.Box className="about-feature">
        <Index.Box className="cus-container">
          <Index.Box className="heading">
            <Index.Typography variant="h3" component="h3" className="title">
              FOR KNOW MORE DOWNLOAD BROCHURE 
            </Index.Typography>

            <Index.Box className="download-btn-box">
              <Index.Button onClick={downloadFile} className="btn btn-primary">
                Download Brochure
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box> */}

      <Index.Box className="investor-list-main">
        <Index.List className="investor-list">
          <Index.ListItem
            className="investor-listitem investor-submenu-listitem-main"
            onClick={handleClickAnnouncements}
          >
            <Index.Box className="investor-link-box">
              <Index.Link className="investor-list-link">
                <span className="investor-link-text">Announcements</span>
              </Index.Link>
              {openAnnouncements ? (
                <Index.ExpandLess className="investor-expandless-icon" />
              ) : (
                <Index.ExpandMore className="investor-expandmore-icon" />
              )}
              <Index.Box className="investor-submenu-main">
                <Index.Collapse
                  in={openAnnouncements}
                  timeout="auto"
                  unmountOnExit
                  className="investor-submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="investor-submenulist"
                  >
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/board-meeting"
                        className={
                          location?.pathname.includes(
                            "/investors/board-meeting"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Board Meeting
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/compliances"
                        className={
                          location?.pathname.includes("/investors/compliances")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">Compliances</span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/general-meeting"
                        className={
                          location?.pathname.includes(
                            "/investors/general-meeting"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          General Meeting
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/other-announcements"
                        className={
                          location?.pathname.includes(
                            "/investors/other-announcements"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Other Announcements
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </Index.Box>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/annual-report"
              className={
                location?.pathname.includes("/investors/annual-report")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Annual Report
            </Index.Link>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/annual-returns"
              className={
                location?.pathname.includes("/investors/annual-returns")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Annual Returns
            </Index.Link>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/board-of-directors"
              className={
                location?.pathname.includes("/investors/board-of-directors")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Board Of Directors
            </Index.Link>
          </Index.ListItem>

          {/* <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/committees"
              className={
                location?.pathname.includes("/investors/committees")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Committees
            </Index.Link>
          </Index.ListItem> */}

          <Index.ListItem
            className="investor-listitem investor-submenu-listitem-main"
            onClick={handleClickCommittees}
          >
            <Index.Box className="investor-link-box">
              <Index.Link className="investor-list-link">
                <span className="investor-link-text">Committees</span>
              </Index.Link>
              {openCommittees ? (
                <Index.ExpandLess className="investor-expandless-icon" />
              ) : (
                <Index.ExpandMore className="investor-expandmore-icon" />
              )}
              <Index.Box className="investor-submenu-main">
                <Index.Collapse
                  in={openCommittees}
                  timeout="auto"
                  unmountOnExit
                  className="investor-submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="investor-submenulist"
                  >
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/posh-committee"
                        className={
                          location?.pathname.includes(
                            "/investors/posh-committee"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">POSH</span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/greviances"
                        className={
                          location?.pathname.includes("/investors/greviances")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">Greviances </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/various-commitee-for-board"
                        className={
                          location?.pathname.includes(
                            "/investors/various-commitee-for-board"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Various Commitee For Board{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </Index.Box>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/financial-results"
              className={
                location?.pathname.includes("/investors/financial-results")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Financial Results
            </Index.Link>
          </Index.ListItem>

          {/* <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/initial-public-offer"
              className={
                location?.pathname.includes("/investors/initial-public-offer")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Initial Public Offer
            </Index.Link>
          </Index.ListItem> */}

          {/* <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/policies"
              className={
                location?.pathname.includes("/investors/policies")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Policies
            </Index.Link>
          </Index.ListItem> */}

          <Index.ListItem
            className="investor-listitem investor-submenu-listitem-main"
            onClick={handleClickInitialPublicOffer}
          >
            <Index.Box className="investor-link-box">
              <Index.Link className="investor-list-link">
                <span className="investor-link-text">Initial Public Offer</span>
              </Index.Link>
              {openInitialPublicOffer ? (
                <Index.ExpandLess className="investor-expandless-icon" />
              ) : (
                <Index.ExpandMore className="investor-expandmore-icon" />
              )}
              <Index.Box className="investor-submenu-main">
                <Index.Collapse
                  in={openInitialPublicOffer}
                  timeout="auto"
                  unmountOnExit
                  className="investor-submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="investor-submenulist"
                  >
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/abridged-prospectus"
                        className={
                          location?.pathname.includes(
                            "/investors/abridged-prospectus"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Abridged Prospectus
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/basis-of-allotment-advertisement"
                        className={
                          location?.pathname.includes(
                            "/investors/basis-of-allotment-advertisement"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Basis of Allotment Advertisement{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/draft-red-herring-prospectus"
                        className={
                          location?.pathname.includes(
                            "/investors/draft-red-herring-prospectus"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Draft Red Herring Prospectus{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/gid"
                        className={
                          location?.pathname.includes("/investors/gid")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">GID </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/ipo-application-form"
                        className={
                          location?.pathname.includes(
                            "/investors/ipo-application-form"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          IPO Application Form{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/material-contracts-to-the-issue"
                        className={
                          location?.pathname.includes(
                            "/investors/material-contracts-to-the-issue"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Material Contracts to the Issue{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/material-documents"
                        className={
                          location?.pathname.includes(
                            "/investors/material-documents"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Material Documents{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/pre-issue-advertisement"
                        className={
                          location?.pathname.includes(
                            "/investors/pre-issue-advertisement"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Pre Issue Advertisement{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/prospectus"
                        className={
                          location?.pathname.includes("/investors/prospectus")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">Prospectus </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/red-herring-prospectus"
                        className={
                          location?.pathname.includes(
                            "/investors/red-herring-prospectus"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Red Herring Prospectus{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </Index.Box>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/investor-grievances"
              className={
                location?.pathname.includes("/investors/investor-grievances")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Investor Grievances
            </Index.Link>
          </Index.ListItem>

          <Index.ListItem
            className="investor-listitem investor-submenu-listitem-main"
            onClick={handleClickPolicies}
          >
            <Index.Box className="investor-link-box">
              <Index.Link className="investor-list-link">
                <span className="investor-link-text">Policies</span>
              </Index.Link>
              {openPolicies ? (
                <Index.ExpandLess className="investor-expandless-icon" />
              ) : (
                <Index.ExpandMore className="investor-expandmore-icon" />
              )}
              <Index.Box className="investor-submenu-main">
                <Index.Collapse
                  in={openPolicies}
                  timeout="auto"
                  unmountOnExit
                  className="investor-submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="investor-submenulist"
                  >
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/posh-policy"
                        className={
                          location?.pathname.includes("/investors/posh-policy")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">POSH Policy</span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/vigil-mechanism-policy"
                        className={
                          location?.pathname.includes(
                            "/investors/vigil-mechanism-policy"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Vigil Mechanism(Whistle Blower) Policy{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/policy-on-related-party-transaction"
                        className={
                          location?.pathname.includes(
                            "/investors/policy-on-related-party-transaction"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Policy on Related Party Transaction
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/policy-for-determination-of-materiality"
                        className={
                          location?.pathname.includes(
                            "/investors/policy-for-determination-of-materiality"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Policy for Determination of Materiality
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/policies-on-payments-to-non-executive-directors"
                        className={
                          location?.pathname.includes(
                            "/investors/policies-on-payments-to-non-executive-directors"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Policies on Payments to Non-Executive Directors
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/nrc-policy"
                        className={
                          location?.pathname.includes("/investors/nrc-policy")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">NRC Policy</span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/familarisation-programme"
                        className={
                          location?.pathname.includes(
                            "/investors/familarisation-programme"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Familarisation Programme
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/dividend-distribution-policy"
                        className={
                          location?.pathname.includes(
                            "/investors/dividend-distribution-policy"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Dividend Distribution Policy
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/csr-policy"
                        className={
                          location?.pathname.includes("/investors/csr-policy")
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text"> CSR Policy </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/code-of-practices-and-procedures"
                        className={
                          location?.pathname.includes(
                            "/investors/code-of-practices-and-procedures"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          Code Of Practices And Procedures For Fair Disclosure
                          Of Unpublished Price Sensitive Information{" "}
                        </span>
                      </Index.Link>
                    </Index.ListItem>
                    <Index.ListItem className="investor-listitem">
                      <Index.Link
                        to="/investors/coc-for-dir-kmp"
                        className={
                          location?.pathname.includes(
                            "/investors/coc-for-dir-kmp"
                          )
                            ? "investor-list-link active"
                            : "investor-list-link"
                        }
                      >
                        <span className="investor-link-text">
                          COC for Dir_KMP
                        </span>
                      </Index.Link>
                    </Index.ListItem>

                    {PolicySubSections?.map((data) => {
                      return (
                        <>
                          <Index.ListItem className="investor-listitem">
                            <Index.Link
                              to={`/investors${data.path}`}
                              className={
                                location?.pathname.includes(
                                  `/investors${data.path}`
                                )
                                  ? "investor-list-link active"
                                  : "investor-list-link"
                              }
                            >
                              <span className="investor-link-text">{data.title}</span>
                            </Index.Link>
                          </Index.ListItem>
                        </>
                      );
                    })}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </Index.Box>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/shareholding-patterns"
              className={
                location?.pathname.includes("/investors/shareholding-patterns")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Shareholding Patterns
            </Index.Link>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/pr-media"
              className={
                location?.pathname.includes("/investors/pr-media")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              PR/Media
            </Index.Link>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/meetings"
              className={
                location?.pathname.includes("/investors/meetings")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Meetings
            </Index.Link>
          </Index.ListItem>

          <Index.ListItem className="investor-listitem">
            <Index.Link
              to="/investors/disclosure"
              className={
                location?.pathname.includes("/investors/disclosure")
                  ? "investor-list-link active"
                  : "investor-list-link"
              }
            >
              Disclosure
            </Index.Link>
          </Index.ListItem>
        </Index.List>
      </Index.Box>
    </>
  );
}

export default InvestorSection;
