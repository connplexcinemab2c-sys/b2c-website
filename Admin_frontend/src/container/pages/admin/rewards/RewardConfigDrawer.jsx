import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import moment from "moment";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { rewardConfigSchema } from "../../../../validation/FormikValidation";

const defaultValues = {
  earnRate: "10",
  conversionPoints: "100",
  conversionValue: "10",
  maxRedemptionCap: "1000",
  expiryRule: "fixed",
  expiryDays: "90",
  expiringSoonDays: "30",
  fixedExpiryDate: null,
};

const sectionLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9e9e9e",
  letterSpacing: 1.2,
  textTransform: "uppercase",
  mb: 1.5,
  mt: 0.5,
};

const fieldLabel = {
  fontSize: 12,
  color: "#555",
  mb: 0.5,
  fontFamily: "poppins-medium",
};

const toStr = (val) => (val !== undefined && val !== null ? String(val) : "");

const RewardConfigDrawer = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema: rewardConfigSchema,
    onSubmit: (values, { setSubmitting }) => {
      PagesIndex.DataService.post(PagesIndex.Api.SAVE_REWARD_CONFIG, {
        earnRate: Number(values.earnRate),
        conversionPoints: Number(values.conversionPoints),
        conversionValue: Number(values.conversionValue),
        maxRedemptionCap: Number(values.maxRedemptionCap),
        expiryRule: values.expiryRule,
        expiryDays: Number(values.expiryDays),
        expiringSoonDays: Number(values.expiringSoonDays),
      })
        .then((res) => {
          PagesIndex.toast.success(res?.data?.message);
          onClose();
        })
        .catch((err) => {
          PagesIndex.toast.error(
            err?.response?.data?.message ||
              "Failed to save reward configuration."
          );
        })
        .finally(() => setSubmitting(false));
    },
  });

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = () => {
    setLoading(true);
    PagesIndex.DataService.get(PagesIndex.Api.GET_REWARD_CONFIG)
      .then((res) => {
        const d = res?.data?.data;
        if (d) {
          formik.resetForm({
            values: {
              earnRate: toStr(d.earnRate),
              conversionPoints: toStr(d.conversionPoints),
              conversionValue: toStr(d.conversionValue),
              maxRedemptionCap: toStr(d.maxRedemptionCap),
              expiryRule: d.expiryRule || "fixed",
              expiryDays: toStr(d.expiryDays),
              expiringSoonDays: toStr(d.expiringSoonDays),
              fixedExpiryDate: d.fixedExpiryDate || null,
            },
          });
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(
          err?.response?.data?.message ||
            "Failed to load reward configuration."
        );
      })
      .finally(() => setLoading(false));
  };

  const handleNumericChange = (field, maxLength) => (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLength);
    formik.setFieldValue(field, raw);
  };

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Index.Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 350,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <Index.Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        <Index.Typography
          sx={{ fontSize: 15, fontFamily: "poppins-medium", color: "#222" }}
        >
          Site Settings: Rewards
        </Index.Typography>
        <Index.IconButton size="small" onClick={onClose}>
          <Index.ClearIcon fontSize="small" />
        </Index.IconButton>
      </Index.Box>

      {/* Scrollable Body */}
      <Index.Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}
      >
        {loading ? (
          <Index.Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <Index.CircularProgress size={32} sx={{ color: "#c09a42" }} />
          </Index.Box>
        ) : (
          <>
            {/* ─── REWARD RULES ─────────────────────── */}
            <Index.Typography sx={sectionLabel}>Reward Rules</Index.Typography>

            {/* Earn Rate */}
            <Index.Box sx={{ mb: 2 }}>
              <Index.Typography sx={fieldLabel}>Earn Rate (%)</Index.Typography>
              <Index.TextField
                fullWidth
                size="small"
                name="earnRate"
                value={formik.values.earnRate}
                onChange={handleNumericChange("earnRate", 3)}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.errors.earnRate && formik.touched.earnRate
                )}
                InputProps={{
                  endAdornment: (
                    <Index.InputAdornment position="end">%</Index.InputAdornment>
                  ),
                }}
              />
              <Index.FormHelperText error>
                {formik.errors.earnRate && formik.touched.earnRate
                  ? formik.errors.earnRate
                  : null}
              </Index.FormHelperText>
            </Index.Box>

            {/* Conversion Points + Value side by side */}
            <Index.Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
              <Index.Box sx={{ flex: 1 }}>
                <Index.Typography sx={fieldLabel}>
                  Conversion (Points)
                </Index.Typography>
                <Index.TextField
                  fullWidth
                  size="small"
                  name="conversionPoints"
                  value={formik.values.conversionPoints}
                  onChange={handleNumericChange("conversionPoints", 6)}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.errors.conversionPoints &&
                      formik.touched.conversionPoints
                  )}
                />
                <Index.FormHelperText error>
                  {formik.errors.conversionPoints &&
                  formik.touched.conversionPoints
                    ? formik.errors.conversionPoints
                    : null}
                </Index.FormHelperText>
              </Index.Box>
              <Index.Box sx={{ flex: 1 }}>
                <Index.Typography sx={fieldLabel}>Value (₹)</Index.Typography>
                <Index.TextField
                  fullWidth
                  size="small"
                  name="conversionValue"
                  value={formik.values.conversionValue}
                  onChange={handleNumericChange("conversionValue", 6)}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.errors.conversionValue &&
                      formik.touched.conversionValue
                  )}
                />
                <Index.FormHelperText error>
                  {formik.errors.conversionValue &&
                  formik.touched.conversionValue
                    ? formik.errors.conversionValue
                    : null}
                </Index.FormHelperText>
              </Index.Box>
            </Index.Box>

            {/* Max Redemption Cap */}
            <Index.Box sx={{ mb: 3 }}>
              <Index.Typography sx={fieldLabel}>
                Max Redemption Cap (Points)
              </Index.Typography>
              <Index.TextField
                fullWidth
                size="small"
                name="maxRedemptionCap"
                value={formik.values.maxRedemptionCap}
                onChange={handleNumericChange("maxRedemptionCap", 7)}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.errors.maxRedemptionCap &&
                    formik.touched.maxRedemptionCap
                )}
              />
              <Index.FormHelperText error>
                {formik.errors.maxRedemptionCap &&
                formik.touched.maxRedemptionCap
                  ? formik.errors.maxRedemptionCap
                  : null}
              </Index.FormHelperText>
            </Index.Box>

            {/* ─── POINTS EXPIRY CONFIGURATION ──────── */}
            <Index.Typography sx={sectionLabel}>
              Points Expiry Configuration
            </Index.Typography>

            {/* Expiry Rule */}
            <Index.Box sx={{ mb: 1 }}>
              <Index.Typography sx={fieldLabel}>Expiry Rule</Index.Typography>
              <Index.RadioGroup
                row
                name="expiryRule"
                value={formik.values.expiryRule}
                onChange={(e) =>
                  formik.setFieldValue("expiryRule", e.target.value)
                }
              >
                <Index.FormControlLabel
                  value="fixed"
                  control={
                    <Index.Radio
                      size="small"
                      sx={{
                        color: "#c09a42",
                        "&.Mui-checked": { color: "#c09a42" },
                      }}
                    />
                  }
                  label={
                    <Index.Typography sx={{ fontSize: 13 }}>
                      Fixed Duration
                    </Index.Typography>
                  }
                />
                <Index.FormControlLabel
                  value="rolling"
                  control={
                    <Index.Radio
                      size="small"
                      sx={{
                        color: "#c09a42",
                        "&.Mui-checked": { color: "#c09a42" },
                      }}
                    />
                  }
                  label={
                    <Index.Typography sx={{ fontSize: 13 }}>
                      Rolling Expiry
                    </Index.Typography>
                  }
                />
              </Index.RadioGroup>
              <Index.FormHelperText error>
                {formik.errors.expiryRule && formik.touched.expiryRule
                  ? formik.errors.expiryRule
                  : null}
              </Index.FormHelperText>
            </Index.Box>

            {/* Expiry Duration */}
            <Index.Box sx={{ mb: 2 }}>
              <Index.Typography sx={fieldLabel}>
                {formik.values.expiryRule === "fixed"
                  ? "Fixed Duration — applies to all reward points (Days)"
                  : "Rolling Window — resets on each transaction (Days)"}
              </Index.Typography>
              <Index.TextField
                fullWidth
                size="small"
                name="expiryDays"
                value={formik.values.expiryDays}
                onChange={handleNumericChange("expiryDays", 4)}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.errors.expiryDays && formik.touched.expiryDays
                )}
                InputProps={{
                  endAdornment: (
                    <Index.InputAdornment position="end">Days</Index.InputAdornment>
                  ),
                }}
              />
              <Index.FormHelperText error>
                {formik.errors.expiryDays && formik.touched.expiryDays
                  ? formik.errors.expiryDays
                  : null}
              </Index.FormHelperText>
            </Index.Box>

            {/* Fixed expiry date info banner */}
            {formik.values.expiryRule === "fixed" && (
              <Index.Box
                sx={{
                  background: "#fff8e1",
                  border: "1px solid #ffe082",
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  mb: 2,
                }}
              >
                <Index.Typography sx={{ fontSize: 11, color: "#8a6900" }}>
                  {formik.values.fixedExpiryDate
                    ? `All points will expire on: ${moment(formik.values.fixedExpiryDate).format("DD MMM YYYY")}`
                    : `All points will expire ${formik.values.expiryDays || "—"} days after saving this config.`}
                </Index.Typography>
              </Index.Box>
            )}

            {/* Admin Visibility — Expiring Soon Threshold */}
            <Index.Box sx={{ mb: 2 }}>
              <Index.Typography sx={fieldLabel}>
                Admin Visibility — Expiring Soon Points (Days)
              </Index.Typography>
              <Index.Typography
                sx={{ fontSize: 11, color: "#9e9e9e", mb: 0.75 }}
              >
                Flag points in admin view that expire within this many days
              </Index.Typography>
              <Index.TextField
                fullWidth
                size="small"
                name="expiringSoonDays"
                value={formik.values.expiringSoonDays}
                onChange={handleNumericChange("expiringSoonDays", 3)}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.errors.expiringSoonDays &&
                    formik.touched.expiringSoonDays
                )}
                InputProps={{
                  endAdornment: (
                    <Index.InputAdornment position="end">Days</Index.InputAdornment>
                  ),
                }}
              />
              <Index.FormHelperText error>
                {formik.errors.expiringSoonDays &&
                formik.touched.expiringSoonDays
                  ? formik.errors.expiringSoonDays
                  : null}
              </Index.FormHelperText>
            </Index.Box>
          </>
        )}
      </Index.Box>

      {/* Footer */}
      <Index.Box
        sx={{
          px: 2,
          py: 2,
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          gap: 1.5,
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Index.Button
          variant="outlined"
          onClick={handleCancel}
          disabled={formik.isSubmitting}
          sx={{
            borderColor: "#bbb",
            color: "#555",
            textTransform: "none",
            fontFamily: "poppins-medium",
            "&:hover": { borderColor: "#999", background: "#f5f5f5" },
          }}
        >
          Cancel
        </Index.Button>
        <Index.Button
          variant="contained"
          type="submit"
          onClick={formik.handleSubmit}
          disabled={formik.isSubmitting || loading}
          sx={{
            background: "#c09a42",
            color: "#fff",
            textTransform: "none",
            fontFamily: "poppins-medium",
            boxShadow: "none",
            minWidth: 110,
            "&:hover": { background: "#a8843a", boxShadow: "none" },
          }}
        >
          {formik.isSubmitting ? (
            <Index.CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Save Changes"
          )}
        </Index.Button>
      </Index.Box>
    </Index.Drawer>
  );
};

export default RewardConfigDrawer;
