import { Route, Routes } from "react-router-dom";
import Home from "../container/pages/user/home/Home";
import About from "../container/pages/user/about/About";
import Contact from "../container/pages/user/contact/Contact";
import MovieDetail from "../container/pages/user/movieDetail/MovieDetail";
import SeatManagement from "../container/pages/user/seatManagement/SeatManagement";
import AddSnacks from "../container/pages/user/addSnacks/AddSnacks";
import Gallery from "../container/pages/user/gallery/Gallery";
import Account from "../container/pages/user/account/Account";
import Cinema from "../container/pages/user/cinema/Cinema";
import Calender from "../container/pages/user/calender/Calender";
import Ecommerce from "../container/pages/user/ecommerce/Ecommerce";
import Layout from "../components/user/defaultLayout/Layout";
import PrivacyPolicy from "../container/pages/user/privacyPolicy/PrivacyPolicy";
import TermsConition from "../container/pages/user/termsCondition/TermsCondition";
import Membership from "../container/pages/user/membership/Membership";
import TransactionFailed from "../container/pages/user/transactionFailed/TransactionFailed";
import GallaryImages from "../container/pages/user/gallery/gallaryImages/GallaryImages";
import PageNotFound from "../container/pages/user/pageNotFound/PageNotFound";
import ConfirmationScreen from "../container/pages/user/confirmationScreen/ConfirmationScreen";
import BookingInfo from "../container/pages/user/bookingInfo/BookingInfo";
import Faq from "../container/pages/user/faq/Faq";
import Franchise from "../container/pages/user/franchise/Franchise";
import CinemaInner from "../container/pages/user/cinema/cinemaInner/CinemaInner";
import BookingHistory from "../container/pages/user/bookingHistory/BookingHistory";
import LegalNotice from "../container/pages/user/legalNotice/LegalNotice";
import Advertise from "../container/pages/user/advertise/Advertise";
import Career from "../container/pages/user/career/Career";
import MyTicket from "../container/pages/user/myTicket/MyTicket";
import DownloadTicket from "../container/pages/user/myTicket/DownloadTicket";
import Blog from "../container/pages/user/blog/Blog";
import BlogDetails from "../container/pages/user/blog/BlogDetails";
import RefundPolicy from "../container/pages/user/refundPolicy/RefundPolicy";
import MembershipConfirmationScreen from "../container/pages/user/membership/MembershipConfirmationScreen";
import MembershipFailed from "../container/pages/user/membership/MembershipFailed";

