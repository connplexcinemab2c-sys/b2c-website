import React from "react";
import Index from "../Index";

export default function TrailerModal({ open, onClose, link }) {
  return (
    <Index.Modal
      open={open}
      onClose={onClose}
      aria-labelledby="trailer-modal-title"
      aria-describedby="trailer-modal-description"
      className="trailer-modal"
    >
      <Index.Box className="trailer-modal-inner modal-inner">
        <Index.Box className="trailer-modal-box">
          <iframe
            src={`https://www.youtube.com/embed/${
              link?.includes("watch?")
                ? link?.split("=")[1]
                : link?.split("/")[3]
            }?autoplay=1&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
}
