import React, { useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import ComingSoon from "../comingSoon/ComingSoon";

function Ecommerce() {
  const [sortBy, setSortBy] = useState("");
  const [open, setOpen] = useState(false);

  const handleChangeSortBy = (event) => {
    setSortBy(event.target.value);
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  const ecommerceItem = [
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
    {
      card: PagesIndex.ProductCard,
      img: PagesIndex.Png.ProductImg1,
      title: "Printed white tshirt",
      desc: "Connplex movie lover",
      newPrice: "₹300",
      oldPrice: "₹400",
    },
  ];

  const filterItem = [
    {
      title: "Products",
      defaultOpen: true,
      children: [
        {
          label: "T-Shirts",
          checked: true,
        },
        {
          label: "Caps",
        },
        {
          label: "Covers",
        },
        {
          label: "Goggles",
        },
      ],
    },
    {
      title: "Brands",
      defaultOpen: true,
      children: [
        {
          label: "Connplex",
          checked: true,
        },
        {
          label: "Other",
        },
      ],
    },
    {
      title: "Price",
      defaultOpen: false,
      children: [
        {
          label: "₹0 - ₹300",
        },
        {
          label: "₹300 - ₹1000",
        },
        {
          label: "₹1000 - ₹2000",
        },
      ],
    },
  ];

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
        {/* <ComingSoon /> */}
        <Index.Box className="ecommerce-bottom">
          <Index.Box className="ecommerce-sortby">
            <Index.Box className="ecommerce-filter-selected">
              <Index.Box className={open ? "ecommerce-mobile-filter open" : "ecommerce-mobile-filter"} onClick={handleOpen}>
                <Index.FilterAltIcon />
              </Index.Box>
              <Index.Box className="filter-selected-item">
                T-Shirts
                <Index.CloseIcon />
              </Index.Box>
              <Index.Box className="filter-selected-item">
                Connplex
                <Index.CloseIcon />
              </Index.Box>
              <Index.Box className="filter-selected-item clear-all">
                Clear All
              </Index.Box>
            </Index.Box>
            <Index.Box className="ecommerce-filter-sortby">
              <Index.Select
                className="sortby-select "
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
            <Index.Box className={open ? "ecommerce-filter open" : "ecommerce-filter"}>
              <Index.Box className="ecommerce-filter-title">
                Filter
                <Index.Typography variant="span" className="ecommerce-clear-all">
                  Clear All
                </Index.Typography>
              </Index.Box>
              <Index.Box className="ecommerce-filter-item-box cus-scrollbar">
                {filterItem.map((item, key) => (
                  <Index.Box className="ecommerce-filter-item" key={key}>
                    <Index.Accordion defaultExpanded={item.defaultOpen}>
                      <Index.AccordionSummary
                        expandIcon={<Index.ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        {item.title}
                      </Index.AccordionSummary>
                      <Index.AccordionDetails>
                        <Index.FormGroup>
                          {item.children.map((res, key) => (
                            <Index.FormControlLabel
                              key={key}
                              control={
                                <Index.Checkbox
                                  size="small"
                                  checked={res.checked}
                                />
                              }
                              label={res.label}
                            />
                          ))}
                        </Index.FormGroup>
                      </Index.AccordionDetails>
                    </Index.Accordion>
                  </Index.Box>
                ))}
              </Index.Box>
              <Index.Box className="ecommerce-filter-action">
                <PagesIndex.Button primary>
                  Apply
                </PagesIndex.Button>
              </Index.Box>
            </Index.Box>
            <Index.Box className="ecommerce-main">
              <Index.Box className="ecommerce-main-wrapper">
                {ecommerceItem.map((item, key) => (
                  <item.card
                    key={key}
                    Image={item.img}
                    Title={item.title}
                    Desc={item.desc}
                    NewPrice={item.newPrice}
                    OldPrice={item.oldPrice}
                  />
                ))}
              </Index.Box>
              <Index.Box className="ecommerce-load-more">
                <PagesIndex.Button secondary className="">
                  Load More
                </PagesIndex.Button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Ecommerce;
