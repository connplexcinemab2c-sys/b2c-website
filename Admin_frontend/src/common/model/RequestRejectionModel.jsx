import Index from "../../container/Index";
import * as Yup from "yup";
import { style } from "../Search/Search";
import PagesIndex from "../../container/PagesIndex";


export const RejectionRemarkModal = ({
  open,
  handleClose,
  rowId,
  handleSubmit,
}) => {
  const initialValues = {
    id: rowId,
    remark: "",
    status: "Rejected",
  };

  const rejectionRemarkSchema = Yup.object().shape({
    remark: Yup.string().required("Please enter remark"),
  });


  return (
    <Index.Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="modal"
    >
      <Index.Box
        sx={style}
        className="modal-inner-main add-region-modal modal-inner"
      >
        <Index.Box className="modal-header">
          <Index.Typography
            id="modal-modal-title"
            className="modal-title"
            variant="h6"
            component="h2"
          >
            Add Rejection Remark
          </Index.Typography>
          <img
            src={PagesIndex.Svg.cancel}
            className="modal-close-icon"
            onClick={handleClose}
          />
        </Index.Box>

        <Index.Box className="modal-body add-remark-modal-body">
          <PagesIndex.Formik
            enableReinitialize
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={rejectionRemarkSchema}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <Index.Stack
                component="form"
                spacing={2}
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
              >
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Remark :
                  </Index.FormHelperText>
                  <Index.Box className="form-group d-flex-textarea">
                    <Index.TextareaAutosize
                      fullWidth
                      className="form-control form-text-area"
                      minRows={6}
                      maxRows={6}
                      name="remark"
                      placeholder="Enter remark"
                      value={values?.remark}
                      onChange={handleChange}
                    />
                  </Index.Box>
                  <Index.FormHelperText error>
                    {errors?.remark && touched?.remark ? errors?.remark : null}
                  </Index.FormHelperText>
                </Index.Box>

                <Index.Box className="modal-user-btn-flex">
                  <Index.Box className="discard-btn-main btn-main-primary">
                    <Index.Box className="common-button blue-button res-blue-button">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Discard
                      </Index.Button>

                      <Index.LoadingButton
                        type="submit"
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        loading={isSubmitting}
                        loadingPosition="center"
                      >
                        Submit
                      </Index.LoadingButton>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Stack>
            )}
          </PagesIndex.Formik>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
};