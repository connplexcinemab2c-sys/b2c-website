import React from "react";
import Index from "../Index";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

function ProductCard({ Image, Title, Desc, NewPrice, OldPrice }) {
  return (
    <Index.Box className="product-card">
      <Index.Checkbox
        className="add-wishlist-btn"
        {...label}
        icon={<Index.FavoriteBorder />}
        checkedIcon={<Index.Favorite />}
      />
      <Index.Box className="product-img">
        <Index.Link to="/product-detail">
          <img src={Image} alt="product" width="585" height="800" />
        </Index.Link>
      </Index.Box>
      <Index.Box className="product-content">
        <Index.Link to="/product-detail" className="product-title">
          {Title}
        </Index.Link>
        <Index.Box className="product-desc">{Desc}</Index.Box>
        <Index.Box className="product-price">
          <Index.Typography
            variant="span"
            component="span"
            className="new-price"
          >
            {NewPrice}
          </Index.Typography>
          <Index.Typography
            variant="span"
            component="span"
            className="old-price"
          >
            {OldPrice}
          </Index.Typography>
        </Index.Box>
        <Index.Box className="product-action">
          <Index.Link to="#" className="btn btn-secondary add-cart-btn">
            <Index.ShoppingCartCheckoutIcon />
          </Index.Link>
          <Index.Link to="#" className="btn btn-primary buy-now-btn">
            Buy Now
          </Index.Link>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default ProductCard;
