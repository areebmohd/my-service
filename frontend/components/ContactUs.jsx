import React from "react";
import "./Footer.css";

const ContactUs = ({ setActiveSection }) => {
  return (
    <div className="main">
      <div className="main-top">
        <h2>Contact Us</h2>
        <p onClick={() => setActiveSection(null)} className="close-btn">
          ✖
        </p>
      </div>
      <p>
        Welcome to MyService, We’re always eager to hear from you. Whether you
        want to share feedback, ask questions, or simply say hello, we’re here
        and ready to listen. At MyService our thoughts and suggestions help us
        grow, improve, and deliver a better experience.
      </p>
      <p>You can contact us for any of the following:</p>
      <p>
        Website Feedback: If you have any thoughts, opinions, or comments about
        our website, its design, or functionality, we would love to hear them.
        Your feedback helps us create a better user experience.
      </p>
      <p>
        Corrections or Updates: If you come across any information in our posts
        that seems incorrect, outdated, or missing, let us know. We strive to
        provide accurate, up-to-date content, and your insights help us ensure
        we’re delivering the best.
      </p>
      <p>
        Technical Issues: If you encounter any errors, bugs, or issues while
        using our site, please report them to us. We aim to provide a seamless
        experience, and your reports help us address problems quickly.
      </p>
      <p>Don't hesitate to contact us:</p>
      <p>Email: areebmohd683@gmail.com</p>
    </div>
  );
};

export default ContactUs;
