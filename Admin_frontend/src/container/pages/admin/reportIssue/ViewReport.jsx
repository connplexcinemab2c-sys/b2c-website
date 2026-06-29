import React, { useDebugValue, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGES_API_ENDPOINT } from "../../../../config/DataService";

const ViewReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location?.state?.row;
  const [cinemaList, setCinemaList] = useState([]);

  const getCinemaName = (id) => {
    const data = cinemaList?.find((data) => data._id == id);
    return data ? data?.cinemaName : "";
  };

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    getCinemaList();
  }, []);

  return (
    <>
      <Index.Box className="barge-common-box cms-box">
        <Index.Box className="title-header">
          <Index.Box className="res-title-header-flex">
            <Index.Box className="title-main">
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                View Issue
              </Index.Typography>
            </Index.Box>

            <Index.Box className="blog-add-box">
              <Index.Grid container spacing={2}>
                <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Report Image :
                    </Index.FormHelperText>
                    <Index.Box className="flex-upload-report">
                      {viewData?.attachImage.length ? (
                        viewData?.attachImage?.map((file) => (
                          <Index.Box className="file-upload-btn-main">
                            <Index.Button
                              variant="contained"
                              component="label"
                              className="file-upload-btn"
                            >
                              <img
                                src={`${IMAGES_API_ENDPOINT}/${file}`}
                                className="upload-profile-img report-view-img"
                                alt=""
                              />
                            </Index.Button>
                          </Index.Box>
                        ))
                      ) : (
                        <Index.Box className="file-upload-btn-main">
                          <Index.Button
                            variant="contained"
                            component="label"
                            className="file-upload-btn"
                          >
                            <img
                              src={PagesIndex.Png.NoImageAvailable}
                              className="upload-profile-img report-view-img"
                              alt=""
                            />
                          </Index.Button>
                        </Index.Box>
                      )}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Name :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {viewData?.name || "-"}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Email :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {viewData?.email || "-"}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Cinema Name :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {getCinemaName(viewData?.cinemaObjectId)}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Transaction Type :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {viewData?.transaction_type}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Date :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {viewData?.date
                              ? PagesIndex.moment(viewData?.date).format("DD/MM/YYYY")
                              : "-"}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Created At :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {viewData?.createdAt
                              ? PagesIndex.moment(viewData?.createdAt).format("DD/MM/YYYY")
                              : "-"}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                  <Index.Box className="input-box modal-input-box add-blog-ck-hgt report-desc-hgt">
                    <Index.FormHelperText className="form-lable">
                      Description :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group ck-content">
                      {viewData?.description}
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
    </>
  );
};

export default ViewReport;
