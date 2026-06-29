import React from "react";
import Index from "../Index";
import PagesIndex from "../PageIndex";

const ApproveModal = (props) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
  };
  return (
    <Index.Modal
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="modal-delete modal"
    >
      <Index.Box sx={style} className="delete-modal-inner-main modal-inner">
        {/* <Index.Box className="modal-circle-main">
          <img
            src={PagesIndex.Svg.close}
            className="user-circle-img"
            alt="icon"
          />
        </Index.Box> */}
        <Index.Typography
          className="delete-modal-title"
          component="h2"
          variant="h2"
        >
          Are you sure?
        </Index.Typography>
        <Index.Typography
          className="delete-modal-para common-para"
          component="p"
          variant="p"
        >
          Do you really want to approve this record?
        </Index.Typography>
        <Index.Box className="delete-modal-btn-flex">
          <Index.Button
            className="modal-cancel-btn modal-btn"
            onClick={props.handleClose}
          >
            Cancel
          </Index.Button>
          <Index.Button
            className="modal-delete-btn modal-btn"
            onClick={props.handleSubmit}
            // disabled={props.isDisable}
          >
            Approve
          </Index.Button>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
};

export default ApproveModal;
