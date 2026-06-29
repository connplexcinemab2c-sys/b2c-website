import React, { useEffect, useState } from "react";
import Index from "../Index";
import PagesIndex from "../../container/PagesIndex";
import { Autocomplete, createFilterOptions } from "@mui/material";

const CinemaSelectionModal = ({
  open,
  handleClose,
  selectedWelcomeGift,
  fetchData,
}) => {
  const [cinemaList, setCinemaList] = useState([]);
  const [typedCinema, setTypedCinema] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [cinemaError, setCinemaError] = useState("");

  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);
  const handleCloseModal = () => {
    setTypedCinema("");
    setSelectedCinemaId("");
    setCinemaError("");
    handleClose();
  };
  const fetchCinemaList = async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ALL_CINEMAS,
        ""
      );
      if (res?.status === 200) {
        setCinemaList(res?.data);
      }
    } catch (error) {
      PagesIndex.toast.error("Failed to load cinema list");
    }
  };

  useEffect(() => {
    fetchCinemaList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typedCinema.trim()) {
      setCinemaError("Please select cinema");
      return;
    }

    const matchedCinema = cinemaList.find(
      (c) => c.cinemaName.toLowerCase() === typedCinema.toLowerCase()
    );

    if (!matchedCinema) {
      setCinemaError("Cinema not found");
      return;
    }

    // Valid
    setCinemaError("");

    try {
      const formData = {
        id: selectedWelcomeGift?._id,
        cinemaId: matchedCinema._id,
      };

      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.REDEEM_WELCOME_GIFT,
        formData,
        userToken
      );

      if (res?.status === 200) {
        PagesIndex.toast.success(res?.message);
        fetchData();
        handleCloseModal();
      } else {
        PagesIndex.toast.error(res?.message || "Failed to redeem welcome gift");
      }
    } catch (error) {
      console.log("Error submitting:", error);
    }
  };

  return (
    <Index.Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="select-city-modal-title"
      aria-describedby="select-city-modal-description"
      className="select-city-modal"
    >
      <Index.Box className="select-city-modal-inner">
        <Index.Box className="modal-inner cus-scrollbar">
          <form onSubmit={handleSubmit}>
            <Index.Box className="popular-city-box">
              <Index.Box className="popular-city-header">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="popular-city-title"
                >
                  Select Cinema
                </Index.Typography>
              </Index.Box>
              <Index.Box className="popular-city-wrapper-main cus-scrollbar">
                <Autocomplete
                  freeSolo
                  options={cinemaList}
                  getOptionLabel={(option) => option?.cinemaName || ""}
                  inputValue={typedCinema}
                  value={
                    cinemaList.find((item) => item._id === selectedCinemaId) ||
                    null
                  }
                  onInputChange={(event, newInputValue) => {
                    setTypedCinema(newInputValue);
                    const matched = cinemaList.find(
                      (c) =>
                        c.cinemaName.toLowerCase() ===
                        newInputValue.toLowerCase()
                    );
                    if (matched) {
                      setSelectedCinemaId(matched._id);
                      setCinemaError("");
                    } else {
                      setSelectedCinemaId("");
                      if (newInputValue.trim() !== "") {
                        setCinemaError("Cinema not found"); // ✅ Show error while typing
                      } else {
                        setCinemaError("Please select cinema"); // Optional for blank input
                      }
                    }
                  }}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setTypedCinema(newValue.cinemaName);
                      setSelectedCinemaId(newValue._id);
                      setCinemaError("");
                    } else {
                      setTypedCinema("");
                      setSelectedCinemaId("");
                    }
                  }}
                  className="select-city-input-autocomplete"
                  renderInput={(params) => (
                    <Index.TextField
                      {...params}
                      fullWidth
                      placeholder="Select Cinema"
                      className="admin-form-control"
                      error={!!cinemaError}
                    />
                  )}
                  filterOptions={createFilterOptions({
                    matchFrom: "any",
                    stringify: (option) => option.cinemaName,
                  })}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      {option.cinemaName}
                    </li>
                  )}
                  classes={{
                    option: "custom-autocomplete-dropdown",
                    listbox: "custom-autocomplete-dropdown-list",
                  }}
                />
                <Index.FormHelperText error>{cinemaError}</Index.FormHelperText>
              </Index.Box>

              <Index.Box className="select-cinema-btn-wrapper">
                <PagesIndex.Button
                  primary
                  className="save-button form-btn"
                  type="submit"
                >
                  Submit
                </PagesIndex.Button>
              </Index.Box>
            </Index.Box>
          </form>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
};

export default CinemaSelectionModal;

// import React, { useEffect, useState } from "react";
// import Index from "../Index";
// import PagesIndex from "../../container/PagesIndex";
// import { Autocomplete, createFilterOptions } from "@mui/material";

// const CinemaSelectionModal = ({
//   open,
//   handleClose,
//   selectedWelcomeGift,
//   fetchData,
// }) => {
//   const [cinemaList, setCinemaList] = useState([]);
//   const [typedCinema, setTypedCinema] = useState("");
//   const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);
//   const fetchCinemaList = async () => {
//     try {
//       const res = await PagesIndex.apiGetHandler(
//         PagesIndex.Api.GET_ALL_CINEMAS,
//         ""
//       );
//       if (res?.status === 200) {
//         setCinemaList(res?.data);
//       }
//     } catch (error) {
//       PagesIndex.toast.error("Failed to load cinema list");
//     }
//   };

