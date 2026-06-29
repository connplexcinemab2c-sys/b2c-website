import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./blog.css";
import "./blog.responsive.css";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import Button from "../../../../components/common/Button";
import SEO from "../../../../components/common/SEO";

const Blog = () => {
  const dispatch = PagesIndex.useDispatch();
  const navigate = useNavigate();
  const [blogList, setBlogList] = useState([]);
  const [dividedArray, setDividedArray] = useState([]);
  const [blogBackgroundData, setBlogBackgroundData] = useState({});
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const handleLikeDislike = () => {
    setLiked(!liked);
  };

  const getGallaryList = () => {
    // dispatch(PagesIndex.hideLoader());
    // dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_BLOG).then((res) => {
      if (res?.status === 200) {
        let sortArr = res?.data?.bloglist?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


        setBlogList(sortArr);
        setBlogBackgroundData(res?.data?.background[0]);
        // dispatch(PagesIndex.hideLoader());
      }
      dispatch(PagesIndex.hideLoader());
    });
  };

  const modifiedData = (data) => {
    const sanitizedHtml = DOMPurify.sanitize(data?.description, {
      ALLOWED_TAGS: ["a"],
      ALLOWED_ATTR: ["class", "style", "src", "alt", "href"],
    });

    const tempElement = document.createElement("div");
    tempElement.innerHTML = sanitizedHtml;

    const links = tempElement.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute("target", "_blank");
    }

    const modifiedHtml = tempElement.innerHTML;

    return modifiedHtml;
  };

  useEffect(() => {
    getGallaryList();
  }, []);

  // call this function for divide array into number of chunks
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  useEffect(() => {
    if (blogList?.length) {
      // const chunkSize =
      //   blogList.length > 6 ? Math.ceil(blogList.length / 3) : 3;
      const chunkSize =3
      let tempDividedArray = chunkArray(blogList, chunkSize);
      setDividedArray(tempDividedArray);
    }
  }, [blogList]);
  console.log(blogList, "blogList");

  return (
    <>
      <SEO 
        title="Blog" 
        description="Stay updated with the latest movie news, reviews, and updates from Connplex Cinemas. Explore our blog for exclusive content and cinematic insights."
      />
      <Index.Box className="main-gallery">
        <PagesIndex.BannerImage
          bannerImage={
            blogBackgroundData?.imageBlog
              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${blogBackgroundData?.imageBlog}`
              : PagesIndex.Jpg.lobbyArea2
          }
          bannerImageWidth="1920"
          bannerImageHeight="1080"
          bannerTitle={
            blogBackgroundData?.title ? blogBackgroundData?.title : "Blog"
          }
        />

        <Index.Box className="cus-container">
          <Index.Box className="blog-connplex-body">
            <Index.Box className="blog-flex-body">
              {dividedArray?.map((array, rowIndex) => (
                <Index.Box className="row-blog" key={rowIndex}>
                  {array.map((row, index) => (
                    <Index.Box className="blog-4-cols" key={index}>
                      <Index.Box className="blog-card">
                        <Index.Box
                          className="blog-img-show"
                          onClick={() =>
                            navigate("/blog-details", {
                              state: { data: row },
                            })
                          }
                        >
                          <img
                            src={
                              row?.imageBlog
                                ? `${PagesIndex.IMAGES_API_ENDPOINT}/${row?.imageBlog}`
                                : PagesIndex.Png.NoImage
                            }
                            alt="aboutBanner"
                            className="banner-blog-details"
                          />
                          {/* <Index.Box className="blog-share-icon">
                            <Button className="share-icon-button">
                              <Index.ShareIcon />
                            </Button>
                          </Index.Box> */}
                        </Index.Box>
                        <Index.Box className="banner-card-details">
                          <Index.Box className="flex-blog-icon">
                            <Index.Typography className="title-blog-card">
                              {row?.title}
                            </Index.Typography>

                            {/* <Index.Box className="detail-banner-like like-blog-details">
                              <Index.Box className="like-bg-blog">
                                {liked ? (
                                  <Index.ThumbUpAltIcon
                                    onClick={handleLikeDislike}
                                    className="like-icon-border"
                                  />
                                ) : (
                                  <Index.ThumbUpAltOutlinedIcon
                                    onClick={handleLikeDislike}
                                    className="like-icon"
                                  />
                                )}

                                <span>5.6K</span>
                              </Index.Box>
                            </Index.Box> */}
                          </Index.Box>
                          <Index.Box
                            className="details-blog-card"
                            dangerouslySetInnerHTML={{
                              __html:
                                modifiedData(row).length >
                                (rowIndex === 0
                                  ? 240
                                  : rowIndex === 1
                                  ? 367
                                  : 721)
                                  ? modifiedData(row).slice(
                                      0,
                                      rowIndex === 0
                                        ? 240
                                        : rowIndex === 1
                                        ? 367
                                        : 721
                                    ) + "..."
                                  : modifiedData(row),
                            }}
                          ></Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  ))}
                </Index.Box>
              ))}
            </Index.Box>

            {dividedArray?.length === 0 ? (
              <Index.Box className="center-no-data">
                <Index.Box className="no-found-svg-box">
                  <Index.PrivacyTipIcon />
                  No Blogs Available
                </Index.Box>
              </Index.Box>
            ) : (
              <></>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </>
  );
};

export default Blog;
