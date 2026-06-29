import React, { useEffect, useState } from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";
import { LightBox } from "react-lightbox-pack";
import { useNavigate } from "react-router-dom";

function srcset(image, size, rows = 1, cols = 1) {
    return {
      src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
      srcSet: `${image}?w=${size * cols}&h=${
        size * rows
      }&fit=crop&auto=format&dpr=2 2x`,
    };
}

function GallaryImages() {
  const navigate = useNavigate()
  const [toggle, setToggle] = useState(false);
  const [sIndex, setSIndex] = useState(0);


  const lightBoxHandler = (state, sIndex) => {
    setToggle(state);
    setSIndex(sIndex);
  };

  const dispatch = PagesIndex.useDispatch();
  const params = PagesIndex.useParams();
  const { id } = params;
  const [galleryImagesList, setGalleryImagesList] = useState([]);
  useEffect(() => {
    getGallaryList();
  }, []);
  const getGallaryList = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_GALLERY_IMAGES_LIST+"?"+new Date().getTime()).then(
      (res) => {
        if (res?.status === 200) {
          let selectedClass = res?.data?.galleryList?.find((data) => data?._id === id);
          if(selectedClass == undefined){
            navigate('/gallery')
          }else{
            selectedClass.imageGallery = selectedClass?.imageGallery.map(
              (data) => {
                  return {
                    image: data?.poster ?  `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.poster}` : "",
                    _id: data?._id,
                  };
              }
            );
  
            setGalleryImagesList(selectedClass);
          }
         
        }
        dispatch(PagesIndex.hideLoader());
      }
    ).catch(()=> dispatch(PagesIndex.hideLoader()));
    
  };
  return (
    <Index.Box className="main-gallery-inner">
      <PagesIndex.BannerImage
        bannerImage={galleryImagesList?.poster ? `${PagesIndex.IMAGES_API_ENDPOINT}/${galleryImagesList?.poster}` : PagesIndex.Png.NoImage}
        bannerImageWidth="1920"
        bannerImageHeight="1080"
        bannerTitle={`${galleryImagesList?.title || ""}`}
      />
      <Index.Box className="cus-container">
        {galleryImagesList?.imageGallery?.length ? (
          <Index.Box className="gallery-wrapper">
            <Index.ImageList variant="quilted" cols={4} gap={15}>
              {galleryImagesList?.imageGallery?.filter((ele) =>  ele.image != "")?.map((item, index) => (
                <Index.ImageListItem
                  key={index}
                  rows={
                    galleryImagesList?.imageGallery?.length === 1
                      ? 2
                      : galleryImagesList?.imageGallery?.length === 2
                      ? 2
                      : index % 8 === 0 || (index + 1) % 8 === 6
                      ? 2
                      : 1
                  }
                  cols={
                    galleryImagesList?.imageGallery?.length === 1
                      ? 4
                      : galleryImagesList?.imageGallery?.length === 2
                      ? 2
                      : index % 8 === 0 ||
                        (index + 1) % 8 === 4 ||
                        (index + 1) % 8 === 5 ||
                        (index + 1) % 8 === 6
                      ? 2
                      : 1
                  }
                >
                  <img
                    {...srcset(item?.image, 300)}
                    alt="Gallery Inner"
                    loading="lazy"
                    onClick={() => {
                      lightBoxHandler(true, index);
                    }}
                    onKeyDown={() => {
                      lightBoxHandler(true, index);
                    }}
                  />
                </Index.ImageListItem>
              ))}
            </Index.ImageList>
            <LightBox
              state={toggle}
              event={lightBoxHandler}
              data={galleryImagesList?.imageGallery}
              imageWidth="80vw"
              imageHeight="70vh"
              thumbnailHeight={50}
              thumbnailWidth={50}
              setImageIndex={setSIndex}
              imageIndex={sIndex}
            />
          </Index.Box>
        ) : (
          <Index.Box className="no-found-img-box">
            <img src={PagesIndex.Png.Gallery} alt="No Found" />
            No Image Available
          </Index.Box>
        )}
      </Index.Box>
    </Index.Box>
  );
}

export default GallaryImages;
