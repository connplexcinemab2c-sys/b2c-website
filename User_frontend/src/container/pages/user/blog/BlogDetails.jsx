import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./blog.css";
import "./blog.responsive.css";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import DOMPurify from "dompurify";
import SEO from "../../../../components/common/SEO";

const BlogDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = PagesIndex.useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const rId = queryParams.get("rId");

  const [data, setData] = React.useState(location?.state?.data);

  React.useEffect(() => {
    if (!data && rId) {
      dispatch(PagesIndex.showLoader());
      PagesIndex.apiGetHandler(PagesIndex.Api.GET_BLOG)
        .then((res) => {
          if (res?.status === 200) {
            const blog = res?.data?.bloglist?.find((item) => item._id === rId);
            if (blog) {
              setData(blog);
            }
          }
          dispatch(PagesIndex.hideLoader());
        })
        .catch((err) => {
          console.error(err);
          dispatch(PagesIndex.hideLoader());
        });
    }
  }, [rId, data, dispatch]);

  React.useEffect(() => {
    if (!rId && !data) {
      navigate("/blog");
    }
  }, [rId, data, navigate]);

  if (rId && !data) {
    return null;
  }

  const sanitizedHtml = DOMPurify.sanitize(data?.description || "", {
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
      <SEO 
        title={data?.title} 
        description={data?.description?.replace(/<[^>]*>?/gm, '').slice(0, 160)}
        ogImage={data?.imageBlog ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.imageBlog}` : null}
      />
      <Index.Box className="cus-container">
        <Index.Box className="blog-details-content">
          <Index.Box className="blog-details-title">
            <Index.Box className="blog-detail-title-flex">
              <Index.Button
                className="back-arrow-button"
                onClick={() => navigate("/blog")}
              >
                <img
                  src={PagesIndex.Svg.previousImg}
                  className="back-arrow"
                  alt="arrow"
                />
              </Index.Button>
              <Index.Typography className="titleblog-inner-details">
                {data?.title}
              </Index.Typography>
            </Index.Box>
            <Index.Typography class="post-meta">
              {/* {" "}
              by{" "}
              <span class="author vcard">
                <Index.Link href="" title="Posts by admin" rel="author">
                  admin
                </Index.Link>
              </span>{" "}
              |{" "} */}
              <span class="published">
                {moment(data?.createdAt).format("MMM Do, YYYY")}
              </span>{" "}
              {/* |{" "}
              <Index.Link href="" rel="category tag">
                Cultivator's Blog
              </Index.Link>{" "}
              |{" "}
              <span class="comments-number">
                <Index.Link href="">0 comments</Index.Link>
              </span> */}
            </Index.Typography>
          </Index.Box>
          <Index.Box className="blog-details-full-content">
            <Index.Box className="blog-view-details-img">
              <img
                // src={PagesIndex.Jpg.aboutBanner}
                src={
                  data?.imageBlog
                    ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.imageBlog}`
                    : PagesIndex.Png.NoImage
                }
                alt="aboutBanner"
                className="banner-blog-details"
              />
            </Index.Box>
            <Index.Box className="blog-details-parashow">
              <Index.Box
                className="blog-details-text ck-content"
                dangerouslySetInnerHTML={{
                  __html: modifiedHtml,
                }}
              ></Index.Box>
            </Index.Box>
          </Index.Box>
          {/* 
          <Index.Box className="inner-blog-details">
            <Index.Box className="inner-blog-title-box">
              <Index.Typography className="titleblog-inner-details">
                Movie Blog Title 1
              </Index.Typography>
              <Index.Box className="inner-para-with-img">
                <Index.Typography className="para-content-inner">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the . Lorem Ipsum is simply
                  dummy text of the printing and typesetting industry. Lorem
                  Ipsum has been the industry's standard dummy text ever since
                  the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book. It has survived not
                  only five centuries, but also the leap into electronic
                  typesetting, remaining essentially unchanged. It was
                  popularised in the 1960s with the release of Letraset sheets
                  containing Lorem Ipsum passages, and more recently with
                  desktop publishing software like Aldus PageMaker including
                  versions of Lorem Ipsum
                </Index.Typography>
                <Index.Box className="inner-content-img-blog">
                  <img
                    src="https://backend.theconnplex.com/uploads/1695040605199eumef.jpg"
                    alt="aboutBanner"
                    className="banner-blog-details"
                  />
                </Index.Box>

                <Index.Typography className="para-content-inner">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the . Lorem Ipsum is simply
                  dummy text of the printing and typesetting industry. Lorem
                  Ipsum has been the industry's standard dummy text ever since
                  the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book. It has survived not
                  only five centuries, but also the leap into electronic
                  typesetting, remaining essentially unchanged. It was
                  popularised in the 1960s with the release of Letraset sheets
                  containing Lorem Ipsum passages, and more recently with
                  desktop publishing software like Aldus PageMaker including
                  versions of Lorem Ipsum
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box>

          <Index.Box className="inner-blog-details">
            <Index.Box className="inner-blog-title-box">
              <Index.Typography className="titleblog-inner-details">
                Movie Blog Title 2
              </Index.Typography>
              <Index.Box className="inner-para-with-img">
                <Index.Typography className="para-content-inner">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the . Lorem Ipsum is simply
                  dummy text of the printing and typesetting industry. Lorem
                  Ipsum has been the industry's standard dummy text ever since
                  the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book. It has survived not
                  only five centuries, but also the leap into electronic
                  typesetting, remaining essentially unchanged. It was
                  popularised in the 1960s with the release of Letraset sheets
                  containing Lorem Ipsum passages, and more recently with
                  desktop publishing software like Aldus PageMaker including
                  versions of Lorem Ipsum
                </Index.Typography>
                <Index.Box className="inner-content-img-blog">
                  <img
                    src="https://backend.theconnplex.com/uploads/1695040605199eumef.jpg"
                    alt="aboutBanner"
                    className="banner-blog-details"
                  />
                </Index.Box>

                <Index.Typography className="para-content-inner">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the . Lorem Ipsum is simply
                  dummy text of the printing and typesetting industry. Lorem
                  Ipsum has been the industry's standard dummy text ever since
                  the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book. It has survived not
                  only five centuries, but also the leap into electronic
                  typesetting, remaining essentially unchanged. It was
                  popularised in the 1960s with the release of Letraset sheets
                  containing Lorem Ipsum passages, and more recently with
                  desktop publishing software like Aldus PageMaker including
                  versions of Lorem Ipsum
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box> */}
        </Index.Box>
      </Index.Box>
    </>
  );
};

export default BlogDetails;
