import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import AppTeatreSvgIcon from "../../../../components/icons/AppTeatreSvgIcon";
import SEO from "../../../../components/common/SEO";

function Cinema() {
  const { region } = PagesIndex.useSelector((state) => state.UserReducer);
  const [cinemaList, setCinemaList] = useState([]);
  const dispatch = PagesIndex.useDispatch();

  useEffect(() => {
    if (region) {
      getCinemasByRegionList();
    }
  }, [region]);

  const getCinemasByRegionList = () => {
    dispatch(PagesIndex.showLoader())
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_CINEMA_BY_ID,
      region._id + "?" + new Date().getTime()
    ).then((res) => {
      if (res?.status === 200) {
        setCinemaList(res.data);
        dispatch(PagesIndex.hideLoader())
      }
    }).catch(()=>dispatch(PagesIndex.hideLoader()))
  };
  return (
    <Index.Box className="main-cinema">
      <SEO 
        title="Cinemas" 
        description="Find Connplex Cinemas near you. We are spread across India, providing the best movie-watching experience with premium amenities."
      />
      <Index.Box className="cus-container">
        <Index.Box className="cinema-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="cinema-header-title"
          >
            Cinemas
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="cinema-header-subtitle"
          >
            WE ARE SPREAD ACROSS INDIA
          </Index.Typography>
        </Index.Box>
        {cinemaList.length  ? (
          <Index.Box className="cinema-body">
            {cinemaList.map((item, key) => (
              <Index.Box key={key} className="cinema-box">
                <img
                  src={
                    item.poster
                      ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item.poster}`
                      : PagesIndex.Png.NoImageCinema
                  }
                  alt="cinema"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = PagesIndex.Png.NoImageCinema;
                  }}
                />
                <Index.Box className="cinema-box-content">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="cinema-title"
                  >
                    {item.displayName}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="cinema-city"
                  >
                    {item.emailId}
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="cinema-address"
                  >
                    {item.address}
                  </Index.Typography>
                </Index.Box>
                <Index.Link
                  to={`/cinema-detail?cId=${item?._id}&rId=${item?.regionId}`}
                  className="cinema-box-link"
                />
              </Index.Box>
            ))}
          </Index.Box>
        ) : (
          <Index.Box className="no-cinema-body">
            <Index.Box className="no-found-img-box">
            {/* <AppTeatreSvgIcon /> */}
              No Cinemas Available
            </Index.Box>
          </Index.Box>
        )}
      </Index.Box>
    </Index.Box>
  );
}

export default Cinema;