// start investors pages
import InvestorSection from "../container/pages/user/investorSection/InvestorSection";
import InvestorLayout from "../container/pages/user/investorSection/InvestorLayout";
import BoardMeeting from "../container/pages/user/investorSection/Announcements/BoardMeeting";
import AnnualReport from "../container/pages/user/investorSection/AnnualReport";
import AnnualReturns from "../container/pages/user/investorSection/AnnualReturns";
import BoardOfDirectors from "../container/pages/user/investorSection/BoardOfDirectors";
import POSH from "../container/pages/user/investorSection/Committees/POSH";
import VariousCommiteeForBoard from "../container/pages/user/investorSection/Committees/VariousCommiteeForBoard";
import FinancialResults from "../container/pages/user/investorSection/FinancialResults";
import Greviances from "../container/pages/user/investorSection/Committees/Greviances";
import Announcements from "../container/pages/user/investorSection/Announcements/Announcements";
import GeneralMeeting from "../container/pages/user/investorSection/Announcements/GeneralMeeting";
import Compliances from "../container/pages/user/investorSection/Announcements/Compliances";
import OtherAnnouncements from "../container/pages/user/investorSection/Announcements/OtherAnnouncements";
import ShareholdingPatterns from "../container/pages/user/investorSection/ShareholdingPatterns";
import InvestorGrievances from "../container/pages/user/investorSection/InvestorGrievances";
import Disclosure from "../container/pages/user/investorSection/Disclosure";
import Meetings from "../container/pages/user/investorSection/Meetings";
import PRMedia from "../container/pages/user/investorSection/PRMedia";
import InitialPublicOffer from "../container/pages/user/investorSection/InitialPublicOffer";
import Policies from "../container/pages/user/investorSection/Policies";
import Committees from "../container/pages/user/investorSection/Committees/Committees";
import DraftRedHerringProspectus from "../container/pages/user/investorSection/InitialPublicOffer/DraftRedHerringProspectus";
import VigilMechanismPolicy from "../container/pages/user/investorSection/Policies/VigilMechanismPolicy";
import PolicyOnRelatedPartyTransaction from "../container/pages/user/investorSection/Policies/PolicyOnRelatedPartyTransaction";
import PolicyForDeterminationOfMateriality from "../container/pages/user/investorSection/Policies/PolicyForDeterminationOfMateriality";
import PoliciesOnPaymentsToNonExecutiveDirectors from "../container/pages/user/investorSection/Policies/PoliciesOnPaymentsToNonExecutiveDirectors";
import NRCPolicy from "../container/pages/user/investorSection/Policies/NRCPolicy";
import FamilarisationProgramme from "../container/pages/user/investorSection/Policies/FamilarisationProgramme";
import DividendDistributionPolicy from "../container/pages/user/investorSection/Policies/DividendDistributionPolicy";
import CSRPolicy from "../container/pages/user/investorSection/Policies/CSRPolicy";
import CodeOfPracticesAndProcedures from "../container/pages/user/investorSection/Policies/CodeOfPracticesAndProcedures";
import COCForDirKMP from "../container/pages/user/investorSection/Policies/COCForDirKMP";
import AbridgedProspectus from "../container/pages/user/investorSection/InitialPublicOffer/AbridgedProspectus";
import BasisOfAllotmentAdvertisement from "../container/pages/user/investorSection/InitialPublicOffer/BasisOfAllotmentAdvertisement";
import GID from "../container/pages/user/investorSection/InitialPublicOffer/GID";
import IPOApplicationForm from "../container/pages/user/investorSection/InitialPublicOffer/IPOApplicationForm";
import MaterialContractsToTheIssue from "../container/pages/user/investorSection/InitialPublicOffer/MaterialContractsToTheIssue";
import MaterialDocuments from "../container/pages/user/investorSection/InitialPublicOffer/MaterialDocuments";
import PreIssueAdvertisement from "../container/pages/user/investorSection/InitialPublicOffer/PreIssueAdvertisement";
import Prospectus from "../container/pages/user/investorSection/InitialPublicOffer/Prospectus";
import RedHerringProspectus from "../container/pages/user/investorSection/InitialPublicOffer/RedHerringProspectus";
import POSHPolicy from "../container/pages/user/investorSection/Policies/POSHPolicy";
import DynamicPDFPage from "../container/pages/user/investorSection/Policies/DynamicPDFPage";
import MembershipTermsAndCondition from "../container/pages/user/membership/MembershipTermsAndCondition";
// import Coupon from "../container/pages/user/coupon/Coupon";

