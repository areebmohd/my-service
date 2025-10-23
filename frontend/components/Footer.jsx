import React from 'react'
import "./Footer.css";

const Footer = ({setActiveSection}) => {
  return (
    <div className="footer">
        <div className="options">
          <p onClick={()=>setActiveSection("privacy")}>Privacy Policy</p>
          <p onClick={()=>setActiveSection("terms")}>Terms & Conditions</p>
          <p onClick={()=>setActiveSection("contact")}>Contact Us</p>
        </div>
        <div className="copy">
          copyright © {new Date().getFullYear()} MyService
        </div>
      </div>
  )
}

export default Footer