import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CChat",
  description: "CChat Privacy Policy. Learn how CChat collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-body text-dark">
      <nav className="fixed top-0 left-0 right-0 z-[900] flex items-center gap-6 px-[5vw] py-4 bg-[#081811]/95 backdrop-blur-sm border-b border-[rgba(143,240,180,.08)]">
        <Link href="/" className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-white">
          CChat
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-auto text-[14px] font-medium text-[#B9CDBF]">
          <Link href="/" className="hover:text-lime transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-lime transition-colors">Terms</Link>
          <Link href="/acceptable-use" className="hover:text-lime transition-colors">Acceptable Use</Link>
        </div>
      </nav>

      <main className="pt-[100px] pb-[80px] px-[5vw]">
        <article className="max-w-[720px] mx-auto">
          <h1 className="font-disp font-[800] tracking-[-.02em] text-[clamp(28px,3.4vw,42px)] mb-4">Privacy Policy</h1>
          <p className="text-muted text-[14px] mb-10">Last updated: 26 August 2026</p>

          <div className="prose prose-dark space-y-8 text-[15px] leading-[1.7]">
            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">1. Introduction</h2>
              <p>
                CChat (&quot;CChat,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a software-as-a-service platform that helps businesses manage customer conversations and use artificial intelligence to assist with customer replies. This Privacy Policy explains how we collect, use, store, and protect personal information when you use our website, application, and related services (collectively, the &quot;Service&quot;).
              </p>
              <p>
                By creating an account or using the Service, you agree to the collection and use of information as described in this Privacy Policy. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">2. Information We Collect</h2>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Account Information</h3>
              <p>When you create a CChat account, we collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number (if provided)</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Business Information</h3>
              <p>When you configure your business profile, we store:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Company name</li>
                <li>Company logo</li>
                <li>Products and services entered by the business, including names, prices, stock levels, and categories</li>
                <li>Business policies such as delivery rules, return policies, warranty terms, payment methods, and operating hours</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Customer Conversation Data</h3>
              <p>When the Service is connected to a communication channel, we process and store:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Customer names and phone numbers</li>
                <li>Messages sent through connected communication channels</li>
                <li>Conversation metadata such as timestamps, status, and outcome</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">WhatsApp and Connected Channel Information</h3>
              <p>
                When you connect WhatsApp or another supported communication platform, CChat receives information required to provide the integration. This may include your WhatsApp Business account details, phone number, and message data routed through the connected channel.
              </p>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Authentication Information</h3>
              <p>
                We use Clerk for authentication. Clerk processes sign-in credentials on our behalf. CChat does not store your password directly.
              </p>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Subscription and Billing Information</h3>
              <p>If you subscribe to a paid plan, we process subscription and payment information through our payment provider. We do not store full payment card details on our servers.</p>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Technical Information</h3>
              <p>When you use the Service, we automatically collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage logs and diagnostics</li>
                <li>Cookies and similar technologies required for authentication and service functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">3. How We Use Your Information</h2>
              <p>We use the information described above for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Creating and maintaining your account</li>
                <li>Providing the CChat service</li>
                <li>Connecting and operating supported communication channels</li>
                <li>Processing and storing customer conversations</li>
                <li>Providing AI-assisted replies to customer messages on your behalf</li>
                <li>Allowing you to review and respond to conversations through the inbox</li>
                <li>Managing your products, services, policies, and business information</li>
                <li>Processing subscriptions and payments</li>
                <li>Preventing abuse and fraud</li>
                <li>Maintaining the security of the Service</li>
                <li>Troubleshooting issues and improving the Service</li>
                <li>Communicating with you about your account, the Service, or policy changes</li>
                <li>Meeting legal and regulatory obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">4. AI Processing</h2>
              <p>
                CChat uses artificial intelligence to help businesses respond to customer messages. When you enable AI functionality, customer messages and relevant business information (such as your product catalog, pricing, and policies) may be processed by AI service providers in order to generate responses or perform related functions.
              </p>
              <p>
                We only send information that is reasonably necessary for the requested AI functionality. We do not use your customer data to train public AI models.
              </p>
              <p>
                You are responsible for reviewing your AI configuration, business information, and the replies generated by the AI before they are sent to customers.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">5. Connected Third-Party Services</h2>
              <p>
                You may choose to connect third-party communication services such as WhatsApp or other supported platforms to CChat. When you connect a third-party service, CChat may receive information required to provide the requested integration.
              </p>
              <p>
                You are responsible for having the necessary authority to connect and use those third-party accounts. You are also responsible for complying with the terms and policies of the connected third-party platform.
              </p>
              <p>
                CChat is not responsible for the independent privacy practices, availability, policies, or terms of third-party services. We encourage you to review the privacy policies of any third-party service you connect to CChat.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">6. Data Sharing</h2>
              <p>
                CChat does not sell your personal data. We may share information with trusted service providers who help us operate the platform, including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cloud hosting providers</li>
                <li>Database infrastructure providers</li>
                <li>Authentication services</li>
                <li>Payment processing providers</li>
                <li>AI and API service providers</li>
                <li>Communication platform integrations</li>
                <li>Security and monitoring services</li>
              </ul>
              <p>
                We only share information where reasonably necessary for providing the service, processing payments, ensuring security, complying with legal obligations, or for another purpose disclosed in this policy.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">7. Data Retention</h2>
              <p>
                We retain your information for as long as reasonably necessary to provide the Service, maintain your account, meet contractual obligations, resolve disputes, comply with legal obligations, maintain security, and enforce our agreements.
              </p>
              <p>
                When information is no longer required, we delete or anonymize it where reasonably possible and legally permitted.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">8. Security</h2>
              <p>
                We use reasonable technical and organizational measures designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">9. Your Rights</h2>
              <p>
                Under the United Republic of Tanzania Personal Data Protection Act, 2022, and other applicable laws, you may have the following rights, where applicable:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access to your personal information held by CChat</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Request for deletion or erasure of your personal data, subject to legal exceptions</li>
                <li>Withdrawal of consent where processing relies on your consent</li>
                <li>Objection to or restriction of processing, where applicable under law</li>
                <li>Filing a complaint regarding the processing of your personal data</li>
                <li>Other rights provided by applicable data protection law</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:chrispinmatiko@gmail.com" className="text-grn-d underline hover:text-grn transition-colors">
                  chrispinmatiko@gmail.com
                </a>
                . We will respond to your request in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">10. International and Cross-Border Processing</h2>
              <p>
                CChat may use cloud infrastructure and third-party service providers that process information outside of Tanzania. Where cross-border processing occurs, it is performed subject to applicable law and appropriate safeguards. We take reasonable steps to ensure that your information receives an adequate level of protection in the jurisdictions where it is processed.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">11. Children</h2>
              <p>
                CChat is a business-to-business software platform. The Service is not intended for children under the age of 18, and users must have the legal capacity required to enter into an agreement. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">13. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your data rights, please contact:
              </p>
              <p>
                <strong>CChat</strong><br />
                Email:{" "}
                <a href="mailto:chrispinmatiko@gmail.com" className="text-grn-d underline hover:text-grn transition-colors">
                  chrispinmatiko@gmail.com
                </a>
              </p>
            </section>

            <section className="border-t border-cborder pt-8">
              <p className="text-muted text-[13px]">
                This Privacy Policy is provided for informational purposes and does not constitute legal advice. You should consult with a qualified legal professional for advice specific to your situation.
              </p>
            </section>
          </div>
        </article>
      </main>

      <footer className="bg-[#050F0A] text-[#8FAA99] pt-10 pb-6 px-[5vw]">
        <div className="max-w-[720px] mx-auto flex flex-wrap gap-4 text-[13px]">
          <Link href="/" className="hover:text-lime transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-lime transition-colors">Terms of Service</Link>
          <Link href="/acceptable-use" className="hover:text-lime transition-colors">Acceptable Use Policy</Link>
        </div>
        <div className="max-w-[720px] mx-auto mt-4 text-[12.5px]">
          &copy; 2026 CChat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
