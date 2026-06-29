import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

export default function ReviewTabContent({ details }) {
  return (
    <Index.Box className="cus-container">
      <Index.Box className="review-tab-content">
        {details?.rateAndReviews ?
          <Index.Box className="review-content-main">
            {details?.rateAndReviews?.map((data) => {
              return (
                <Index.Box className="review-content-inner-main">
                  <Index.Box className="review-user-flex">
                    <Index.Box className="review-user-profile-flex">
                      <img
                        src={
                          data?.userId?.profile
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.userId?.profile}`
                            : PagesIndex.Png.profile_img
                        }
                        className="review-user-img"
                        alt="user-img"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = PagesIndex.Png.profile_img;
                        }}
                      />
                      <Index.Typography className="review-user-name">
                        {data?.userId?.firstName
                          ? `${data?.userId?.firstName} ${data?.userId?.lastName}`
                          : "User"}
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="review-star-flex">
                      <Index.StarIcon className="review-star-fill" />
                      <Index.Typography className="review-total-text-main">
                        {data?.movieRate}/5
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                  <Index.Typography className="review-para">
                    {data?.movieReview}
                  </Index.Typography>
                  <Index.Typography className="review-date-text">
                    {PagesIndex.moment().diff(
                      PagesIndex.moment(data?.createdAt),
                      "hours"
                    ) < 24
                      ? `${PagesIndex.moment().diff(
                        PagesIndex.moment(data?.createdAt),
                        "hours"
                      )} Hours
                              ago`
                      : `${PagesIndex.moment().diff(
                        PagesIndex.moment(data?.createdAt),
                        "days"
                      )} Days
                              ago`}
                  </Index.Typography>
                </Index.Box>
              );
            })}
          </Index.Box>
          :
          <Index.Box className="no-found-img-box">
            <img src={PagesIndex.Png.PositiveReview} alt="No Found" />
            No Review Available
          </Index.Box>
        }
      </Index.Box>
    </Index.Box>
  );
}
