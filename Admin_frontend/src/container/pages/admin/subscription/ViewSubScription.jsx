import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Index from "../../../Index";
import { useFormik } from "formik";
import SubscriptionActivityLog from "./SubscriptionActivityLog";

const membershipDurationConstant = {
  30: "1 Month",
  90: "3 Month",
  365: "1 Year",
};
const ViewSubScription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewData = location?.state?.row;
  console.log("viewData", viewData);

  const index = location?.state?.index + 1;
const isShowLog = location?.state?.isShowLog;
  return (
    <>
      <Index.Box
        className="barge-common-box cms-box"
        sx={{ marginBottom: "15px" }}
      >
        <Index.Box className="title-header">
          <Index.Box className="res-title-header-flex add-coupon-flex">
            <Index.Box className="title-main">
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                <span className="cursor" onClick={() => navigate(-1)}>
                  Subscription
                </span>{" "}
                / View Subscription / {index}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="add-coupon-details">
          <Index.Box className="blog-add-box">
            <Index.Grid container spacing={1}>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Title
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      name="price"
                      className="form-control"
                      value={viewData.title}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Price
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      name="price"
                      className="form-control"
                      value={viewData.price}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discounted Price
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="discountedPrice"
                      name="discountedPrice"
                      className="form-control"
                      value={viewData.discountedPrice}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount of F & B (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData.discountOfFAndB}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount on Tickets (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.discountOnTicket}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount on Ecommerce (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="discountOnEcommerce"
                      className="form-control"
                      value={viewData.discountOnEcommerce}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

              {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount of F & B Up to(%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData.discountOfFAndBUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> */}
              {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount on Tickets Up to(%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData.discountOnTicketUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> */}
              {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount on Ecommerce Up to(%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData.discountOnEcommerceUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> */}

              {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Free Tickets (Month)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.freeTicket}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> */}
              {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Priority Booking
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      name="price"
                      className="form-control"
                      placeholder="Enter Priority Booking"
                      value={viewData.priorityBooking}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Access to Exclusive Screenings
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      name="price"
                      className="form-control"
                      value={viewData.accessToExclusiveScreening}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Guest Passes (per Quarter)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.guestPasses}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Special event access
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.specialEventAccess}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Early access to tickets
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.earlyAccessToTickets}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Support
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.support}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> */}

              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount of F & B Upto (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData?.discountOfFAndBUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount on Tickets Upto (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData?.discountOnTicketUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount on Ecommerce Upto (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="title"
                      className="form-control"
                      value={viewData?.discountOnEcommerceUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Coins (%)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.coins}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Welcome Gift
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      name="price"
                      className="form-control"
                      value={viewData.welcomeGift}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Monthly Access
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={viewData.monthlyAccess}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Subscription Duration
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="price"
                      className="form-control"
                      value={
                        membershipDurationConstant?.[
                          viewData?.membershipDuration
                        ] || ""
                      }
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
          <Index.Box className="flex-advance-settings-btn">
            <Index.Box className="common-button blue-button res-blue-button">
              <Index.Button
                variant="contained"
                className="no-text-decoration"
                onClick={() => navigate(-1)}
              >
                Back
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      {isShowLog && (
       <SubscriptionActivityLog title={viewData.title}/>
      )}
    </>
  );
};

export default ViewSubScription;
