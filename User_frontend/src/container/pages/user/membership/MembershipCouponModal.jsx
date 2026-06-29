import React, { useEffect } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

const MembershipCouponModal = ({
  open,
  handleClose,
  selectedMembership,
  displayRazorpay,
  btnLoading = false,
  setbtnLoading,
  appliedCoupon,
  setAppliedCoupon,
}) => {
  const { userToken, isLoggedIn } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const [couponCode, setCouponCode] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [finalAmount, setFinalAmount] = React.useState(0);
  const [discount, setDiscount] = React.useState(0);

  const price = selectedMembership?.isDiscounted
    ? selectedMembership.discountedPrice
    : selectedMembership?.price || 0;

  const handleApplyCoupon = async () => {
    try {
      const response = await PagesIndex.apiPostHandler(
        PagesIndex.Api.VERIFY_MEMBERSHIP_COUPON,
        { couponCode, subscriptionId: selectedMembership?._id },
        userToken
      );
      if (response?.status === 200) {
        setAppliedCoupon(couponCode);
        setFinalAmount(response?.data?.finalAmount);
        setDiscount(response?.data?.totalDiscount);
        PagesIndex.toast.success(response?.message);
        setCouponError("");
      } else {
        setCouponError(response.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error verifying coupon:", error);
      setCouponError("Something went wrong. Please try again.");
    }
  };

  const handleModalClose = () => {
    setCouponCode("");
    setCouponError("");
    setAppliedCoupon(null);
    setDiscount(0);
    handleClose();
    setbtnLoading(false);
    setFinalAmount(price);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setDiscount(0);
    setFinalAmount(price);
    setbtnLoading(false);
    PagesIndex.toast.success("Coupon removed successfully");
  };

  useEffect(() => {
    if (selectedMembership) {
      setFinalAmount(
        selectedMembership.isDiscounted
          ? selectedMembership.discountedPrice
          : selectedMembership.price || 0
      );
    }
  }, [selectedMembership]);

  return (
    <Index.Modal open={open} onClose={handleModalClose}>
      <Index.Box
        className="membership-coupon-modal"
        sx={{
          width: { xs: "95%", sm: "90%", md: "80%", lg: "900px" },
          maxWidth: "100vw",
          maxHeight: "95vh",
          borderRadius: { xs: 1, sm: 2 },
          p: { xs: 2, sm: 3 },
          mx: "auto",
          my: { xs: 2, md: "5vh" },
          top: { xs: "auto", md: "50%" },
          transform: { md: "translateY(-50%)" },
          position: "relative",
          boxShadow: 24,
          overflowY: "auto",
          bgcolor: "#1e1e1e",
        }}
      >
        {/* ==== MAIN GRID ==== */}
        <Index.Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 2, md: 4 },
          }}
        >
          {/* ==== LEFT SECTION ==== */}
          <Index.Box>
            {/* Title */}
            <Index.Typography
              variant="h6"
              sx={{
                mb: 1.5,
                color: "white",
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" },
                fontWeight: 600,
              }}
            >
              {selectedMembership?.title
                ? selectedMembership.title.charAt(0).toUpperCase() +
                  selectedMembership.title.slice(1).toLowerCase()
                : "-"}
            </Index.Typography>

            {/* Description */}
            <Index.Typography
              variant="body2"
              sx={{
                mb: 2,
                color: "gray",
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                lineHeight: 1.4,
              }}
            >
              {selectedMembership?.title === "platinum"
                ? "Enjoy exclusive benefits like free tickets and VIP access"
                : selectedMembership?.title === "gold"
                ? "Unlock special discounts and perks for a premium movie experience"
                : "Get started with basic savings and rewards"}
            </Index.Typography>

            {/* Price */}
            <Index.Box sx={{ mb: 2 }}>
              <Index.Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                  fontWeight: 700,
                }}
              >
                ₹{" "}
                {selectedMembership?.isDiscounted ? (
                  <>
                    <span
                      style={{
                        textDecoration: "line-through",
                        marginRight: 8,
                        opacity: 0.6,
                        fontSize: "0.85em",
                      }}
                    >
                      {selectedMembership?.price}
                    </span>
                    <span>{selectedMembership?.discountedPrice}</span>
                  </>
                ) : (
                  selectedMembership?.price
                )}
              </Index.Typography>
            </Index.Box>

            {/* Benefits */}
            <Index.Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              {[
                {
                  label: `Upto ${selectedMembership?.discountOnTicketUpTo}% Discount on Tickets`,
                  active: selectedMembership?.discountOnTicketUpTo,
                },
                {
                  label: `Upto ${selectedMembership?.coins}% Coins (Earn rewards)`,
                  active: selectedMembership?.coins,
                },
                {
                  label: "Welcome Gift: Special surprise when you join.",
                  active: selectedMembership?.welcomeGift === "Yes",
                },
              ].map((benefit, i) => (
                <Index.Typography
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: benefit.active ? "success.main" : "text.disabled",
                  }}
                >
                  {benefit.active ? (
                    <Index.CheckIcon sx={{ mr: 0.75, fontSize: 16 }} />
                  ) : (
                    <Index.ClearIcon
                      sx={{ mr: 0.75, fontSize: 16, color: "error.main" }}
                    />
                  )}
                  {benefit.label}
                </Index.Typography>
              ))}
            </Index.Box>
          </Index.Box>

          {/* ==== RIGHT SECTION ==== */}
          <Index.Box
            sx={{
              bgcolor: "#252525",
              borderRadius: { xs: 1, sm: 2 },
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { xs: "auto", md: "340px" },
            }}
          >
            {/* Coupon Entry */}
            <Index.Box>
              {!appliedCoupon ? (
                <>
                  <Index.TextField
                    fullWidth
                    id="promoCode"
                    placeholder="Enter your Promocode"
                    value={couponCode}
                    onChange={(e) => {
                      const newValue = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");
                      if (newValue.length <= 12) {
                        setCouponCode(newValue);
                        setCouponError("");
                      }
                    }}
                    sx={{
                      mb: 1.5,
                      input: {
                        color: "white",
                        background: "#333",
                        borderRadius: 1,
                        px: 1,
                        py: 0.75,
                      },
                    }}
                  />
                  <PagesIndex.Button
                    fullWidth
                    primary
                    sx={{ py: 1.2 }}
                    onClick={() => {
                      if (couponCode === "") {
                        setCouponError("Please enter promocode");
                      } else {
                        handleApplyCoupon();
                      }
                    }}
                  >
                    Apply
                  </PagesIndex.Button>
                </>
              ) : (
                <Index.Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Index.Typography sx={{ color: "lightgreen" }}>
                    Coupon Applied: {appliedCoupon}
                  </Index.Typography>
                  <PagesIndex.Button size="small" onClick={handleRemoveCoupon}>
                    Remove
                  </PagesIndex.Button>
                </Index.Box>
              )}
              {couponError && (
                <Index.FormHelperText error sx={{ mt: 0.5 }}>
                  {couponError}
                </Index.FormHelperText>
              )}
            </Index.Box>

            {/* Footer note */}
            <Index.Typography
              variant="caption"
              sx={{
                mt: 2,
                color: "gray",
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Membership Plan is currently applicable only through the CONNPLEX
              Website and Mobile App.
            </Index.Typography>

            {/* Summary & CTA */}
            <Index.Box sx={{ mt: 3, color: "white" }}>
              {appliedCoupon && (
                <>
                  <Index.Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    }}
                  >
                    <span>Subtotal</span>
                    <span>₹{price.toFixed(2)}</span>
                  </Index.Box>
                  <Index.Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    }}
                  >
                    <span>Discount</span>
                    <span>- ₹{discount || 0}</span>
                  </Index.Box>
                </>
              )}

              <Index.Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  mt: 1.5,
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                }}
              >
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </Index.Box>

              <PagesIndex.Button
                fullWidth
                disabled={btnLoading || finalAmount < 0}
                sx={{
                  mt: 2.5,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  borderRadius: 2,
                  color: "#FFFFFF",
                  border: "1px solid #fff",
                  transition: "all 0.3s ease",
                  "&:disabled": {
                    opacity: 0.6,
                    cursor: "not-allowed",
                  },
                }}
                onClick={() => {
                  isLoggedIn
                    ? displayRazorpay({
                        couponCode,
                        membershipId: selectedMembership?._id,
                      })
                    : signInOpen();
                }}
              >
                {btnLoading
                  ? "Processing..."
                  : `Proceed${finalAmount > 0 ? " To Pay" : ""}`}
              </PagesIndex.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
};

export default MembershipCouponModal;