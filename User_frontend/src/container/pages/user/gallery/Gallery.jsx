import React, { useState, useEffect } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import SEO from "../../../../components/common/SEO";

function Gallery() {
  const dispatch = PagesIndex.useDispatch();
  const [galleryList, setGalleryList] = useState([]);
  const [gallaryBackgroundData , setGallaryBackgroundData] = useState({})

  useEffect(() => {
    getGallaryList();
  }, []);
  const getGallaryList = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_GALLERY_IMAGES_LIST+"?"+new Date().getTime()).then(
      (res) => {
        if (res?.status === 200) {
          setGalleryList(res?.data?.galleryList);
        
          setGallaryBackgroundData(res?.data?.background[0])
        }
        dispatch(PagesIndex.hideLoader());
      }
    );
  };
  return (
    <Index.Box className="main-gallery">
      <SEO 
        title="Gallery" 
        description="Explore the visual world of Connplex Cinemas. Browse through our gallery of premium theatre interiors, luxury amenities, and memorable cinematic moments."
      />
      <PagesIndex.BannerImage
        bannerImage={ gallaryBackgroundData?.poster
          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${gallaryBackgroundData?.poster}`
          : PagesIndex.Jpg.lobbyArea2}
        bannerImageWidth="1920"
        bannerImageHeight="1080"
        bannerTitle={gallaryBackgroundData?.title ? gallaryBackgroundData?.title : "Gallery"}
      />
      <Index.Box className="gallery-wrapper">
        <Index.Box className="cus-container">
          <Index.Grid
            container
            spacing={{ lg: 5, sm: 3 }}
            className="gallery-wrapper-grid"
          >
            {galleryList.map((item, key) => (
              <Index.Grid
                item
                md={6}
                xxs={12}
                key={key}
                className="gallery-wrapper-grid-item"
              >
                <Index.Box className="gallery-item-box">
                  <Index.Link to={"/gallery/" + item._id}>
                    <img
                      src={item.poster ? PagesIndex.IMAGES_API_ENDPOINT + '/' + item.poster : PagesIndex.Png.NoImage}
                      width="233"
                      height="173"
                      alt="gallery"
                    />
                    <Index.Typography className="gallery-item-bottom">
                      <Index.Box to={item.url} className="title">
                        {item.title}
                      </Index.Box>
                    </Index.Typography>
                  </Index.Link>
                </Index.Box>
              </Index.Grid>
            ))}
          </Index.Grid>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Gallery;
