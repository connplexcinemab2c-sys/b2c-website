import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

function OrderTab({ orderList }) {
  console.log(orderList, 666);
  return (
    <Index.Box className="account-tab-order">
      <Index.Box className="account-tab-heading-box">
        <Index.Typography component="span" className="account-tab-heading">
          My Orders
        </Index.Typography>
      </Index.Box>
      {orderList
        .filter((data) => data.foodAndBvgResponse !== null)
        .map((data) => {
          console.log(data);
          return (
            <>
              <Index.Box className="account-tab-booking">
                <Index.Box className="your-booking-card">
                  <Index.Box className="your-booking-img-box">
                    <img
                      width="585"
                      height="800"
                      alt="movie"
                      src={PagesIndex.Png.NoImage}
                    />
                  </Index.Box>
                  <Index.Box className="booking-card-summary">
                    <Index.Box className="booking-card-header">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-title"
                      >
                        CHEESE GARLIC BREAD WPOS
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="booking-card-row">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-label"
                      >
                        Quantity :
                      </Index.Typography>
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-value"
                      >
                        1
                      </Index.Typography>
                    </Index.Box>

                    <Index.Box className="booking-card-row">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-label"
                      >
                        Price :
                      </Index.Typography>
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-value"
                      >
                        ₹ 100
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="booking-card-row">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-label"
                      >
                        Total Amount :
                      </Index.Typography>
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-value"
                      >
                        ₹ 500
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="booking-card-row">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-label"
                      >
                        Ordered On :
                      </Index.Typography>
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="booking-card-value"
                      >
                        20/11/2024
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              {/* <Index.Pagination
          count={Math.floor(bookingList?.length / 4)}
          page={page}
          onChange={handleChange}
        /> */}
            </>
          );
        })}

      {/* <Index.Box className="no-found-svg-box">
        <Index.RedeemIcon />
        You don't seem to have any recent Orders.
      </Index.Box> */}
    </Index.Box>
  );
}

export default OrderTab;
