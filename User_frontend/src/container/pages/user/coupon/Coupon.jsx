import React from "react";
import "./CouponCard.css";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

export default function Coupon() {
  return (
    <>
      {/* New Coupon Card */}

      <Index.Box className="main-showing-part movie-slider">
        <Index.Box className="cus-container">
          <Index.Box className="showing-txt movie-slider-heading coupon-card">
            <Index.Typography variant="h5">Coupon Details</Index.Typography>
          </Index.Box>
          <Index.Grid container spacing={4} justifyContent={"center"}>
            <Index.Grid item xs={12} md={3}>
              <Index.Box className="main-card coupon-card-cont">
                <Index.Box className="card-content">
                  <Index.Box className="coupon-card-list">
                    <Index.Box className="coupon-heading">
                      coupon-title
                    </Index.Box>
                    <Index.List className="coupon-list">
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">10%</span> off on food
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">10%</span> off on
                          Tickets
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">1 free</span> ticket a
                          month
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">1 Guest pass</span> per
                          quarter
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">No</Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Email</span> Only
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Get 2% coin</span> on
                          total bill
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Yes</span>
                        </Index.Box>
                      </Index.ListItem>
                    </Index.List>
                    <Index.Box className="card-content-btn">
                      <PagesIndex.Button primary>Buy Now</PagesIndex.Button>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Grid>

            <Index.Grid item xs={12} md={3}>
              <Index.Box className="main-card coupon-card-cont">
                <Index.Box className="card-content">
                  <Index.Box className="coupon-heading">coupon-title</Index.Box>
                  <Index.Box className="coupon-card-list">
                    <Index.List className="coupon-list">
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">10%</span> off on food
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">10%</span> off on
                          Tickets
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">1 free</span> ticket a
                          month
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">1 Guest pass</span> per
                          quarter
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">No</Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Email</span> Only
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Get 2% coin</span> on
                          total bill
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Yes</span>
                        </Index.Box>
                      </Index.ListItem>
                    </Index.List>
                    <Index.Box className="card-content-btn">
                      <PagesIndex.Button primary>Buy Now</PagesIndex.Button>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Grid>

            <Index.Grid item xs={12} md={3}>
              <Index.Box className="main-card coupon-card-cont">
                <Index.Box className="card-content">
                  <Index.Box className="coupon-card-list">
                    <Index.Box className="coupon-heading">
                      coupon-title
                    </Index.Box>
                    <Index.List className="coupon-list">
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">10%</span> off on food
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">10%</span> off on
                          Tickets
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">1 free</span> ticket a
                          month
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">1 Guest pass</span> per
                          quarter
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">No</Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">No</span>
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Email</span> Only
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Get 2% coin</span> on
                          total bill
                        </Index.Box>
                      </Index.ListItem>
                      <Index.ListItem className="coupon-detail-list">
                        <Index.Box className="coupon-subtitle">
                          <span className="coupon-title">Yes</span>
                        </Index.Box>
                      </Index.ListItem>
                    </Index.List>
                    <Index.Box className="card-content-btn">
                      <PagesIndex.Button primary>Buy Now</PagesIndex.Button>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>
        </Index.Box>
      </Index.Box>

      {/* End Coupon Card */}
    </>
  );
}
