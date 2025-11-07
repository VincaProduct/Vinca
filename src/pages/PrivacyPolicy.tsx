import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            For the purposes of this policy, "personal information" means any information that can be used to identify you personally.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Using Vinca Wealth as a Visitor</h2>
            <p>If you are a first-time visitor to Vinca Wealth:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We don't know who you are.</li>
              <li>
                We collect technical data about your interaction with the Services. This is data we get from your use of our services. 
                We collect certain data about your interaction with our website, such as pages visited and average time spent on the website, 
                your internet protocol address, the unique identifier of your device and device information such as operating system, 
                operating system version, browser plugins, crashes, system activity, hardware settings, date and time of your request and 
                referral URL, and cookies that may uniquely identify your browser and mobile application.
              </li>
              <li>We use this data to analyse how you use our website and improve the services provided through the website.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Using Vinca Wealth as a Registered User</h2>
            <p>If you have provided us with your email address and/or phone number:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are a registered user of Vinca Wealth.</li>
              <li>You may be asked to give us additional information in order to use certain features of the Services.</li>
              <li>We collect technical data about your interaction with the Services.</li>
            </ul>
            <p>We use all the collected data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond to your queries about the Services;</li>
              <li>Deliver to you any notices, alerts, or communications relevant to your use of the Services;</li>
              <li>
                Offer you other products or services that we believe may be of interest to you. You have the option to opt-out of receiving such communication;
              </li>
              <li>
                Aggregate the anonymised information from registered users to perform market research, project planning, product development, 
                troubleshoot problems, analyse user behaviour, marketing purposes, and promotions;
              </li>
              <li>Enforce this Agreement and any terms thereof.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Data</h2>
            <p>
              Your email address and phone number is used to send you updates regarding the Services. You can select what communication 
              you'd like to receive from us by modifying your account settings after you login to your account. We may also use your 
              information to verify your identity in the event you contact us for assistance with the site or Services. We use cloud-based 
              software tools to perform certain business-related functions. Examples of such functions include, maintaining databases and 
              servers, processing text messages, phone calls, chats and emails, and marketing and sales analytics. Please note that any 
              Service Partners or Vendors utilised by Vinca Wealth are bound by the same standards of data security practices and procedures 
              as we are under law and contract.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Permitted Disclosures</h2>
            <p>
              Vinca Wealth has taken best and reasonable steps to ensure prevention of any unauthorised disclosure of your sensitive personal 
              information and disclosures shall be made only in the following situations: Disclosure for regulatory compliances: Vinca Wealth 
              will share your information with judicial, administrative and regulatory entities to comply with any legal and regulatory requirements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Third Party Providers</h2>
            <p>
              We may provide links to third party sites. As we do not control these web sites, Vinca Wealth is not responsible for the privacy 
              practices of those web sites or the reliability of the information presented by such site. We therefore encourage you to review 
              the policies posted on these and all third party sites.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Disclosure for Provision of Services</h2>
            <p>
              Vinca Wealth will share your information with Vendors of Vinca Wealth as necessary for the provision of Services. Authorized 
              Vendors are bound by the same standards of data security practices and procedures as we are under law and contract. They are 
              subject to the same penalties as we are for the unauthorised disclosure of your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Access Your Information</h2>
            <p>
              Your personal information is yours. Under Indian law, you have the right to ask us for a readable copy of all your personal 
              information stored with us. If you have any questions about the accuracy or safety of your information, please do contact us 
              at the email address given below:
            </p>
            <p className="font-semibold">Email: support@vincawealth.com</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Security Practices and Procedures</h2>
            <p>
              Vinca Wealth follows industry best practices, using open and known principles when transferring and storing your data. We believe 
              the biggest threat to the security and privacy of your data is if someone – probably someone you know – gains access to any of 
              your devices. Remember to keep your password safe and secret to prevent unauthorised access to your account. If you think that 
              the security of your account has been compromised, change your password and contact us immediately for further assistance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. How Your Information is Transmitted</h2>
            <p>
              Your data is transmitted between your device and our servers using HTTPS protocol for encryption. HTTPS is the technology used 
              to create secure connections for your web browser, and is indicated by a padlock icon in your browser.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Our Legal Obligation to You</h2>
            <p>
              We are bound by the (Indian) Information Technology Act, 2000, and comply with all its provisions (available{" "}
              <a 
                href="https://www.meity.gov.in/writereaddata/files/itbill2000.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                here
              </a>
              ). Under Section 43A of the (Indian) Information Technology Act, 2000, Vinca Wealth and all its Service Providers are obliged 
              to maintain reasonable security procedures to safeguard your data. Under Regulation 5 of the Information Technology (Reasonable 
              Security and Procedures and Sensitive Personal Data or Information) Rules, 2011, we are obliged to provide every registered user 
              of Vinca Wealth with a readable copy of the personal information you have provided us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Changes to this Privacy Policy</h2>
            <p>
              This Privacy Policy is published on the application/website in compliance with Regulation 4 of the (Indian) Information Technology 
              (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules, 2011. We update this Privacy Policy 
              periodically and we may modify the terms of this policy without prior intimation. It is your responsibility to periodically review 
              the terms of this policy and if you do not agree with the terms of this Privacy Policy or any changes made to this policy, please 
              stop using all Services immediately and write to us at the address mentioned above.
            </p>
          </section>

          <div className="pt-8 border-t border-border mt-12">
            <p className="text-sm">
              <strong>Last Updated:</strong> January 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
