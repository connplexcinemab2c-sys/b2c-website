import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CinemaSelectionModal from "../../../../components/common/CinemaSelectionModal";

function WelcomeGift() {
  const [welcomeGifts, setwelcomeGifts] = useState([]);
  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);
  const dispatch = PagesIndex.useDispatch();
  const [openCinemaSelection, setOpenCinemaSelection] = useState(false);
  const [selectedWelcomeGift, setSelectedWelcomeGift] = useState(null);
  const handleCinemaSelectionOpen = (welcomeGift) => {
    setOpenCinemaSelection(true);
    setSelectedWelcomeGift(welcomeGift);
  };
  const handleCinemaSelectionClose = () => {
    setOpenCinemaSelection(false);
    setSelectedWelcomeGift(null);
  };

  const getWelcomeGifts = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_WELCOME_GIFTS, "", userToken)
      .then((res) => {
        if (res?.status === 200) {
          setwelcomeGifts(res?.data);
        }
      })
      .catch((error) => {
        PagesIndex.toast.error("Failed to load welcome gift");
      })
      .finally(() => {
        dispatch(PagesIndex.hideLoader());
      });
  };

  useEffect(() => {
    getWelcomeGifts();
  }, [userToken]);

  return (
    <>
      <Index.Box className="account-tab-booking-main welcome-gift-main">
        <Index.Box className="account-tab-heading-box">
          <Index.Box className="flex-align-member-search">
            <Index.Typography component="span" className="account-tab-heading">
              Welcome Gifts
            </Index.Typography>
          </Index.Box>
        </Index.Box>
        <Index.Box className="main-membership">
          {!welcomeGifts?.length ? (
            <Index.Box className="cus-container">
              <Index.Box className="membership-header">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="membership-header-subtitle"
                >
                  No welcome gifts available
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          ) : (
            <Index.Box className="cus-container">
              {/* <Index.Box className="membership-header">
                <Index.Typography
                  variant="h1"
                  component="h1"
                  className="membership-header-title"
                >
                  You will receive a welcome gift
                </Index.Typography>
                <Index.Typography
                  variant="p"
                  component="p"
                  className="membership-header-subtitle"
                >
                  Welcome gift can be collected from your nearest cinema
                </Index.Typography>
              </Index.Box> */}
              {welcomeGifts.length > 0 && (
                <Index.Box className="membership-body">
                  <Index.Box className="membership-item-box">
                    {welcomeGifts?.map((item, key) => (
                      <Index.Box
                        key={key}
                        className={`membership-item welcome-gift-card ${
                          PagesIndex.moment().isAfter(
                            PagesIndex.moment(item?.collectBeforeDate)
                          )
                            ? "expired-welcome-gift"
                            : ""
                        }`}
                      >
                        {/* <Index.Typography className="membership-title"></Index.Typography> */}
                        <Index.Box className="welcome-gift-card-header">
                          {item?.status?.toLowerCase() === "received" ? (
                            <Index.Typography className="small-member-text">
                              Gift Received
                            </Index.Typography>
                          ) : PagesIndex.moment().isAfter(
                              PagesIndex.moment(item?.collectBeforeDate)
                            ) ? (
                            <Index.Typography className="small-member-text">
                              Collection date has passed. You are no longer
                              eligible for the welcome gift.
                            </Index.Typography>
                          ) : (
                            <>
                              <Index.Typography className="received-title small-member-text">
                                You will receive a welcome gift
                              </Index.Typography>
                              <Index.Typography className="received-sub-title small-member-text">
                                Welcome gift can be collected from your nearest
                                cinema
                              </Index.Typography>
                            </>
                          )}
                        </Index.Box>
                        <Index.Box className="button-inner-memberlist">
                          <Index.Box className="">
                            <Index.Box className="membership-content-box">
                              <Index.Typography
                                //   className="membership-content disable"
                                className="membership-content active"
                              >
                                {/* <Index.CheckIcon /> */}
                                <Index.Box className="membership-content-box">
                                  {PagesIndex.moment().isAfter(
                                    PagesIndex.moment(item?.collectBeforeDate)
                                  ) ? (
                                    <>
                                      Expired At:{" "}
                                      {PagesIndex.moment(
                                        item?.collectBeforeDate
                                      ).format("DD MMM YYYY")}
                                    </>
                                  ) : (
                                    <>
                                      Issue Date:{" "}
                                      {PagesIndex.moment(
                                        item?.issueDate
                                      ).format("DD MMM YYYY")}
                                    </>
                                  )}
                                </Index.Box>
                              </Index.Typography>
                            </Index.Box>
                            {PagesIndex.moment().isAfter(
                              PagesIndex.moment(item?.collectBeforeDate)
                            ) ? (
                              ""
                            ) : (
                              <Index.Box className="membership-content-box">
                                <Index.Typography className="membership-content active">
                                  {/* <Index.CheckIcon /> */}
                                  <Index.Box className="membership-content-box">
                                    Collect Before Date:{" "}
                                    {PagesIndex.moment(
                                      item?.collectBeforeDate
                                    ).format("DD MMM YYYY")}
                                  </Index.Box>
                                </Index.Typography>
                              </Index.Box>
                            )}
                            <Index.Box className="membership-btn-box">
                              <PagesIndex.Button
                                secondary
                                className="membership-btn welcome-gift-btn"
                                onClick={() => handleCinemaSelectionOpen(item)}
                                disabled={
                                  item?.status?.toLowerCase() === "received" ||
                                  PagesIndex.moment().isAfter(
                                    PagesIndex.moment(item?.collectBeforeDate)
                                  )
                                }
                              >
                                {item?.status?.toLowerCase() === "received"
                                  ? "Gift Received"
                                  : "Mark as Received"}
                              </PagesIndex.Button>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    ))}
                  </Index.Box>
                </Index.Box>
              )}
            </Index.Box>
          )}
        </Index.Box>
      </Index.Box>
      <CinemaSelectionModal
        open={openCinemaSelection}
        handleClose={handleCinemaSelectionClose}
        selectedWelcomeGift={selectedWelcomeGift}
        fetchData={getWelcomeGifts}
      />
    </>
  );
}

export default WelcomeGift;
