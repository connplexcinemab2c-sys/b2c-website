import React from "react";
import Index from "../../../Index";
import "./CouponManagement.css";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

const ViewCoupon = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewData = location?.state?.row;
  



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
                View Coupon
              </Index.Typography>
            </Index.Box>
            {/* <Index.Box>
              <Index.Box className="common-button blue-button res-blue-button">
                <Index.Button
                  variant="contained"
                  className="no-text-decoration"
                >
                  Advance Settings
                </Index.Button>
              </Index.Box>
            </Index.Box> */}
          </Index.Box>
        </Index.Box>

        <Index.Box className="add-coupon-details">
          <Index.Box className="blog-add-box">
            <Index.Grid container spacing={1}>
              <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                <Index.Box className="advanced-sm-flex">
                  <Index.Box className="advance-flex-checkbox">
                    <Index.Checkbox
                      checked={viewData?.couponFor.includes("website")}
                      className="view-coupon"
                    />
                    <Index.Typography className="title-checkbox-coupon">
                      Website
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="advance-flex-checkbox">
                    <Index.Checkbox
                      checked={viewData?.couponFor.includes("app")}
                      className="view-coupon"
                    />
                    <Index.Typography className="title-checkbox-coupon">
                      App
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Coupon Category
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.couponCategory}
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
                    Type of Coupon
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.couponType}
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
                    Coupon code title
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.couponTitle}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Coupon code (per user)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.couponUsage}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount Type
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.discountType}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount
                  </Index.FormHelperText>
                  <Index.Box className="form-group background-increase">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.discount}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={3} md={6} sm={4} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount Upto
                  </Index.FormHelperText>
                  <Index.Box className="form-group background-increase">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.couponUpTo}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              {/* <Index.Grid item lg={4} md={4} sm={12} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Discount
                  </Index.FormHelperText>
                  <Index.Box className="form-group background-increase">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control"
                      value={viewData?.discount}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> */}
              <Index.Grid item lg={4} md={4} sm={4} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Start Date
                  </Index.FormHelperText>
                  <Index.Box className="form-group date-picker">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={moment(viewData.couponStartDate).format(
                        "DD/MM/YYYY"
                      )}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={4} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    End Date
                  </Index.FormHelperText>
                  <Index.Box className="form-group date-picker">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={moment(viewData.couponEndDate).format(
                        "DD/MM/YYYY"
                      )}
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
                    Over all Coupon code usage
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.couponCodeOverAllUsage}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid> 
              {viewData?.couponType!=="Ecommerce" && 
              (
                <>
                 <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Movie Language
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.movieLanguage}
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
                    Area/City
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.cityId?.map((city) => city.region)}
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
                    Cinema (theater)
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      id="fullWidth"
                      name="title"
                      className="form-control cursor-change"
                      value={viewData?.cinemaObjectId?.map(
                        (cinema) => cinema.cinemaName
                      )}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid></>
              )
              }
             

              <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Coupon code description
                  </Index.FormHelperText>
                  <Index.Box className="form-group d-flex-textarea">
                    <Index.TextareaAutosize
                      fullWidth
                      className="form-control form-text-area view-coupon"
                      minRows={3}
                      name="about"
                      value={viewData?.couponDescription}
                      readOnly
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <Index.Box className="barge-common-box cms-box">
        {viewData.couponCategory !== "Private" ? (
          <Index.Box className="title-header">
            <Index.Box
              className="res-title-header-flex add-coupon-flex"
              sx={{ marginBottom: "20px" }}
            >
              <Index.Box className="title-main">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  Advance Settings
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        ) : (
          <></>
        )}

        <Index.Box className="advance-setting-box-details">
          {viewData.couponCategory !== "Private" ? (
            <Index.Box className="advance-setting-box">
              <Index.Box className="advance-flex-checkbox">
                <Index.Checkbox
                  checked={
                    viewData?.advancedSettings?.mergeWithAnotherCoupon === 1
                  }
                  className="view-coupon"
                />
                <Index.Typography className="title-checkbox-coupon">
                  Can Merge with Another Coupon
                </Index.Typography>
              </Index.Box>
              <Index.Box className="advance-flex-checkbox">
                <Index.Checkbox
                  checked={
                    viewData?.advancedSettings?.autoApplyOnCheckOut === 1
                  }
                  className="view-coupon"
                />
                <Index.Typography className="title-checkbox-coupon">
                  Auto Apply on Check Out Page
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          ) : (
            <></>
          )}

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
    </>
  );
};

export default ViewCoupon;
