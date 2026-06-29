import React, { useState, useEffect, useCallback, useRef } from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";
import { DataService } from "../../config/DataService";

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default function SearchModal({
  handleClose,
  optionId,
  setSearchOptionId,
}) {
  const searchType = [
    {
      title: "AnyWhere",
      id: 1,
    },
    // {
    //   title: "AnyWeek",
    //   id: 2,
    // },
    {
      title: "AnyMovie",
      id: 3,
    },
    {
      title: "AnyOffer",
      id: 4,
    },
  ];

  const navigate = PagesIndex.useNavigate();
  const { region } = PagesIndex.useSelector((state) => state.UserReducer);
  const [searchedData, setSearchedData] = useState([]);
  const [type, setType] = useState(optionId);
  const [searchText, setSearchText] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const searchAbortControllerRef = useRef(null);

  const getAllSearchItems = async (search = "") => {
    // Abort the previous request
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    // Create a new controller
    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    setShowLoader(true);
    setSearchedData([]);

    try {
      const response = await DataService(
        `${
          PagesIndex.Api.GET_ALL_SEARCH_DATA
        }?text=${search}&type=${type}&regionId=${region?._id ?? ""}`,
        { signal: controller.signal } // ⬅ pass the signal
      );

      if (response?.data?.status === 200) {
        setSearchedData(response?.data?.data);
      } else {
        PagesIndex.toast.error(response?.data?.message);
      }
    } catch (error) {
      // if (error.name !== "AbortError") {
      //   PagesIndex.toast.error("Something went wrong.");
      // }
    } finally {
      setShowLoader(false);
    }
  };

  const debouncedSearch = useCallback(debounce(getAllSearchItems, 500), []);
  const handleChangeType = (typeNo) => {
    setType(typeNo);
    setSearchOptionId("");
  };

  // useEffect(() => {
  //   getAllSearchItems();
  // }, [searchText, region?._id, type]);
  return (
    <Index.Box className="search-modal-inner">
      <Index.Box className="modal-inner">
        <Index.Box className="search-header-box">
          <Index.Box className="search-btn-box-wrapper cus-scrollbar">
            {/* <Index.Box className="search-btn-box">
              {searchType?.map((data) => {
                return (
                  <PagesIndex.Button
                    key={data?.id}
                    secondary
                    className={optionId == data?.id ? "active" : type === data?.id  ? "active" : ""}
                    onClick={() => handleChangeType(data?.id)}
                  >
                    {data?.title}
                  </PagesIndex.Button>
                );
              })}
            </Index.Box> */}
          </Index.Box>
          <Index.Box className="search-input-box">
            <Index.Input
              autoFocus
              className="search-input"
              placeholder="Search by Cinema , Movie..."
              value={searchText}
              onKeyDown={(e) => {
                if (e.key === " " && e.target.value.trim() === "") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (
                  searchedData?.getCinemas?.length > 0 ||
                  searchedData?.getMovies?.length > 0
                ) {
                  setSearchedData([]);
                }
                if (e?.target?.value) {
                  debouncedSearch(e.target.value);
                }
              }}
            />
            <Index.Box className="svg-box">
              {showLoader && <PagesIndex.Loader secondary />}
              <Index.SearchIcon />
            </Index.Box>
          </Index.Box>
        </Index.Box>
        {searchText.length > 0 && (
          <Index.Box className="search-result-box cus-scrollbar">
            {(type === 1 || type === 2 || type === 3) && (
              <Index.Box className="search-result-box-inner movie">
                <Index.Typography className="search-result-title">
                  Movies
                  {/* <Index.Typography variant="span" component="span" className="view-all">
                View All
              </Index.Typography> */}
                </Index.Typography>
                <Index.Box className="search-result-body movie">
                  {searchedData?.getMovies?.filter(
                    (item) => item != null && item?.poster
                  )?.length ? (
                    searchedData?.getMovies
                      ?.filter((item) => item != null && item?.poster)
                      .map((data) => {
                        return (
                          <Index.Box
                            key={data?._id}
                            className="search-result-card movie"
                            onClick={() => {
                              if (data?.poster) {
                                handleClose();
                                navigate({
                                  pathname: `/movie-details`,
                                  search: PagesIndex?.createSearchParams({
                                    mId: data?._id,
                                    ...(data?.cinemaObjectId?.regionId
                                      ? { rId: data?.cinemaObjectId?.regionId }
                                      : {}),
                                  }).toString(),
                                });
                              }
                            }}
                          >
                            <Index.Box className="search-result-movie-img">
                              <img
                                src={
                                  data?.poster
                                    ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.poster}`
                                    : PagesIndex.Png.NoImage
                                }
                                alt="movie"
                                onError={({ currentTarget }) => {
                                  currentTarget.onerror = null; // prevents looping
                                  currentTarget.src = PagesIndex.Png.NoImage;
                                }}
                              />
                            </Index.Box>
                            <Index.Typography className="search-result-movie-name">
                              {data?.name}
                            </Index.Typography>
                          </Index.Box>
                        );
                      })
                  ) : (
                    <Index.Box className="search-result-body offer">
                      <Index.Box className="no-search-result">
                        No Movies Available
                      </Index.Box>
                    </Index.Box>
                  )}
                </Index.Box>
              </Index.Box>
            )}
            {(type === 1 || type === 2) && (
              <Index.Box className="search-result-box-inner cinema">
                <Index.Typography className="search-result-title">
                  Cinemas
                  {/* <Index.Typography variant="span" component="span" className="view-all">
                View All
              </Index.Typography> */}
                </Index.Typography>
                <Index.Box className="search-result-body cinema">
                  {searchedData?.getCinemas?.length ? (
                    searchedData?.getCinemas?.map((data) => {
                      return (
                        <Index.Box
                          key={data?._id}
                          className="search-result-card cinema"
                          onClick={() => {
                            handleClose();
                            navigate({
                              pathname: "/cinema-detail",
                              search: PagesIndex?.createSearchParams({
                                cId: data?._id,
                                ...(data?.regionId
                                  ? { rId: data?.regionId }
                                  : {}),
                              }).toString(),
                            });
                          }}
                        >
                          <img
                            src={
                              data?.poster
                                ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.poster}`
                                : PagesIndex.Png.NoImage
                            }
                            alt="cinema"
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null; // prevents looping
                              currentTarget.src = PagesIndex.Png.NoImage;
                            }}
                          />
                          <Index.Typography className="search-result-cinema-name">
                            {data?.displayName}
                            <Index.Typography className="search-result-cinema-address">
                              {data?.address}
                            </Index.Typography>
                          </Index.Typography>
                        </Index.Box>
                      );
                    })
                  ) : (
                    <Index.Box className="search-result-body offer">
                      <Index.Box className="no-search-result">
                        No Cinemas Available
                      </Index.Box>
                    </Index.Box>
                  )}
                </Index.Box>
              </Index.Box>
            )}
            {type === 4 && (
              <Index.Box className="search-result-box-inner offer">
                <Index.Typography className="search-result-title">
                  Offers
                  {/* <Index.Typography variant="span" component="span" className="view-all">
                View All
              </Index.Typography> */}
                </Index.Typography>
                <Index.Box className="search-result-body offer">
                  <Index.Box className="no-search-result">
                    No Offers Available
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            )}
          </Index.Box>
        )}
      </Index.Box>
    </Index.Box>
  );
}
