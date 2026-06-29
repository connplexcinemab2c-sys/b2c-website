import React from "react";
import Index from "../Index";

export default function Button({
  className,
  children,
  primary,
  secondary,
  ...otherProps
}) {
  return (
    children &&
    (primary ? (
      <Index.Button className={className + " btn btn-primary"} {...otherProps}>
        {children}
      </Index.Button>
    ) : secondary ? (
      <Index.Button
        className={className + " btn btn-secondary"}
        {...otherProps}
      >
        {children}
      </Index.Button>
    ) : (
      <Index.Button className={className + " btn"} {...otherProps}>
        {children}
      </Index.Button>
    ))
  );
}
