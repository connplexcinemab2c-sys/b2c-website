import React, { useDebugValue, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGES_API_ENDPOINT } from "../../../../config/DataService";
import moment from "moment";

const ViewMembershipDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location?.state?.row;



  return (
    <Index.Box className="barge-common-box cms-box">
      <Index.Box className="title-header">
        <Index.Box className="res-title-header-flex">
          <Index.Box className="title-main">
            <Index.Typography variant="p" component="p" className="page-title">
              View Membership Plan
            </Index.Typography>
          </Index.Box>
         

          <Index.Box className="blog-add-box">
            <Index.Grid container spacing={2}>
              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Title :
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.subscriptionId?.title || "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Phone Number :
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.userId?.mobileNumber || "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Email :
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.userId?.email || "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Amount :
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.subscriptionId?.price || "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Tracking Id:
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.payments[0]?.paymentResponse?.tracking_id ||
                      "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Payment Type :
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.payments[0]?.paymentResponse?.payment_mode ||
                      "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Payment Status :
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {viewData?.payments[0]?.paymentResponse?.order_status||
                      "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Start Date:
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {moment(viewData?.subscriptionStartDate).format(
                      "DD/MM/YYYY"
                    ) || "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

              <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Start Date:
                  </Index.FormHelperText>
                  <Index.Box className="form-group custom-form-group">
                    {moment(viewData?.subscriptionEndDate).format(
                      "DD/MM/YYYY"
                    ) || "-"}
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

              <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                <Index.Box className="modal-user-btn-flex mt-blog-details">
                  <Index.Box className="discard-btn-main btn-main-primary">
                    <Index.Box className="common-button blue-button res-blue-button">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => navigate(-1)}
                      >
                        Back
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
};

export default ViewMembershipDetails;
