import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CChat",
  description: "CChat Terms of Service. Read the rules and conditions for using the CChat platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen font-body text-dark">
      <nav className="fixed top-0 left-0 right-0 z-[900] flex items-center gap-6 px-[5vw] py-4 bg-[#081811]/95 backdrop-blur-sm border-b border-[rgba(143,240,180,.08)]">
        <Link href="/" className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-white">
          CChat
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-auto text-[14px] font-medium text-[#B9CDBF]">
          <Link href="/" className="hover:text-lime transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-lime transition-colors">Privacy</Link>
          <Link href="/acceptable-use" className="hover:text-lime transition-colors">Acceptable Use</Link>
        </div>
      </nav>

      <main className="pt-[100px] pb-[80px] px-[5vw]">
        <article className="max-w-[720px] mx-auto">
          <h1 className="font-disp font-[800] tracking-[-.02em] text-[clamp(28px,3.4vw,42px)] mb-4">Terms of Service</h1>
          <p className="text-muted text-[14px] mb-10">Last updated: 26 August 2026</p>

          <div className="prose prose-dark space-y-8 text-[15px] leading-[1.7]">
            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">1. Introduction</h2>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of the CChat platform, including our website, application, and related services (collectively, the &quot;Service&quot;). CChat is operated by CChat (&quot;CChat,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
              </p>
              <p>
                By creating an account, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">2. Eligibility</h2>
              <p>
                You must be at least 18 years old and have the legal capacity to enter into a binding agreement to use CChat. You represent that all registration information you provide is truthful, accurate, and complete, and that you will keep it up to date.
              </p>
              <p>
                CChat is a business-to-business platform. You must be an authorized representative of the business using the Service, or have the authority to act on behalf of that business.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">3. Account and Registration</h2>
              <p>
                To use CChat, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keeping your account credentials secure</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
                <li>Ensuring that your use complies with applicable laws</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">4. Service Description</h2>
              <p>
                CChat is an AI-powered business assistant platform that helps businesses manage customer communications. The Service includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>An AI agent that can respond to customer inquiries on your behalf</li>
                <li>A conversation inbox for managing customer interactions</li>
                <li>Product and service catalog management</li>
                <li>Business profile and policy management</li>
                <li>WhatsApp and other communication channel integrations</li>
                <li>Analytics and reporting features</li>
              </ul>
              <p>
                We reserve the right to modify, update, or discontinue any feature of the Service at any time with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">5. Your Data and Content</h2>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Ownership</h3>
              <p>
                You retain all rights, title, and interest in any data, content, or information you provide to the Service, including business information, products, services, policies, and customer messages. CChat does not claim ownership over your content.
              </p>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">License to Process</h3>
              <p>
                By using the Service, you grant CChat a limited, non-exclusive license to process your content solely as necessary to provide and improve the Service. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Processing customer messages to generate AI replies</li>
                <li>Storing and displaying your business information and product catalog</li>
                <li>Analyzing conversation data to provide insights and improve the Service</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Data Accuracy</h3>
              <p>
                You are responsible for ensuring that the information you provide is accurate, complete, and up to date. CChat is not liable for any errors or inaccuracies in the data you provide, including incorrect product information, pricing, or policies.
              </p>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Data Export and Deletion</h3>
              <p>
                You may request export or deletion of your data at any time by contacting us at{" "}
                <a href="mailto:chrispinmatiko@gmail.com" className="text-grn-d underline hover:text-grn transition-colors">
                  chrispinmatiko@gmail.com
                </a>. We will respond to export requests within a reasonable time and will comply with deletion requests subject to our legal obligations and data retention policies.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">6. Acceptable Use</h2>
              <p>
                You agree not to use the Service for any unlawful or prohibited purpose, including but not limited to sending spam, scams, or fraudulent content. You must comply with all applicable laws, including data protection laws in Tanzania and the jurisdictions of your customers.
              </p>
              <p>
                For complete details on permitted and prohibited uses, please review our{" "}
                <Link href="/acceptable-use" className="text-grn-d underline hover:text-grn transition-colors">
                  Acceptable Use Policy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">7. Fees and Billing</h2>
              <p>
                CChat operates on a subscription basis. Current pricing and plan details are available on our website or application. By selecting a paid plan, you agree to pay the applicable fees.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Subscriptions automatically renew at the end of each billing period unless cancelled.</li>
                <li>You may cancel at any time. Cancellation takes effect at the end of the current billing period.</li>
                <li>Fees are non-refundable except as required by applicable law.</li>
                <li>We reserve the right to change pricing with reasonable advance notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">8. Intellectual Property</h2>
              <p>
                CChat and its original content, features, functionality, and design are owned by CChat and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">9. Third-Party Services</h2>
              <p>
                CChat integrates with third-party services such as WhatsApp. Your use of those services is subject to their respective terms and policies. CChat is not responsible for the availability, content, or performance of third-party services.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">10. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not guarantee the accuracy, completeness, or reliability of any content generated by AI or provided by users.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">11. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CCHAT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
              <p>
                Our total liability to you for any claims arising from or related to the Service shall not exceed the greater of (a) the amount you paid to CChat in the twelve (12) months preceding the claim or (b) USD 100.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless CChat, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys&apos; fees) arising from or related to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of applicable laws</li>
                <li>Your violation of third-party rights</li>
                <li>Content you submit or make available through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">13. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at any time, without prior notice, for conduct that we determine violates these Terms or is harmful to other users, third parties, or the business interests of CChat.
              </p>
              <p>
                Upon termination, your right to use the Service ceases immediately. We may retain your data as described in our Privacy Policy. You may also request account deletion by contacting us.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">14. Dispute Resolution and Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United Republic of Tanzania. Any disputes arising from or relating to these Terms or the Service shall be resolved in the courts of Tanzania, unless otherwise agreed in writing.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">15. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. When we make material changes, we will notify you by email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">16. Contact Us</h2>
              <p>
                If you have questions about these Terms, please contact:
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
                These Terms of Service are provided for informational purposes and do not constitute legal advice. You should consult with a qualified legal professional for advice specific to your situation.
              </p>
            </section>
          </div>
        </article>
      </main>

      <footer className="bg-[#050F0A] text-[#8FAA99] pt-10 pb-6 px-[5vw]">
        <div className="max-w-[720px] mx-auto flex flex-wrap gap-4 text-[13px]">
          <Link href="/" className="hover:text-lime transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-lime transition-colors">Privacy Policy</Link>
          <Link href="/acceptable-use" className="hover:text-lime transition-colors">Acceptable Use Policy</Link>
        </div>
        <div className="max-w-[720px] mx-auto mt-4 text-[12.5px]">
          &copy; 2026 CChat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
