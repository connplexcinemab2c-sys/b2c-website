import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store"; // Use your preferred mock store library

const mockStore = configureStore([]);

const ReduxProvider = ({ children, initialState }) => {
  const store = mockStore(initialState);
  return (
    <Provider store={store}>
      {" "}
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

export default ReduxProvider;
