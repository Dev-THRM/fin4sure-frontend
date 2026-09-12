import React from "react";
import logo from "../../assets/images/brandlogo.png";

export default function CompanyRibbon() {
  return (
    <div className="company-ribbon">
      <div className="company-ribbon-name">
        <img
          src={logo}
          className="company-ribbon-logo"
          alt="Finn4sure Logo"
        />
      </div>
    </div>
  );
}
export { CompanyRibbon };