//   const initialValues = {
//     cinema: "",
//   };
//   const handleSubmit = async (values, { setSubmitting },errors) => {
//     setSubmitting(true);
//     try {
//       const formData = {
//         id: selectedWelcomeGift?._id,
//         cinemaId: values?.cinema,
//       };
//       const res = await PagesIndex.apiPostHandler(
//         PagesIndex.Api.REDEEM_WELCOME_GIFT,
//         formData,
//         userToken
//       );
//       console.log(res, 154651);
//       if (res?.status === 200) {
//         PagesIndex.toast.success(res?.message);
//         fetchData();
//         handleClose();
//       } else {
//         PagesIndex.toast.error(res?.message || "Failed to redeem welcome gift");
//       }
//     } catch (error) {
//       console.log(error, "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   useEffect(() => {
//     fetchCinemaList();
//   }, []);

//   return (
//     <Index.Modal
//       open={open}
//       onClose={handleClose}
//       aria-labelledby="select-city-modal-title"
//       aria-describedby="select-city-modal-description"
//       className="select-city-modal"
//     >
//       <PagesIndex.Formik
//         enableReinitialize
//         onSubmit={handleSubmit}
//         initialValues={initialValues}
//         validationSchema={PagesIndex.redeemWelcomeGiftSchema}
//         //  context={{ cinemaList }}
//       >
//         {({
//           values,
//           errors,
//           touched,
//           handleChange,
//           handleBlur,
//           handleSubmit,
//           setFieldValue,
//           isSubmitting,
//           setFieldError,
//           setFieldTouched,

//         }) => (
//           <Index.Box className="select-city-modal-inner">
//             {console.log({ values, errors }, 1231)}
//             <Index.Box className="modal-inner cus-scrollbar">
//               <form onSubmit={handleSubmit}>
//                 <Index.Box className="popular-city-box">
//                   <Index.Box className="popular-city-header">
//                     <Index.Typography
//                       variant="p"
//                       component="p"
//                       className="popular-city-title"
//                     >
//                       Select Cinema
//                     </Index.Typography>
//                   </Index.Box>
//                   <Index.Box className="popular-city-wrapper-main cus-scrollbar">
//                     <Autocomplete
//                       freeSolo
//                       options={cinemaList || []}
//                       getOptionLabel={(option) => option?.cinemaName || ""}
//                       value={
//                         cinemaList?.find(
//                           (item) => item?._id === values?.cinema
//                         ) || null
//                       }
//                       onInputChange={(event, newInputValue, reason) => {
//                         setTypedCinema(newInputValue);
//                         setFieldTouched("cinema", true, false); // mark field as touched

//                         const matchedCinema = cinemaList.find(
//                           (c) =>
//                             c.cinemaName.toLowerCase() ===
//                             newInputValue.toLowerCase()
//                         );
// console.log(matchedCinema, "matchedCinema");
//                         if (!matchedCinema && newInputValue.trim() !== "") {
//                           // Invalid entry
//                           setFieldError("cinema", "Cinema not found");
//                           setFieldValue("cinema", ""); // clear the value
//                         } else if (matchedCinema) {
//                           setFieldValue("cinema", matchedCinema._id);
//                           setFieldError("cinema", undefined); // clear error
//                         }
//                         // else {
//                         //   setFieldValue("cinema", "");
//                         //   setFieldError("cinema", "Please select cinema");
//                         // }
//                       }}
//                         onBlur={(e) => {
//     // If value is still empty after blur
//     if (!values.cinema) {
//       setFieldError("cinema", "Please select cinema");
//     }
//   }}

//                       onChange={(event, newValue) => {
//                         // if (newValue) {
//                           setFieldValue("cinema", newValue._id ||"");
//                           // setFieldError("cinema", undefined); // clear error
//                         // }
//                       }}
//                       className="select-city-input-autocomplete"
//                       renderInput={(params) => (
//                         <Index.TextField
//                           {...params}
//                           fullWidth
//                           id="cinema"
//                           className="admin-form-control"
//                           placeholder="Select Cinema"
//                           autoComplete="off"
//                           name="cinema"
//                           onBlur={handleBlur}
//                           error={touched?.cinema && Boolean(errors?.cinema)}
//                         />
//                       )}
//                       filterOptions={createFilterOptions({
//                         matchFrom: "any",
//                         stringify: (option) => option.cinemaName,
//                       })}
//                       renderOption={(props, option) => (
//                         <li {...props} key={option._id}>
//                           {option.cinemaName}
//                         </li>
//                       )}
//                       classes={{
//                         option: "custom-autocomplete-dropdown",
//                         listbox: "custom-autocomplete-dropdown-list",
//                       }}
//                     />

//                     <Index.FormHelperText error>
//                       {errors.cinema && touched.cinema ? errors.cinema : null}
//                     </Index.FormHelperText>
//                   </Index.Box>
//                   <Index.Box className="select-cinema-btn-wrapper">
//                     <PagesIndex.Button
//                       primary
//                       className="save-button form-btn"
//                       type="submit"
//                       disabled={isSubmitting}
//                     >
//                       Submit
//                     </PagesIndex.Button>
//                   </Index.Box>
//                 </Index.Box>
//               </form>
//             </Index.Box>
//           </Index.Box>
//         )}
//       </PagesIndex.Formik>
//     </Index.Modal>
//   );
// };

// export default CinemaSelectionModal;
