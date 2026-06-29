import React, { useEffect, useState } from "react";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import LogoNew from "../../../assets/images/png/logoNew.png";

function Footer({ settingsState }) {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);

  useEffect(() => {
    getCMSData();
    getPartnerData();
  }, []);
  const [cmsText, setCmsText] = useState("");
  const [partners, setPartners] = useState([]);

  const [openFranchise, setOpenFranchise] = useState(false);
  const [openBrandInfluencers, setOpenBrandInfluencers] = useState(false);
  const [openGroupBooking, setOpenGroupBooking] = useState(false);
  const [openReportIssueModal, setOpenReportIssueModal] = useState(false);

  const handleOpenFranchise = () => setOpenFranchise(true);
  const handleCloseFranchise = () => setOpenFranchise(false);

  const handleOpenBrandInfluencers = () => setOpenBrandInfluencers(true);
  const handleCloseBrandInfluencers = () => setOpenBrandInfluencers(false);

  const handleOpenGroupBooking = () => setOpenGroupBooking(true);
  const handleCloseGroupBooking = () => setOpenGroupBooking(false);

  const handleOpenReportIssue = () => setOpenReportIssueModal(true);
  const handleCloseReportIssue = () => setOpenReportIssueModal(false);

  const [openFeedback, setOpenFeedback] = useState(false);
  const handleOpenFeedback = () => setOpenFeedback(true);
  const handleCloseFeedback = () => setOpenFeedback(false);

  // useEffect(() => {
  //   if (!openFranchise) {
  //     window.scrollTo(0, 0);
  //   }
  // }, [openFranchise]);
  // useEffect(() => {
  //   if (!openBrandInfluencers) {
  //     window.scrollTo(0, 0);
  //   }
  // }, [openBrandInfluencers]);
  // useEffect(() => {
  //   if (!openGroupBooking) {
  //     window.scrollTo(0, 0);
  //   }
  // }, [openGroupBooking]);
  // useEffect(() => {
  //   if (!openReportIssueModal) {
  //     window.scrollTo(0, 0);
  //   }
  // }, [openReportIssueModal]);
  let menu = [
    {
      title: "GENERAL",
      children: [
        { link: "About Connplex", url: "/about" },
        { link: "Cinemas", url: "/cinema" },
        { link: "Gallery", url: "/gallery" },
        { link: "Calendar", url: "/calender" },
        { link: "Refund Policy", url: "/refund-policy" },
        { link: "Legal Notice", url: "/legal-notice" },
        { link: "Privacy Policy", url: "/privacy-policy" }, // <-- NEW
        { link: "Terms & Conditions", url: "/terms-conditions" },
        { link: "FAQ", url: "/faq" },
      ],
    },

    {
      title: "REACH",
      children: [
        {
          link: "20 Minutes Franchise",
          url: "/franchise",
        },
        { link: "Group Booking", modal: handleOpenGroupBooking },
        { link: "Advertise With Us", url: "/advertise" },
        { link: "Vendor Registration", url: "/vendor-registration" }, // <-- NEW
        {
          link: "Become a Brand Influencer",
          modal: handleOpenBrandInfluencers,
        },
        { link: "Career", url: "/career" },
        { link: "Feedback", modal: handleOpenFeedback },
        { link: "Contact Us", url: "/contact" },
      ],
    },
  ];
  const [footerMenu, setFooterMenu] = useState(menu);

  const getPartnerData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.LIST_PARTNER).then((res) => {
      if (res?.success === 200 || res?.status === 200) {
        setPartners(res?.data);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };
  useEffect(() => {
    const partnerNames = partners?.map((ele) => ({
      link: ele?.partnerName,
      url: ele?.link?.includes("http") ? ele?.link : `https://${ele?.link}`,
    }));

    const importantLinks = [
      { link: "Investor Section", url: "https://theconnplex.com/investors" },
      { link: "Apply For Franchise", modal: handleOpenFranchise },
      { link: "Lease Your Space", url: "https://theconnplex.com/capex" }, // <-- NEW
    ];

    let obj = {
      title: "Important Links",
      children: [...importantLinks],
    };

    let removeList = menu?.filter((e) => e.title !== "Important Links");
    setFooterMenu([...removeList, obj]);
  }, [partners]);

  const getCMSData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CMS).then((res) => {
      if (res?.status === 200) {
        setCmsText(res?.data?.aboutUs);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };

  return (
    <Index.Box className="main-footer">
      <Index.Box className="top-footer">
        <Index.Box className="cus-container">
          <Index.Box className="footer-menu-wrap">
            <Index.Box className="footer-logo-col">
              <Index.Link to="/" className="footer-logo">
                <img
                  src={LogoNew}
                  width="400"
                  height="80"
                  alt="Company Logo"
                />
              </Index.Link>
              <Index.Box className="footer-contact">
                <Index.Typography
                  variant="span"
                  component="span"
                  className="footer-contact-icon"
                >
                  <Index.HomeIcon />
                </Index.Typography>
                <Index.Box className="company-name-box">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="footer-contact-content"
                  >
                    {settingsState?.companyName},
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="footer-contact-content"
                  >
                    {settingsState?.address1}
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
              <Index.Box className="footer-contact">
                <Index.Typography
                  variant="span"
                  component="span"
                  className="footer-contact-icon"
                >
                  <Index.CallIcon />
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="footer-contact-content"
                >
                  <Index.Link
                    to={`tel:+91${settingsState?.contactNumber1}`}
                    className="footer-contact-link"
                  >
                    {settingsState?.contactNumber1
                      ? `+91 ${settingsState?.contactNumber1}`
                      : ""}
                  </Index.Link>{" "}
                  <Index.Link
                    to={`tel:+91${settingsState?.contactNumber2}`}
                    className="footer-contact-link"
                  >
                    {settingsState?.contactNumber2
                      ? `+91 ${settingsState?.contactNumber2}`
                      : ""}
                  </Index.Link>
                </Index.Typography>
              </Index.Box>
              <Index.Box className="footer-contact">
                <Index.Typography
                  variant="span"
                  component="span"
                  className="footer-contact-icon"
                >
                  <Index.MailIcon />
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="footer-contact-content"
                >
                  <Index.Link
                    to={`${settingsState?.email}`}
                    className="footer-contact-link"
                  >
                    {settingsState?.email}
                  </Index.Link>
                </Index.Typography>
              </Index.Box>
              <Index.Box className="footer-social">
                <Index.Link
                  to={`${settingsState?.facebookUrl}`}
                  target="_blank"
                  className="footer-social-link btn btn-primary"
                >
                  <Index.FacebookIcon />
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="text-hide"
                  >
                    Facebook
                  </Index.Typography>
                </Index.Link>
                <Index.Link
                  to={`${settingsState?.twitterUrl}`}
                  target="_blank"
                  className="footer-social-link btn btn-primary"
                >
                  <Index.TwitterIcon />
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="text-hide"
                  >
                    Twitter
                  </Index.Typography>
                </Index.Link>
                <Index.Link
                  to={`${settingsState?.instagramUrl}`}
                  target="_blank"
                  className="footer-social-link btn btn-primary"
                >
                  <Index.InstagramIcon />
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="text-hide"
                  >
                    Instagram
                  </Index.Typography>
                </Index.Link>
                <Index.Link
                  to={`${settingsState?.youtubeUrl}`}
                  target="_blank"
                  className="footer-social-link btn btn-primary"
                >
                  <Index.YouTubeIcon />
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="text-hide"
                  >
                    Youtube
                  </Index.Typography>
                </Index.Link>
                <Index.Link
                  to={`${settingsState?.linkedInUrl}`}
                  target="_blank"
                  className="footer-social-link btn btn-primary"
                >
                  <Index.LinkedInIcon />
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="text-hide"
                  >
                    LinkedIn
                  </Index.Typography>
                </Index.Link>
              </Index.Box>
            </Index.Box>
            {footerMenu.map((item, key) => (
              <Index.Box key={key} className="footer-menu-col">
                <Index.Box className="footer-menu-title">
                  {item.title}
                </Index.Box>
                <ul
                  // className={`${item.children.length > 7 ? "footer-grid" : "footer-menu"
                  //   }`}
                  className="footer-menu"
                >
                  {item.children.map((res, key) =>
                    res !== false ? (
                      <li key={key}>
                        {res.url ? (
                          <Index.Link
                            className="footer-nav-link"
                            to={res.url}
                            target="_blank"
                          >
                            {res.link}
                          </Index.Link>
                        ) : res.modal ? (
                          <Index.Typography
                            variant="span"
                            component="span"
                            onClick={res.modal}
                            className="footer-nav-link"
                          >
                            {res.link}
                          </Index.Typography>
                        ) : (
                          <Index.Typography
                            variant="span"
                            component="span"
                            className="footer-nav"
                          >
                            {res.link}
                          </Index.Typography>
                        )}
                      </li>
                    ) : (
                      <></>
                    )
                  )}
                </ul>
              </Index.Box>
            ))}
          </Index.Box>
          <Index.Box
            className="footer-desc-wrap"
            dangerouslySetInnerHTML={{ __html: cmsText }}
          />
        </Index.Box>
      </Index.Box>
      <Index.Box className="bottom-footer">
        <Index.Box className="cus-container">
          <Index.Box className="bottom-footer-box">
            <Index.Typography
              variant="p"
              component="p"
              className="copyright-text"
            >
               © {new Date().getFullYear()} All rights reserved
            </Index.Typography>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      <PagesIndex.FranchiseModal
        open={openFranchise}
        onClose={handleCloseFranchise}
      />
      <PagesIndex.BrandInfluencersModal
        open={openBrandInfluencers}
        onClose={handleCloseBrandInfluencers}
      />
      <PagesIndex.GroupBookingModal
        open={openGroupBooking}
        onClose={handleCloseGroupBooking}
      />
      {openFeedback && (
        <PagesIndex.FeedbackModal
          open={openFeedback}
          onClose={handleCloseFeedback}
        />
      )}
      <PagesIndex.ReportIssueModal
        open={openReportIssueModal}
        onClose={handleCloseReportIssue}
      />
    </Index.Box>
  );
}

export default Footer;
