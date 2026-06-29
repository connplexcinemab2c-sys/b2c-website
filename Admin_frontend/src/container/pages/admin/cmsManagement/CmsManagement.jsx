import { useRef, useState, useEffect } from "react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import PagesIndex from "../../../PagesIndex";
import Index from "../../../Index";
import "./CmsManagement.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";

const CmsManagement = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );

  const dispatch = useDispatch();

  const initialValues = {
    aboutUs: "",
    cmsText: "",
  };

  const params = PagesIndex.useParams();
  const { id } = params;

  const formik = useRef();
  const [cmsText, setCmsText] = useState("<p>Enter Text</p>");
  const [about, setAbout] = useState("<p>Enter Text</p>");

  useEffect(() => {
    getCMSData();
  }, [id]);

  const getCMSData = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_CMS)
      .then((res) => {
        if (id == 0) setCmsText(res?.data?.data?.privacyPolicy);
        if (id == 1) setCmsText(res?.data?.data?.termsCondition);
        if (id == 2) setCmsText(res?.data?.data?.refundPolicy);
        if (id == 3) {
          setCmsText(res?.data?.data?.aboutUs);
          setAbout(res?.data?.data?.aboutUs);
        }
        if (id == 4) setCmsText(res?.data?.data?.legal_notice);

        // ⭐ Membership Terms & Conditions
        if (id == 5)
          setCmsText(res?.data?.data?.membership_terms_and_conditions);
      })
      .catch((err) => {
        window.location.href = "/admin/dashboard";
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const handleSliderSubmit = async () => {
    const payLoad = {
      cmsType: id,
      description: cmsText,
    };

    await PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_CMS, payLoad)
      .then((res) => {
        if (res?.status === 200) {
          PagesIndex.toast.success(res.data.message);
          getCMSData();
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  if (
    adminLoginData?.type === "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("cms_view")
  ) {
    return (
      <>
        <Index.Box className="barge-common-box cms-box">
          <Index.Box className="title-header">
            <Index.Box className="res-title-header-flex">
              <Index.Box className="title-main">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  {id == 0
                    ? "Privacy Policy"
                    : id == 1
                    ? "Term & Conditions"
                    : id == 2
                    ? "Refund Policy"
                    : id == 3
                    ? "About Us"
                    : id == 4
                    ? "Legal Notice"
                    : id == 5
                    ? "Membership Terms & Conditions"
                    : ""}
                </Index.Typography>
              </Index.Box>

              <PagesIndex.Formik
                enableReinitialize
                onSubmit={handleSliderSubmit}
                initialValues={initialValues}
                validationSchema={
                  id === 3 && about === "" && about?.length > 675
                    ? PagesIndex.aboutUsCmsSchema
                    : PagesIndex.cmsSchema
                }
                innerRef={formik}
              >
                {({
                  errors,
                  handleSubmit,
                  setFieldValue,
                }) => (
                  <Index.Stack component="form" onSubmit={handleSubmit}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={cmsText}
                      config={{
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "blockQuote",
                          "|",
                          "numberedList",
                          "bulletedList",
                          "|",
                          "undo",
                          "redo",
                        ],
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFieldValue("aboutUs", data);
                        setFieldValue("cmsText", data);
                        setCmsText(data);
                      }}
                    />

                    <Index.FormHelperText error>
                      {errors.aboutUs ? errors.aboutUs : null}
                    </Index.FormHelperText>

                    <Index.FormHelperText error>
                      {errors.cmsText ? errors.cmsText : null}
                    </Index.FormHelperText>

                    {adminLoginData?.roleId?.permissions?.includes(
                      "cms_edit"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button cms-save-btn">
                        <Index.Button
                          type="submit"
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                        >
                          <img
                            src={PagesIndex.Svg.save}
                            className="user-save-icon"
                            alt="save"
                          />
                          Save
                        </Index.Button>
                      </Index.Box>
                    )}
                  </Index.Stack>
                )}
              </PagesIndex.Formik>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default CmsManagement;
