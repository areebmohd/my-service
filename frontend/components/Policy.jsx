import React from "react";
import "./Footer.css";

const PrivacyPolicy = ({ setActiveSection }) => {
  return (
    <div className="main">
      <div className="main-top">
        <h2>Privacy Policy</h2>
        <p onClick={() => setActiveSection(null)} className="close-btn">
          ✖
        </p>
      </div>
      <>
        <p>
          This Privacy Policy explains how we collect, use, disclose, and
          protect the personal information you provide or that we collect when
          you access or use our services when you use our website
          (myservice.com). It explains your privacy rights and choices, and how
          to contact us about our privacy practices. Please read this Policy
          carefully. By using our Platform, you consent to the data practices
          described in this Policy.
        </p>

        <h3>1. Information We Collect</h3>
        <p>
          We collect multiple types of information to operate effectively and
          provide you the best experience. The categories of information we
          collect include:
        </p>

        <h3>1.1. Information You Provide Directly</h3>
        <p>
          When you register, create an account, fill forms, contact us, or
          otherwise communicate with us, you may provide personal information
          such as your name, email address, phone number, billing and payment
          information, profile information, and other identifiers. For
          businesses, this may include the business contact person, company
          name, and business address — only when you entered that information
          and only if entity_type is 'business'. For individual operators,
          business name and address are intentionally omitted from this Policy
          output and will not appear in rendered policy text.
        </p>

        <h3>1.2. Automatically Collected Information</h3>
        <p>
          We automatically collect technical and usage data when you interact
          with the Platform, which may include IP address, device identifiers,
          device model and operating system, browser type, language preferences,
          access times, pages visited, search queries, referring/exit pages,
          crash logs, and performance metrics.
        </p>

        <h3>1.5. Communications and Support Data</h3>
        <p>
          We maintain records of communications and support interactions to
          provide assistance, detect abuse, and improve service quality. These
          records may include email content, chat transcripts, telephone logs,
          and attachments you send.
        </p>

        <h3>1.6. Derived and Aggregated Data</h3>
        <p>
          We may derive non-identifying, aggregated, or de-identified data from
          the information we collect. Aggregated data is used for analytics,
          performance measurement, and research; it cannot reasonably be used to
          identify you.
        </p>

        <h3>2. How We Use Information</h3>
        <p>
          We use collected information for the following purposes:
          <br />
          To provide, operate, maintain, and improve the Platform and related
          services.
          <br />
          To authenticate users, manage accounts, provide customer support, and
          communicate important updates.
          <br />
          To personalize content, recommendations, and advertising where
          allowed.
          <br />
          To perform analytics, monitor service health, and produce aggregated
          statistics for internal use.
          <br />
          To comply with legal obligations, respond to lawful requests from
          government or law enforcement, and protect rights and safety.
        </p>

        <h3>3. Legal Bases for Processing (If Applicable)</h3>
        <p>
          To the extent applicable, our lawful bases for processing personal
          data may include:
          <br />
          Consent: You have given consent for specific processing activities
          (e.g., marketing emails, cookies) where required.
          <br />
          Contractual Necessity: Processing required to perform our agreement
          with you (e.g., account provisioning, payment processing).
          <br />
          Legal Obligation: Processing required to comply with law or regulatory
          requests.
          <br />
          Legitimate Interests: Processing necessary for our legitimate
          interests, balanced against your rights (e.g., fraud prevention,
          network security, direct communications).
        </p>

        <h3>4. Cookies and Tracking Technologies</h3>
        <p>
          We use cookies and similar tracking technologies (such as web beacons,
          pixels, and local storage) to enhance user experience, analyze site
          and app performance, remember your preferences, and deliver relevant
          content. You can manage cookie preferences via your device or browser
          settings and opt out of certain types of cookies.
        </p>
        <p>
          We classify cookies into categories including essential cookies,
          preference cookies, analytics cookies, and advertising cookies.
          Essential cookies enable core functionality. Preference and analytics
          cookies support personalization and performance. Advertising cookies
          enable targeted ads (only used if we operate ads or use ad networks).
        </p>

        <h3>5. Advertising and Analytics</h3>
        <p>
          We do not display advertisements from third-party networks that use
          tracking for ad targeting. We do not use third-party analytics
          platforms to collect usage metrics beyond server-side logs and
          essential diagnostics.
        </p>

        <h3>6. Sharing and Disclosure</h3>
        <p>
          We do not sell your personal information. We disclose personal
          information only as described below or with your consent:
          <br />
          To service providers and contractors providing hosting,
          infrastructure, payment, and other services to operate the Platform.
          <br />
          To affiliates and partners for joint operations, where you have
          consented or where permitted by law.
          <br />
          To comply with legal processes, such as court orders, subpoenas, or
          government investigations.
          <br />
          To protect our rights, property, or safety, or the rights, property,
          or safety of others.
        </p>

        <h3>7. International Data Transfers</h3>
        <p>
          Our operations may involve transferring personal information to
          countries outside your country of residence. When we transfer data
          internationally, we implement appropriate safeguards, such as standard
          contractual clauses or other mechanisms permitted by law, to protect
          the data.
        </p>

        <h3>8. Data Retention and Deletion</h3>
        <p>
          We retain personal information for as long as necessary to provide
          services, comply with legal obligations, resolve disputes, enforce
          agreements, and for legitimate business purposes. Retention periods
          vary by data type and legal requirements.
        </p>

        <h3>9. Security Measures</h3>
        <p>
          We use administrative, technical, and physical controls designed to
          protect personal information from unauthorized access, disclosure,
          alteration, and destruction. While we strive to use reasonable
          safeguards, no system can be guaranteed to be 100% secure.
        </p>

        <h3>10. Children’s Privacy</h3>
        <p>
          Our Platform is not directed to children under the age of 13 (or the
          minimum age in your jurisdiction). We do not knowingly collect
          personal information from children without parental consent.
        </p>

        <h3>25. Final Notes</h3>
        <p>
          We strive to maintain transparent and robust privacy practices. Thank
          you for trusting MyService with your information. Please review this
          Policy periodically for updates.
        </p>
      </>
    </div>
  );
};

export default PrivacyPolicy;
