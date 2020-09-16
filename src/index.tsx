import * as React from "react";
import * as ReactDOM from "react-dom";

import { applyMiddleware, createStore } from "redux";

import { App } from "./App";
import { Provider } from "react-redux";
import reducer from "./store/reducer";
import thunk from "redux-thunk";

const store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
