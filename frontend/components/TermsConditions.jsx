import React from "react";
import "./Footer.css";

const TermsConditions = ({ setActiveSection }) => {
  return (
    <div className="main">
      <div className="main-top">
        <h2>Terms & Conditions</h2>
        <p onClick={() => setActiveSection(null)} className="close-btn">
          ✖
        </p>
      </div>
      <>
        <p>
          These Terms and Conditions (&quot;Terms&quot;) govern your access to
          and use of our website. These Terms form a legally binding agreement
          between you and MyService. By accessing, browsing, registering for, or
          otherwise using the Platform, you accept and agree to be bound by
          these Terms in full. If you do not agree to these Terms, you must not
          access or use the Platform. Please read these Terms carefully and
          retain a copy for your records. This Terms &amp; Conditions has been
          created with the help of the Free Terms &amp; Conditions Generator.
        </p>

        <h3>1. Definitions</h3>
        <p>
          For purposes of these Terms, the following definitions apply:
          <br />
          &quot;Platform&quot; means the website, mobile application, services,
          features, tools, content and functionality made available by MyService
          via its web domains and mobile applications.
          <br />
          &quot;User&quot; or &quot;you&quot; means any individual or entity
          that accesses, browses, registers for, or uses the Platform.
          <br />
          &quot;Account&quot; means a user account registered on the Platform
          when account creation is required to access certain features.
          <br />
          &quot;User Content&quot; means any content, materials, information,
          data, text, images, audio, video, feedback or other materials that
          Users submit, post, upload, or otherwise make available through the
          Platform (&quot;upload_content&quot;).
          <br />
          &quot;Subscription Plan&quot; means any recurring paid plan,
          membership, or tier offered through the Platform
          (&quot;subscription_plan&quot;).
          <br />
          &quot;Purchase&quot; means any one-time paid transaction or sale
          conducted on the Platform (&quot;user_buy&quot;).
        </p>

        <h3>2. Eligibility</h3>
        <p>
          Access to certain parts of the Platform may be limited to individuals
          who are of legal age to form binding contracts in their jurisdiction
          (commonly 18 years or older). By accessing or using the Platform you
          represent and warrant that you meet the eligibility requirements and
          you will comply with all applicable laws and regulations. If you are
          accepting these Terms on behalf of an organization, you represent that
          you have the authority to bind that organization.
        </p>
        <p>
          If you are using the Platform on behalf of a company, organization, or
          other legal entity, you represent and warrant that you have the
          authority to agree to these Terms on behalf of that entity. We may
          request proof of identity, age, or authority prior to allowing access
          to certain features.
        </p>

        <h3>3. Use of the Platform and Acceptable Conduct</h3>
        <p>
          You agree to use the Platform only for lawful, authorized, and proper
          purposes. You will not use the Platform to engage in deceptive,
          malicious, or illegal conduct, and you will not attempt to disrupt,
          interfere with, or compromise the security, integrity, or performance
          of the Platform or its underlying infrastructure. Prohibited
          activities include, but are not limited to: unauthorized access or
          data scraping, distribution of malware, distribution of unsolicited
          promotional materials, spoofing or impersonation, and any activity
          that violates the privacy or intellectual property rights of others.
        </p>
        <p>
          We expressly prohibit any attempt to gain unauthorized access to
          restricted areas, systems, or data connected to the Platform. You must
          not attempt to probe, scan, or test the vulnerability of the Platform
          or circumvent authentication or security measures. If we determine, in
          our sole discretion, that you have engaged in prohibited activities,
          we may immediately suspend or terminate your access and take
          appropriate legal action.
        </p>
        <p>
          The Platform may provide features that enable interactions between
          Users. You are solely responsible for your interactions with other
          Users. We do not endorse any User Content and do not assume
          responsibility for User-to-User communications or transactions. You
          agree to exercise caution when interacting with others, and you should
          never share sensitive personal or financial information with other
          Users.
        </p>

        <h3>4. Accounts and Registration (User Account)</h3>
        <p>
          To access certain features you may be required to create an Account.
          When creating an Account you must provide accurate and complete
          information, and you agree to keep such information up to date. You
          are responsible for maintaining the confidentiality of your Account
          credentials and for any activity that occurs under your Account,
          whether or not you authorized such activity. If you suspect
          unauthorised access, you must notify us immediately at{" "}
          <a href="mailto:areebmohd683@gmail.com">areebmohd683@gmail.com</a> (if
          provided) or using the Platform contact methods.
        </p>
        <p>
          We reserve the right to refuse registration or to cancel or suspend
          Accounts at our discretion, including Accounts that appear to be
          created for abusive, fraudulent, or otherwise unlawful purposes. If
          your Account is terminated, your right to use the Platform will cease
          immediately. We may retain certain information as required by law or
          as necessary to enforce these Terms, resolve disputes, and prevent
          fraud.
        </p>

        <h3>5. User Content and Uploads (Upload Content)</h3>
        <p>
          When you post, upload, publish, submit or transmit any User Content to
          or through the Platform you grant MyService a worldwide,
          non-exclusive, royalty-free, transferable license to host, store,
          reproduce, modify (for technical compatibility), create derivative
          works from, distribute, perform and display such content for the
          purpose of operating, providing, promoting and improving the Platform.
          This license ends when you remove your content from the Platform,
          except where content has been shared with others and cannot be fully
          removed.
        </p>
        <p>
          You represent and warrant that you own or otherwise control all of the
          rights to User Content that you post, that you have the necessary
          consents, and that the User Content does not violate these Terms or
          any applicable law. You further grant other Users any licenses they
          need to view and interact with User Content in the normal operation of
          the Platform.
        </p>

        <h3>6. Ownership of Platform Content (Own Content)</h3>
        <p>
          All intellectual property rights in and to the Platform, including but
          not limited to software, designs, text, graphics, logos, images,
          audio, video, data compilations and the selection and arrangement
          thereof (collectively, &quot;Platform Content&quot;), are the
          exclusive property of MyService or its licensors, and are protected by
          copyright, trademark, patent and other intellectual property and
          unfair competition laws. Nothing in these Terms transfers ownership of
          Platform Content to you.
        </p>

        <h3>7. Feedback and Suggestions (Feedback Suggestion)</h3>
        <p>
          If you provide feedback, suggestions, ideas, or improvement proposals
          (&quot;Feedback&quot;) regarding the Platform, you agree that such
          Feedback is non-confidential and non-proprietary. By submitting
          Feedback you grant MyService a perpetual, irrevocable, worldwide,
          royalty-free, transferable license to use, reproduce, make, sell,
          modify, and otherwise exploit such Feedback in any manner without
          compensation to you.
        </p>

        <h3>8. Promotions, Offers and Contests (Promotion &amp; Contest)</h3>
        <p>
          From time to time we may run promotions, offers, sweepstakes or
          contests. Each such promotion will be governed by specific rules and
          eligibility criteria which will be published with the promotion. By
          participating, you agree to be bound by those rules, as well as these
          Terms. Promos may have geographic, age, purchase, or other
          restrictions.
        </p>

        <h3>9. Privacy and Data Protection</h3>
        <p>
          Your privacy is important. Our Privacy Policy describes how we
          collect, use, share and protect personal information collected via the
          Platform. By using the Platform you consent to such processing and
          acknowledge that we may use service providers and subprocessors in
          different jurisdictions; appropriate safeguards will be implemented in
          accordance with applicable law.
        </p>

        <h3>10. Warranties and Disclaimers</h3>
        <p>
          THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
          AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER
          EXPRESS, IMPLIED, STATUTORY OR OTHERWISE. TO THE MAXIMUM EXTENT
          PERMITTED BY LAW, MyService DISCLAIMS ALL WARRANTIES, INCLUDING ANY
          IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, TITLE, QUIET ENJOYMENT, AND NON-INFRINGEMENT.
        </p>

        <h3>11. Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL
          MyService OR ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES OR AGENTS
          BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          EXEMPLARY OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA OR
          USE, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF
          THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h3>12. Indemnification</h3>
        <p>
          You agree to indemnify, defend and hold harmless MyService and its
          affiliates, licensors, and service providers, and each of their
          respective officers, directors, employees, contractors and agents from
          and against any claims, damages, obligations, losses, liabilities,
          costs or debt, and expenses (including reasonable legal fees) arising
          from your violation of these Terms, your User Content, your use of the
          Platform, or your violation of any rights of a third party.
        </p>

        <h3>13. Termination and Suspension</h3>
        <p>
          We may suspend or terminate access to all or part of the Platform
          immediately, without prior notice or liability, for any reason,
          including if you breach the Terms. Upon termination, your right to use
          the Platform will immediately cease. We may retain and use information
          as permitted by applicable law and our policies to enforce these
          Terms, prevent fraud, resolve disputes and comply with legal
          obligations.
        </p>

        <h3>14. Governing Law and Dispute Resolution</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of India, without regard to its conflict of law provisions. You
          agree that any dispute, claim or controversy arising out of or related
          to these Terms or your use of the Platform shall be resolved by the
          competent courts located in Uttar Pradesh, India, unless otherwise
          required by applicable law.
        </p>

        <h3>15. Force Majeure</h3>
        <p>
          Neither party shall be liable for any failure or delay in performance
          of its obligations hereunder where such failure or delay is due to
          causes beyond its reasonable control, including acts of God, labor
          disputes, pandemics, riots, acts of war, governmental actions, or
          failures of internet infrastructure.
        </p>

        <h3>16. Third-Party Services and Links</h3>
        <p>
          The Platform may contain links to third-party websites, products, and
          services, or may enable interactions that are facilitated by third
          parties. Such links and integrations are provided for convenience only
          and do not constitute an endorsement by MyService.
        </p>

        <h3>17. Changes to These Terms</h3>
        <p>
          We may update these Terms from time to time to reflect changes to the
          law, the Platform, or our business practices. When we make material
          changes, we will take reasonable steps to provide notice, such as
          posting a prominent notice on the Platform or sending an email to the
          address associated with your Account.
        </p>

        <h3>18. Miscellaneous</h3>
        <p>
          If any provision of these Terms is held to be unenforceable or
          invalid, that provision will be limited or eliminated to the minimum
          extent necessary so that these Terms will otherwise remain in full
          force and effect and enforceable. These Terms, together with our
          Privacy Policy and any other legal notices published by us on the
          Platform, constitute the entire agreement between you and MyService
          concerning the Platform.
        </p>
      </>
    </div>
  );
};

export default TermsConditions;
