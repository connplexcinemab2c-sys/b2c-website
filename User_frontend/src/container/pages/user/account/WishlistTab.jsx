import React from 'react'
import Index from '../../../Index';
import PagesIndex from '../../../PagesIndex';

function WishlistTab() {

    const wishlistItem = [
        {
            id: 1,
            card: PagesIndex.ProductCard,
            img: PagesIndex.Png.ProductImg1,
            title: "Printed white tshirt",
            desc: "Connplex movie lover",
            newPrice: "₹300",
            oldPrice: "₹400",
        },
        {
            id: 2,
            card: PagesIndex.ProductCard,
            img: PagesIndex.Png.ProductImg1,
            title: "Printed white tshirt",
            desc: "Connplex movie lover",
            newPrice: "₹300",
            oldPrice: "₹400",
        },
        {
            id: 3,
            card: PagesIndex.ProductCard,
            img: PagesIndex.Png.ProductImg1,
            title: "Printed white tshirt",
            desc: "Connplex movie lover",
            newPrice: "₹300",
            oldPrice: "₹400",
        },
        {
            id: 4,
            card: PagesIndex.ProductCard,
            img: PagesIndex.Png.ProductImg1,
            title: "Printed white tshirt",
            desc: "Connplex movie lover",
            newPrice: "₹300",
            oldPrice: "₹400",
        },
        {
            id: 5,
            card: PagesIndex.ProductCard,
            img: PagesIndex.Png.ProductImg1,
            title: "Printed white tshirt",
            desc: "Connplex movie lover",
            newPrice: "₹300",
            oldPrice: "₹400",
        },
    ]
    
    return (
        <Index.Box className="account-tab-wishlist">
            <Index.Box className="account-tab-heading-box">
                <Index.Typography component="span" className="account-tab-heading">
                    My Wishlist
                </Index.Typography>
            </Index.Box>
            <Index.Box className="wishlist-main">
                <Index.Box className="wishlist-main-wrapper">
                    {wishlistItem.map((item, key) => (
                        <item.card key={item?.id} Image={item.img} Title={item.title} Desc={item.desc} NewPrice={item.newPrice} OldPrice={item.oldPrice} />
                    ))}
                </Index.Box>
                {/* <Index.Box className="wishlist-load-more">
                    <PagesIndex.Button primary className="">
                        Load More
                    </PagesIndex.Button>
                </Index.Box> */}
            </Index.Box>
            {/* <Index.Box className="no-found-svg-box">
                <Index.Favorite />
                You don't seem to have any Wishlist item.
            </Index.Box> */}
        </Index.Box>
    )
}

export default WishlistTab