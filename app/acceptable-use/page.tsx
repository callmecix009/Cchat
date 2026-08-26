import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — CChat",
  description: "CChat Acceptable Use Policy. Learn the rules for using the CChat platform responsibly.",
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen font-body text-dark">
      <nav className="fixed top-0 left-0 right-0 z-[900] flex items-center gap-6 px-[5vw] py-4 bg-[#081811]/95 backdrop-blur-sm border-b border-[rgba(143,240,180,.08)]">
        <Link href="/" className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-white">
          CChat
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-auto text-[14px] font-medium text-[#B9CDBF]">
          <Link href="/" className="hover:text-lime transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-lime transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-lime transition-colors">Terms</Link>
        </div>
      </nav>

      <main className="pt-[100px] pb-[80px] px-[5vw]">
        <article className="max-w-[720px] mx-auto">
          <h1 className="font-disp font-[800] tracking-[-.02em] text-[clamp(28px,3.4vw,42px)] mb-4">Acceptable Use Policy</h1>
          <p className="text-muted text-[14px] mb-10">Last updated: 26 August 2026</p>

          <div className="prose prose-dark space-y-8 text-[15px] leading-[1.7]">
            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">1. Introduction</h2>
              <p>
                This Acceptable Use Policy (&quot;Policy&quot;) sets out the rules and standards that apply when you use the CChat platform, including our website, application, and related services (collectively, the &quot;Service&quot;). This Policy is part of and should be read together with our{" "}
                <Link href="/terms" className="text-grn-d underline hover:text-grn transition-colors">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-grn-d underline hover:text-grn transition-colors">
                  Privacy Policy
                </Link>.
              </p>
              <p>
                By using the Service, you agree to comply with this Policy. We may update this Policy from time to time, and your continued use of the Service constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">2. General Principles</h2>
              <p>You must use CChat responsibly and in compliance with applicable laws, including but not limited to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The laws of the United Republic of Tanzania</li>
                <li>Applicable consumer protection and commercial laws</li>
                <li>Data protection and privacy laws</li>
                <li>Anti-spam and electronic communications laws</li>
                <li>The terms and policies of any third-party communication platform you connect to CChat</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">3. Prohibited Activities</h2>
              <p>You must not use CChat to:</p>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Spam and Unwanted Communications</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Send unsolicited, bulk, or automated messages without proper consent</li>
                <li>Send messages that are deceptive, misleading, or fraudulent</li>
                <li>Use the Service for phishing, smishing, or social engineering attacks</li>
                <li>Send repeated messages to individuals who have asked you to stop</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Fraud and Misrepresentation</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Impersonate another person, business, or brand without authorization</li>
                <li>Create or distribute false, misleading, or deceptive content</li>
                <li>Offer products or services that do not exist or cannot be delivered</li>
                <li>Use the Service to conduct scams or fraudulent schemes</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Harmful and Illegal Content</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Store, send, or distribute content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                <li>Send content that promotes violence, discrimination, or hatred based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
                <li>Store or distribute malware, viruses, or other malicious code</li>
                <li>Engage in any activity that violates applicable criminal law</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Platform Integrity</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
                <li>Interfere with or disrupt the Service, servers, or networks</li>
                <li>Circumvent or attempt to circumvent any security or rate-limiting measures</li>
                <li>Use automated tools (bots, scrapers) to access or use the Service in ways not intended</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
              </ul>

              <h3 className="font-disp font-[600] text-[17px] mb-2 mt-4">Abuse of Resources</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service in a manner that places an unreasonable or disproportionate burden on our infrastructure</li>
                <li>Use the Service to send an excessively high volume of messages relative to your plan limits</li>
                <li>Resell, sublicense, or redistribute the Service without written authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">4. Customer Consent and Compliance</h2>
              <p>
                You are responsible for ensuring that you have a lawful basis to communicate with the individuals you contact through CChat. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Obtaining necessary consents from customers before sending them messages</li>
                <li>Honoring opt-out and unsubscribe requests promptly</li>
                <li>Complying with applicable data protection laws when handling customer personal data</li>
                <li>Providing customers with accurate information about your products, services, and policies</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">5. AI-Generated Content</h2>
              <p>
                CChat provides AI-generated replies to assist with customer communications. You are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reviewing AI-generated responses before they are sent to customers</li>
                <li>Ensuring that AI-generated content is accurate and not misleading</li>
                <li>Not using the Service to generate spam, fraudulent, or harmful AI content</li>
                <li>Ensuring that your AI configuration does not produce prohibited content</li>
              </ul>
              <p>
                We reserve the right to review, monitor, and take action on AI-generated content that violates this Policy.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">6. Data Protection</h2>
              <p>
                When using CChat, you must handle personal data in compliance with applicable data protection laws, including the United Republic of Tanzania Personal Data Protection Act, 2022. This means:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must have a lawful basis for processing personal data through the Service</li>
                <li>You must not use CChat to collect, store, or process personal data in ways that violate applicable law</li>
                <li>You must respond to data subject requests (access, correction, deletion) as required by law</li>
                <li>You must implement appropriate safeguards for the personal data you process</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">7. Intellectual Property</h2>
              <p>You must not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use CChat to infringe on the intellectual property rights of others</li>
                <li>Send or store content that violates trademarks, copyrights, or other intellectual property rights</li>
                <li>Use the CChat name, logo, or branding without our written authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">8. Third-Party Platforms</h2>
              <p>
                When you connect third-party communication platforms (such as WhatsApp) to CChat, you must comply with their respective terms of service and policies. Failure to comply with a third-party platform&apos;s rules may result in suspension of the affected integration or your CChat account.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">9. Enforcement</h2>
              <p>
                We reserve the right to investigate and take appropriate action against anyone who violates this Policy, including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Issuing warnings</li>
                <li>Temporarily suspending access to the Service</li>
                <li>Permanently terminating accounts</li>
                <li>Reporting violations to law enforcement or relevant authorities</li>
                <li>Removing or disabling access to violating content</li>
              </ul>
              <p>
                We may take action without prior notice in cases of serious or repeated violations.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">10. Reporting Violations</h2>
              <p>
                If you become aware of any violation of this Policy, please report it to us at{" "}
                <a href="mailto:chrispinmatiko@gmail.com" className="text-grn-d underline hover:text-grn transition-colors">
                  chrispinmatiko@gmail.com
                </a>. We will review reports and take appropriate action.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Policy from time to time. When we make material changes, we will notify you by email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated Policy.
              </p>
            </section>

            <section>
              <h2 className="font-disp font-[700] text-[20px] mb-3">12. Contact Us</h2>
              <p>
                If you have questions about this Policy, please contact:
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
                This Acceptable Use Policy is provided for informational purposes and does not constitute legal advice. You should consult with a qualified legal professional for advice specific to your situation.
              </p>
            </section>
          </div>
        </article>
      </main>

      <footer className="bg-[#050F0A] text-[#8FAA99] pt-10 pb-6 px-[5vw]">
        <div className="max-w-[720px] mx-auto flex flex-wrap gap-4 text-[13px]">
          <Link href="/" className="hover:text-lime transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-lime transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-lime transition-colors">Terms of Service</Link>
        </div>
        <div className="max-w-[720px] mx-auto mt-4 text-[12.5px]">
          &copy; 2026 CChat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