function Routers() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog-details" element={<BlogDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/movie-details" element={<MovieDetail />} />
        <Route path="/seat-management" element={<SeatManagement />} />
        <Route path="/add-snacks" element={<AddSnacks />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:id" element={<GallaryImages />} />
        <Route path="/account" element={<Account />} />
        <Route path="/cinema" element={<Cinema />} />
        <Route path="/cinema-detail" element={<CinemaInner />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/ecommerce" element={<Ecommerce />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms-conditions" element={<TermsConition />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/investors" element={<InvestorSection />} />
        <Route path="/franchise" element={<Franchise />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/membership-terms-condition" element={<MembershipTermsAndCondition />} />
        <Route path="/confirmation-screen" element={<ConfirmationScreen />} />
        <Route path="/my-booked-ticket" element={<ConfirmationScreen />} />
        <Route path="/booking-info/:transId" element={<BookingInfo />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route
          path="/membership-success"
          element={<MembershipConfirmationScreen />}
        />

        <Route path="/career" element={<Career />} />
      </Route>
      <Route path="/membership-failed" element={<MembershipFailed />} />
      <Route path="/transaction-failed" element={<TransactionFailed />} />
      {/* webView path */}
      <Route path="/app-booking-history" element={<BookingHistory />} />
      <Route path="/app-confirmation-screen" element={<ConfirmationScreen />} />
      <Route path="/app-transaction-failed" element={<TransactionFailed />} />
      <Route path="/app-privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/app-refund-policy" element={<RefundPolicy />} />
      <Route path="/app-terms-conditions" element={<TermsConition />} />
      <Route path="/app-legal-notice" element={<LegalNotice />} />
      <Route path="/app-about" element={<About />} />
      <Route path="/app-faq" element={<Faq />} />
      {/* End */}
      {/* <Route path="/coupon" element={<Coupon />} /> */}
      <Route path="/my-ticket" element={<MyTicket />} />
      <Route path="/download-ticket" element={<DownloadTicket />} />
      <Route path="*" element={<PageNotFound />} />
      <Route path="/investors/" element={<InvestorLayout />}>
        <Route path=":pageSlug" element={<DynamicPDFPage />} />
        {/* <Route path="/investors/" element={<Announcements />} /> */}
        <Route path="board-meeting" element={<BoardMeeting />} />
        <Route path="compliances" element={<Compliances />} />
        <Route path="annual-report" element={<AnnualReport />} />
        <Route path="annual-returns" element={<AnnualReturns />} />
        <Route path="board-of-directors" element={<BoardOfDirectors />} />
        <Route path="posh-committee" element={<POSH />} />
        <Route path="other-announcements" element={<OtherAnnouncements />} />
        <Route path="financial-results" element={<FinancialResults />} />
        <Route path="general-meeting" element={<GeneralMeeting />} />
        <Route
          path="various-commitee-for-board"
          element={<VariousCommiteeForBoard />}
        />
        <Route path="initial-public-offer" element={<InitialPublicOffer />} />
        <Route path="policies" element={<Policies />} />
        <Route
          path="shareholding-patterns"
          element={<ShareholdingPatterns />}
        />
        <Route path="investor-grievances" element={<InvestorGrievances />} />
        <Route path="greviances" element={<Greviances />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="disclosure" element={<Disclosure />} />
        <Route path="pr-media" element={<PRMedia />} />
        <Route path="committees" element={<Committees />} />
        <Route
          path="draft-red-herring-prospectus"
          element={<DraftRedHerringProspectus />}
        />
        <Route
          path="vigil-mechanism-policy"
          element={<VigilMechanismPolicy />}
        />
        <Route
          path="policy-on-related-party-transaction"
          element={<PolicyOnRelatedPartyTransaction />}
        />
        <Route
          path="policy-for-determination-of-materiality"
          element={<PolicyForDeterminationOfMateriality />}
        />
        <Route
          path="policies-on-payments-to-non-executive-directors"
          element={<PoliciesOnPaymentsToNonExecutiveDirectors />}
        />
        <Route path="nrc-policy" element={<NRCPolicy />} />
        <Route
          path="familarisation-programme"
          element={<FamilarisationProgramme />}
        />
        <Route
          path="dividend-distribution-policy"
          element={<DividendDistributionPolicy />}
        />
        <Route path="csr-policy" element={<CSRPolicy />} />
        <Route
          path="code-of-practices-and-procedures"
          element={<CodeOfPracticesAndProcedures />}
        />
        <Route path="coc-for-dir-kmp" element={<COCForDirKMP />} />
        <Route path="abridged-prospectus" element={<AbridgedProspectus />} />
        <Route
          path="basis-of-allotment-advertisement"
          element={<BasisOfAllotmentAdvertisement />}
        />
        <Route path="gid" element={<GID />} />
        <Route path="ipo-application-form" element={<IPOApplicationForm />} />
        <Route
          path="material-contracts-to-the-issue"
          element={<MaterialContractsToTheIssue />}
        />
        <Route path="material-documents" element={<MaterialDocuments />} />
        <Route
          path="pre-issue-advertisement"
          element={<PreIssueAdvertisement />}
        />
        <Route path="prospectus" element={<Prospectus />} />
        <Route
          path="red-herring-prospectus"
          element={<RedHerringProspectus />}
        />
        <Route path="posh-policy" element={<POSHPolicy />} />
      </Route>
    </Routes>
  );
}

export default Routers;
