import React, { Component } from "react";

import GuitarAmp from "../GuitarAmp/GuitarAmp";
import Header from "../Header/Header";

export class Layout extends Component {
  render() {
    return (
      <div>
        <Header />
        <GuitarAmp />
      </div>
    );
  }
}

export default Layout;
