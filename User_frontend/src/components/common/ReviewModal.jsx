import React from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";
import { useState } from "react";

const movieRatingLabels = {
  0.5: <Index.SentimentVeryDissatisfiedIcon color="error" />,
  1: <Index.SentimentVeryDissatisfiedIcon color="error" />,
  1.5: <Index.SentimentDissatisfiedIcon color="error" />,
  2: <Index.SentimentDissatisfiedIcon color="error" />,
  2.5: <Index.SentimentSatisfiedIcon color="warning" />,
  3: <Index.SentimentSatisfiedIcon color="warning" />,
  3.5: <Index.SentimentSatisfiedAltIcon color="success" />,
  4: <Index.SentimentSatisfiedAltIcon color="success" />,
  4.5: <Index.SentimentVerySatisfiedIcon color="success" />,
  5: <Index.SentimentVerySatisfiedIcon color="success" />,
};

function getMovieRatingText(movieRating) {
  return `${movieRating} Star${movieRating !== 1 ? "s" : ""}, ${
    movieRatingLabels[movieRating]
  }`;
}

const connplexRatingLabels = {
  0.5: <Index.SentimentVeryDissatisfiedIcon color="error" />,
  1: <Index.SentimentVeryDissatisfiedIcon color="error" />,
  1.5: <Index.SentimentDissatisfiedIcon color="error" />,
  2: <Index.SentimentDissatisfiedIcon color="error" />,
  2.5: <Index.SentimentSatisfiedIcon color="warning" />,
  3: <Index.SentimentSatisfiedIcon color="warning" />,
  3.5: <Index.SentimentSatisfiedAltIcon color="success" />,
  4: <Index.SentimentSatisfiedAltIcon color="success" />,
  4.5: <Index.SentimentVerySatisfiedIcon color="success" />,
  5: <Index.SentimentVerySatisfiedIcon color="success" />,
};

function getConnplexRatingText(connplexRating) {
  return `${connplexRating} Star${connplexRating !== 1 ? "s" : ""}, ${
    connplexRatingLabels[connplexRating]
  }`;
}

