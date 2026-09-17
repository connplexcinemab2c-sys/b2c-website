import React, { useState, useEffect } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import EcommerceService, {
  ECOMMERCE_IMAGES_API_ENDPOINT,
} from "../../../../config/EcommerceService";
import { EcommerceApi } from "../../../../config/EcommerceApi";

function Ecommerce() {
  const [sortBy, setSortBy] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [loading, setLoading] = useState(true);

  const priceRanges = [
    { label: "₹0 - ₹300", min: 0, max: 300 },
    { label: "₹300 - ₹1000", min: 300, max: 1000 },
    { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
    { label: "₹2000+", min: 2000, max: 999999 },
  ];

  const handleChangeSortBy = (event) => {
    setSortBy(event.target.value);
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  // Fetch Categories on component mount
  const fetchCategories = async () => {
    try {
      const res = await EcommerceService.get(EcommerceApi.GET_CATEGORIES);
      if (res?.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching storefront categories:", err);
      setCategories([]);
    }
  };

  // Fetch Products based on selected filters and sort
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }
      if (selectedPriceRange) {
        const found = priceRanges.find((p) => p.label === selectedPriceRange);
        if (found) {
          params.minPrice = found.min;
          params.maxPrice = found.max;
        }
      }

      const res = await EcommerceService.get(EcommerceApi.GET_PRODUCTS, {
        params,
      });
      if (res?.data?.data) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching storefront products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, selectedPriceRange]);

  const handleCategorySelect = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handlePriceSelect = (rangeLabel) => {
    if (selectedPriceRange === rangeLabel) {
      setSelectedPriceRange("");
    } else {
      setSelectedPriceRange(rangeLabel);
    }
  };

  const handleClearAll = () => {
    setSelectedCategory("");
    setSelectedPriceRange("");
    setSortBy("");
  };

  const selectedCategoryDoc = categories.find((c) => c._id === selectedCategory);

  return (
    <Index.Box className="main-ecommerce">
      <Index.Box className="cus-container">
        <Index.Box className="ecommerce-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="ecommerce-header-title"
          >
            E-commerce
          </Index.Typography>
          <Index.Typography
            variant="p"
            component="p"
            className="ecommerce-header-subtitle"
          >
            WE ARE SPREAD ACROSS INDIA
          </Index.Typography>
        </Index.Box>

        <Index.Box className="ecommerce-bottom">
          <Index.Box className="ecommerce-sortby">
            <Index.Box className="ecommerce-filter-selected">
              <Index.Box
                className={
                  open
                    ? "ecommerce-mobile-filter open"
                    : "ecommerce-mobile-filter"
                }
                onClick={handleOpen}
              >
                <Index.FilterAltIcon />
              </Index.Box>

              {selectedCategoryDoc && (
                <Index.Box className="filter-selected-item">
                  {selectedCategoryDoc.name}
                  <Index.CloseIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCategory("")}
                  />
                </Index.Box>
              )}

              {selectedPriceRange && (
                <Index.Box className="filter-selected-item">
                  {selectedPriceRange}
                  <Index.CloseIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedPriceRange("")}
                  />
                </Index.Box>
              )}

              {(selectedCategory || selectedPriceRange) && (
                <Index.Box
                  className="filter-selected-item clear-all"
                  style={{ cursor: "pointer" }}
                  onClick={handleClearAll}
                >
                  Clear All
                </Index.Box>
              )}
            </Index.Box>

            <Index.Box className="ecommerce-filter-sortby">
              <Index.Select
                className="sortby-select"
                value={sortBy}
                onChange={handleChangeSortBy}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <Index.MenuItem value="" className="menuitem">
                  Popularity
                </Index.MenuItem>
                <Index.MenuItem value={10} className="menuitem">
                  Low to High
                </Index.MenuItem>
                <Index.MenuItem value={20} className="menuitem">
                  High to Low
                </Index.MenuItem>
                <Index.MenuItem value={30} className="menuitem">
                  Newest First
                </Index.MenuItem>
              </Index.Select>
            </Index.Box>
          </Index.Box>

          <Index.Box className="ecommerce-body">
            <Index.Box
              className={open ? "ecommerce-filter open" : "ecommerce-filter"}
            >
              <Index.Box className="ecommerce-filter-title">
                Filter
                <Index.Typography
                  variant="span"
                  className="ecommerce-clear-all"
                  style={{ cursor: "pointer" }}
                  onClick={handleClearAll}
                >
                  Clear All
                </Index.Typography>
              </Index.Box>

              <Index.Box className="ecommerce-filter-item-box cus-scrollbar">
                {/* Categories Accordion */}
                <Index.Box className="ecommerce-filter-item">
                  <Index.Accordion defaultExpanded={true}>
                    <Index.AccordionSummary
                      expandIcon={<Index.ExpandMoreIcon />}
                      aria-controls="panel-cat-content"
                      id="panel-cat-header"
                    >
                      Categories
                    </Index.AccordionSummary>
                    <Index.AccordionDetails>
                      <Index.FormGroup>
                        {categories.map((cat) => (
                          <Index.FormControlLabel
                            key={cat._id}
                            control={
                              <Index.Checkbox
                                size="small"
                                checked={selectedCategory === cat._id}
                                onChange={() => handleCategorySelect(cat._id)}
                              />
                            }
                            label={`${cat.name}${
                              cat.productCount !== undefined
                                ? ` (${cat.productCount})`
                                : ""
                            }`}
                          />
                        ))}
                      </Index.FormGroup>
                    </Index.AccordionDetails>
                  </Index.Accordion>
                </Index.Box>

                {/* Price Range Accordion */}
                <Index.Box className="ecommerce-filter-item">
                  <Index.Accordion defaultExpanded={true}>
                    <Index.AccordionSummary
                      expandIcon={<Index.ExpandMoreIcon />}
                      aria-controls="panel-price-content"
                      id="panel-price-header"
                    >
                      Price
                    </Index.AccordionSummary>
                    <Index.AccordionDetails>
                      <Index.FormGroup>
                        {priceRanges.map((p, idx) => (
                          <Index.FormControlLabel
                            key={idx}
                            control={
                              <Index.Checkbox
                                size="small"
                                checked={selectedPriceRange === p.label}
                                onChange={() => handlePriceSelect(p.label)}
                              />
                            }
                            label={p.label}
                          />
                        ))}
                      </Index.FormGroup>
                    </Index.AccordionDetails>
                  </Index.Accordion>
                </Index.Box>
              </Index.Box>

              <Index.Box className="ecommerce-filter-action">
                <PagesIndex.Button
                  primary
                  onClick={() => {
                    fetchProducts();
                    setOpen(false);
                  }}
                >
                  Apply
                </PagesIndex.Button>
              </Index.Box>
            </Index.Box>

            <Index.Box className="ecommerce-main">
              {loading ? (
                <Index.Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "300px",
                    width: "100%",
                  }}
                >
                  <Index.CircularProgress sx={{ color: "#ffd400" }} />
                </Index.Box>
              ) : products.length > 0 ? (
                <Index.Box className="ecommerce-main-wrapper">
                  {products.map((item) => {
                    const imageUrl = item.image
                      ? `${ECOMMERCE_IMAGES_API_ENDPOINT}/${item.image}`
                      : PagesIndex.Png.ProductImg1;

                    return (
                      <PagesIndex.ProductCard
                        key={item._id}
                        Image={imageUrl}
                        Title={item.productName}
                        Desc={
                          item.description ||
                          item.category?.name ||
                          "Connplex Exclusive"
                        }
                        NewPrice={`₹${item.price || 0}`}
                        OldPrice={item.oldPrice ? `₹${item.oldPrice}` : ""}
                      />
                    );
                  })}
                </Index.Box>
              ) : (
                <Index.Box
                  sx={{
                    textAlign: "center",
                    padding: "60px 20px",
                    width: "100%",
                  }}
                >
                  <Index.Typography
                    variant="h6"
                    sx={{ color: "#8c8c8c", mb: 1 }}
                  >
                    No products found
                  </Index.Typography>
                  <Index.Typography variant="p" sx={{ color: "#595959" }}>
                    There are no approved products matching your selected
                    filters.
                  </Index.Typography>
                </Index.Box>
              )}
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Ecommerce;
