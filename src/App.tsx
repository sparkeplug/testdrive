import "./App.scss";

import * as React from "react";

// import { hot } from "react-hot-loader";

export interface HelloWorldProps {
  userName: string;
  lang: string;
}
export const App = (props: HelloWorldProps) => (
  <h1>
    Hi {props.userName}! tosdsd sdf {props.lang}!
  </h1>
);

// export default hot(module)(App);
export default App;
