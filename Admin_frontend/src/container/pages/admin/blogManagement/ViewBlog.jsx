import React, { useEffect, useState } from "react";
import Index from "../../../Index";

import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import PagesIndex from "../../../PagesIndex";

const ViewBlog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location?.state?.data;

  const sanitizedHtml = DOMPurify.sanitize(data?.description, {
    ALLOWED_TAGS: [
      "strong",
      "i",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "p",
      "figure",
      "a",
      "br",
    ],
    ADD_TAGS: ["blockquote", "figure", "h4"],
    ALLOWED_ATTR: ["class", "style", "src", "alt", "href"],
  });

  const tempElement = document.createElement("div");
  tempElement.innerHTML = sanitizedHtml;

  const links = tempElement.getElementsByTagName("a");
  for (let i = 0; i < links.length; i++) {
    links[i].setAttribute("target", "_blank");
  }

  const modifiedHtml = tempElement.innerHTML;
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
                View Blog
              </Index.Typography>
            </Index.Box>

            <Index.Box className="blog-add-box">
              <Index.Grid container spacing={1}>
                <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Blog Image :
                    </Index.FormHelperText>
                    <Index.Box className="file-upload-btn-main">
                      <Index.Button
                        variant="contained"
                        component="label"
                        className="file-upload-btn"
                      >
                        <img
                          src={
                            data?.imageBlog
                              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.imageBlog}`
                              : PagesIndex.Png.NoImageAvailable
                          }
                          className="upload-profile-img"
                          alt=""
                        />
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Blog Title :
                    </Index.FormHelperText>
                    <Index.Box className="form-group custom-form-group">
                      {data?.title}
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                {data.type !== "blog_background" && (
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="input-box modal-input-box add-blog-ck-hgt">
                      <Index.FormHelperText className="form-lable">
                        Blog Description :
                      </Index.FormHelperText>
                      <Index.Box
                        className="form-group custom-form-group ck-content"
                        dangerouslySetInnerHTML={{
                          __html: modifiedHtml,
                        }}
                      ></Index.Box>
                    </Index.Box>
                  </Index.Grid>
                )}

                <Index.Grid item lg={12}>
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

export default ViewBlog;
