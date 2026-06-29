import React from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";

function BannerImage({
  bannerImage,
  bannerTitle,
  bannerImageWidth,
  bannerImageHeight,
  bannerDescription,
}) {
  return (
    (bannerImage || bannerTitle) && (
      <Index.Box className="banner-image">
        {bannerImage && (
          <img
            src={bannerImage ? bannerImage : PagesIndex.Png.NoImage}
            width={bannerImageWidth}
            height={bannerImageHeight}
            alt="banner"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = PagesIndex.Png.NoImage;
            }}
          />
        )}
        {bannerTitle && (
          <Index.Box className="banner-image-content">
            <Index.Typography
              variant="h1"
              component="h1"
              className="banner-title"
            >
              {bannerTitle}
            </Index.Typography>
            {bannerDescription && (
              <Index.Typography
                variant="h1"
                component="h1"
                className="banner-description"
              >
                {bannerDescription}
              </Index.Typography>
            )}
          </Index.Box>
        )}
      </Index.Box>
    )
  );
}

export default BannerImage;
