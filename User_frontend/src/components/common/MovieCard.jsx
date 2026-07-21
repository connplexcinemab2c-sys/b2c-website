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

  const [showLanguagesOverlay, setShowLanguagesOverlay] = useState(false);

  let movieType = item?.movieType?.includes("3D") ? "3D" : "2D";
  let movieLanguage = item?.languages?.toString()?.charAt(0)?.toUpperCase();
  if (item?.versions && item?.versions?.length > 1) {
    const uniqueLangs = [...new Set(item.versions.map(v => v.languages).filter(Boolean))];
    const uniqueTypes = [...new Set(item.versions.map(v => v.movieType).filter(Boolean))];
    movieLanguage = uniqueLangs.map(l => l.toString().charAt(0).toUpperCase()).join("/");
    movieType = uniqueTypes.join("/");
  }
  let movieGenre = item?.category?.split(",");
  return (
    <Index.Box className="main-card" style={{ position: "relative" }}>
      {showLanguagesOverlay && item?.versions && item?.versions?.length > 1 && (
        <Index.Box 
          className="card-language-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          <Index.Typography 
            variant="subtitle1" 
            style={{ 
              color: "#cda755", 
              fontWeight: "bold", 
              marginBottom: "15px", 
              textAlign: "center",
              fontSize: "16px",
              textTransform: "uppercase"
            }}
          >
            Select Version
          </Index.Typography>
          <Index.Box 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "8px", 
              width: "100%", 
              maxHeight: "220px", 
              overflowY: "auto"
            }}
          >
            {item.versions.map((v) => {
              const formatLanguage = (lang) => {
                if (!lang) return "";
                return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
              };
              return (
                <PagesIndex.Button
                  key={v._id}
                  primary
                  onClick={() => {
                    setShowLanguagesOverlay(false);
                    navigate({
                      pathname: `/movie-details`,
                      search: PagesIndex?.createSearchParams({
                        mId: v._id,
                        rId: region?._id ? region?._id : v?.cinemaObjectId?.regionId || item?.cinemaObjectId?.regionId,
                      }).toString(),
                    });
                  }}
                  style={{ 
                    width: "100%", 
                    fontSize: "12px", 
                    padding: "8px 10px", 
                    textTransform: "none",
                    fontWeight: "500" 
                  }}
                >
                  Book in {formatLanguage(v.languages)} ({v.movieType})
                </PagesIndex.Button>
              );
            })}
            <PagesIndex.Button
              secondary
              onClick={() => setShowLanguagesOverlay(false)}
              style={{ 
                width: "100%", 
                marginTop: "5px", 
                fontSize: "12px", 
                padding: "8px 10px",
                textTransform: "none" 
              }}
            >
              Cancel
            </PagesIndex.Button>
          </Index.Box>
        </Index.Box>
      )}
      <Index.Box
        className="card-img"
        onClick={() => {
          if (item?.versions && item?.versions?.length > 1) {
            setShowLanguagesOverlay(true);
          } else {
            location?.pathname == "/movie-details" && setInterested(null);
            navigate({
              pathname: `/movie-details`,
              search: PagesIndex?.createSearchParams({
                mId: item?.linkedNowPlayingMovie ? item?.linkedNowPlayingMovie : item?._id,
                rId: region?._id ? region?._id : item?.cinemaObjectId?.regionId,
              }).toString(),
            });
          }
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
                    if (item?.versions && item?.versions?.length > 1) {
                      setShowLanguagesOverlay(true);
                    } else {
                      navigate({
                        pathname: `/movie-details`,
                        search: PagesIndex?.createSearchParams({
                          mId: item?._id,
                          rId: item?.cinemaObjectId?.regionId,
                        }).toString(),
                      });
                    }
                  }}
                >
                  Book Ticket
                </PagesIndex.Button>
              )
            : isNowPlaying && (
                <PagesIndex.Button
                  primary
                  onClick={() => {
                    if (item?.versions && item?.versions?.length > 1) {
                      setShowLanguagesOverlay(true);
                    } else {
                      navigate({
                        pathname: `/movie-details`,
                        search: PagesIndex?.createSearchParams({
                          mId: item?._id,
                          rId: item?.cinemaObjectId?.regionId,
                        }).toString(),
                      });
                    }
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
