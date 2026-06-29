import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

function TransactionFailed() {
  const location = PagesIndex.useLocation();
  const transId = new URLSearchParams(location.search).get("transId");
  return (
    <>
    <Index.Box className="main-transaction-failed">
      <Index.Box className="main-content">
        <Index.Box className="transaction-failed-wrapper">
          <Index.Box className="transaction-failed-img">
            <img
              src={PagesIndex.Png.TransactionFailedImg}
              alt="Transaction Failed"
            />
          </Index.Box>
          <Index.Typography
            variant="h1"
            component="h1"
            className="transaction-failed-title"
          >
            Transaction Failed
          </Index.Typography>
          <Index.Typography className="transaction-failed-subtitle">
          Oops!!! Something went wrong. If your money has been debited / tickets have not been confirmed then you can simply "Raise an Issue" Ticket by sharing the unsuccessful transaction details  under "Your Profile" section on the Website/App and our Team shall get back to you on the same
          </Index.Typography>
          {location?.pathname == "/transaction-failed" ? (
            <Index.Box className="transaction-failed-btn-box">
              <Index.Link
                to={`/booking-history?transId=${transId}`}
                className="btn btn-secondary"
              >
                View Order Details
              </Index.Link>
              <Index.Link className="btn btn-primary" to={`/`}>
                Go home
              </Index.Link>
            </Index.Box>
          ) : (
            <>
              <Index.Box className="transaction-failed-btn-box">
                <Index.Link
                  to={`/app-booking-history?transId=${transId}`}
                  className="btn btn-secondary"
                >
                  View Order Details
                </Index.Link>
              </Index.Box>
            </>
          )}
        </Index.Box>
      </Index.Box>
    </Index.Box>
    </>
  );
}

export default TransactionFailed;
