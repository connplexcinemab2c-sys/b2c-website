import React, { useCallback, useEffect, useState } from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";

function MovieCard({ title, isNowPlaying, item, setInterested }) {
  const { region } = PagesIndex.useSelector((state) => state.UserReducer);
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();

  const [modalTrailer, setModalTrailer] = useState(false);
  const modalTrailerOpen = () => setModalTrailer(true);
  const modalTrailerClose = () => setModalTrailer(false);

  const handleVisibilityChange = useCallback(() => {
    let data = document.visibilityState === "visible";
    if (!data) {
      modalTrailerClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  let movieType = item?.movieType?.includes("3D") ? "3D" : "2D";
  let movieLanguage = item?.languages?.toString()?.charAt(0)?.toUpperCase();
  let movieGenre = item?.category?.split(",");
  return (
    <Index.Box className="main-card">
      <Index.Box
        className="card-img"
        onClick={() => {
          location?.pathname == "/movie-details" && setInterested(null);
          navigate({
            pathname: `/movie-details`,
            search: PagesIndex?.createSearchParams({
              mId: item?.linkedNowPlayingMovie  ? item?.linkedNowPlayingMovie : item?._id,
              rId: region?._id ? region?._id : item?.cinemaObjectId?.regionId,
            }).toString(),
          });
        }}
      >
        <img
          src={
            item?.poster
              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
              : PagesIndex.Png.NoImage
          }
          alt="movie"
          width="585"
          height="800"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = PagesIndex.Png.NoImage;
          }}
        />
        {isNowPlaying && (
          <Index.Box className="card-rating-like">
            <Index.Box className="card-rating-box">
              <Index.Typography component="span">
                <Index.StarIcon />
              </Index.Typography>
              {/* <Index.Typography component="span">
                {Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(
                  item?.averageRating >= 5 ? item?.averageRating : item?.rating
                )}
                /5
              </Index.Typography> */}

              <span>
                {Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(
                  item?.averageRating <= 5 && item?.averageRating !== 0
                    ? item?.averageRating
                    : item?.rating
                )}
                /5
              </span>
            </Index.Box>
            <Index.Box className="card-like-box">
              <Index.Typography component="span">
                <Index.ThumbUpAltIcon color="success" />
              </Index.Typography>
              <Index.Typography component="span">
                {Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(
                  item?.likes >= item?.totalLikes - item?.likes
                    ? item?.likes
                    : item?.totalLikes
                )}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        )}
      </Index.Box>
      <Index.Box className="card-content">
        <Index.Box className="card-content-title">
          <Index.Typography variant="h6">{item?.name}</Index.Typography>
        </Index.Box>
        <Index.Box className="card-content-movie">
          {movieGenre?.slice(0, 2).map((item, index, arr) => (
            <Index.Box key={index} className="card-content-action">
              {item}
              {index < arr.length - 1 ? "," : ""}
            </Index.Box>
          ))}
          <Index.Box className="card-content-movie-lung">
            <span className="lung-details">
              <span className="title-movie-lung">{movieLanguage}</span>
              <span className="title-movie-threed">{movieType}</span>{" "}
            </span>
          </Index.Box>
        </Index.Box>
        <Index.Box className="card-content-btn">
          <PagesIndex.Button
            secondary
            onClick={() =>
              item?.youtubeVideoUrl
                ? modalTrailerOpen()
                : PagesIndex.toast.error("Movie Trailer is not available")
            }
          >
            Watch Trailer
          </PagesIndex.Button>
          <PagesIndex.TrailerModal
            open={modalTrailer}
            onClose={modalTrailerClose}
            link={item?.youtubeVideoUrl}
          />
{
          console.log(title , "TITLE")
}
          {title === "Recent Releases"
            ? item?.isShowAvailable &&
              isNowPlaying && (
                <PagesIndex.Button
                  primary
                  onClick={() => {
                    navigate({
                      pathname: `/movie-details`,
                      search: PagesIndex?.createSearchParams({
                        mId: item?._id,
                        rId: item?.cinemaObjectId?.regionId,
                      }).toString(),
                    });
                  }}
                >
                  Book Ticket
                </PagesIndex.Button>
              )
            : isNowPlaying && (
                <PagesIndex.Button
                  primary
                  onClick={() => {
                    navigate({
                      pathname: `/movie-details`,
                      search: PagesIndex?.createSearchParams({
                        mId: item?._id,
                        rId: item?.cinemaObjectId?.regionId,
                      }).toString(),
                    });
                  }}
                >
                  Book Ticket
                </PagesIndex.Button>
              )}
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default MovieCard;
