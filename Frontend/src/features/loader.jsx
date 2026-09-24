import React from "react";
import "./loader.css";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-box">
        <div className="spinner"></div>
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