export default function ReviewModal({
  open,
  onClose,
  movieDetail,
  getMovieDetail,
}) {
  const initialValues = {
    movieRating: "0",
    movieRatingHover: "-1",
    connplexRating: "0",
    connplexRatingHover: "-1",
    movieReview: "",
  };
  const dispatch = PagesIndex.useDispatch();
  const location = PagesIndex.useLocation();
  const { userDetails, userToken } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const movieId = new URLSearchParams(location.search).get("mId");

  function submitRateAndReview(values, { setSubmitting }) {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("movieRate", values?.movieRating);
    urlEncoded.append("connplexRate", values?.connplexRating);
    urlEncoded.append("movieReview", values?.movieReview);
    urlEncoded.append("movieId", movieId);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.ADD_RATE_REVIEW,
      urlEncoded,
      userToken
    ).then((res) => {
      if (res?.status === 201) {
        PagesIndex.toast.success(res.message);
        getMovieDetail();
        onClose();
      }
      setSubmitting(false);
      dispatch(PagesIndex.hideLoader());
    });
  }
  return (
    <Index.Modal
      open={open}
      onClose={onClose}
      className="review-modal common-modal"
    >
      <Index.Box className="review-modal-inner common-modal-inner">
        <Index.Box className="modal-inner cus-scrollbar">
          <Index.Typography
            variant="p"
            component="p"
            className="review-modal-title common-modal-title"
          >
            Add Your Review
          </Index.Typography>
          <PagesIndex.Formik
            enableReinitialize
            onSubmit={submitRateAndReview}
            initialValues={initialValues}
            validationSchema={PagesIndex.rateAndReview}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <Index.Stack
                className="form-control"
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
              >
                <Index.Box className="review-modal-wrapper">
                  <Index.Box className="movie-review-box">
                    <Index.Box className="movie-review-title">
                      {/* {movieDetail?.name} ({movieDetail?.languages}) */}
                      {movieDetail?.name}
                    </Index.Box>
                    <Index.Box className="" mb={1}>
                      <Index.Box className="review-star-box">
                        <Index.Rating
                          className="review-star-item"
                          name="hover-feedback"
                          value={values?.movieRating}
                          precision={0.5}
                          getLabelText={getMovieRatingText}
                          onChange={(event, newMovieRating) => {
                            // setMovieRating(newMovieRating);
                            setFieldValue("movieRating", newMovieRating);
                          }}
                          onChangeActive={(event, newMovieRatingHover) => {
                            // setMovieRatingHover(newMovieRatingHover);
                            setFieldValue(
                              "movieRatingHover",
                              newMovieRatingHover
                            );
                          }}
                          emptyIcon={
                            <Index.StarIcon
                              style={{ opacity: 0.55 }}
                              fontSize="inherit"
                            />
                          }
                        />
                        {values?.movieRating !== null && (
                          <Index.Box className="review-star-icon">
                            {
                              movieRatingLabels[
                                values?.movieRatingHover != -1
                                  ? values?.movieRatingHover
                                  : values?.movieRating
                              ]
                            }
                          </Index.Box>
                        )}
                      </Index.Box>
                      {errors.movieRating && touched.movieRating ? (
                        <Index.FormHelperText error>
                          {errors.movieRating}
                        </Index.FormHelperText>
                      ) : null}
                    </Index.Box>
                    <Index.Box className="movie-review-body">
                      <Index.TextareaAutosize
                        minRows={5}
                        placeholder="Your opinion matters"
                        name="movieReview"
                        value={values?.movieReview}
                        maxLength={250}
                        // onChange={(e) => {
                        //   handleChange(e);
                        // }}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/^\s+/, "");
                          // .replace(/\s\s+/g, " ");
                          if (newValue.length <= 250) {
                            setFieldValue("movieReview", newValue);
                          }
                        }}
                        error={
                          errors.movieReview && touched.movieReview
                            ? true
                            : false
                        }
                      />
                      {errors.movieReview && touched.movieReview ? (
                        <Index.FormHelperText error>
                          {errors.movieReview}
                        </Index.FormHelperText>
                      ) : null}
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="connplex-review-box">
                    <Index.Box className="connplex-review-title">
                      What about The CONNPLEX ?
                    </Index.Box>
                    <Index.Box className="review-star-box">
                      <Index.Rating
                        className="review-star-item"
                        name="hover-feedback"
                        value={values?.connplexRating}
                        precision={0.5}
                        getLabelText={getConnplexRatingText}
                        onChange={(event, newConnplexRating) => {
                          setFieldValue("connplexRating", newConnplexRating);
                        }}
                        onChangeActive={(event, newConnplexRatingHover) => {
                          setFieldValue(
                            "connplexRatingHover",
                            newConnplexRatingHover
                          );
                        }}
                        emptyIcon={
                          <Index.StarIcon
                            style={{ opacity: 0.55 }}
                            fontSize="inherit"
                          />
                        }
                      />

                      {values?.connplexRating !== null && (
                        <Index.Box className="review-star-icon">
                          {
                            connplexRatingLabels[
                              values?.connplexRatingHover != -1
                                ? values?.connplexRatingHover
                                : values?.connplexRating
                            ]
                          }
                        </Index.Box>
                      )}
                    </Index.Box>
                    {errors.connplexRating && touched.connplexRating ? (
                      <Index.FormHelperText error>
                        {errors.connplexRating}
                      </Index.FormHelperText>
                    ) : null}
                  </Index.Box>
                  <Index.Box className="review-action common-modal-action">
                    <PagesIndex.Button
                      primary
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Submit
                    </PagesIndex.Button>
                  </Index.Box>
                </Index.Box>
              </Index.Stack>
            )}
          </PagesIndex.Formik>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
}
