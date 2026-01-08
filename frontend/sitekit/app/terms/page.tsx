import Link from "next/link";

export const metadata = {
  title: "Terms of Service | SiteKit",
  description: "SiteKit Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Last updated: January 8, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              By accessing and using SiteKit (&quot;the Service&quot;), you accept
              and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by these terms, please do not use this
              service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              SiteKit provides a web-based platform that allows users to create,
              customize, and publish websites using pre-designed templates and
              drag-and-drop components. The service includes website hosting,
              template library access, and customization tools.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              To access certain features of the Service, you must create an
              account. You are responsible for maintaining the confidentiality of
              your account credentials and for all activities that occur under
              your account. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              4. User Content
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You retain ownership of all content you create using SiteKit. By
              using our Service, you grant us a limited license to host, display,
              and distribute your content solely for the purpose of providing the
              Service. You are solely responsible for the content you publish.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Prohibited Uses
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You may not use the Service to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Distribute malware or harmful code</li>
              <li>Engage in spam or unauthorized advertising</li>
              <li>Harass, abuse, or harm others</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Termination
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We reserve the right to suspend or terminate your account at any
              time for violation of these terms or for any other reason at our
              sole discretion. Upon termination, your right to use the Service
              will immediately cease.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              SiteKit shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of or
              inability to use the Service. Our total liability shall not exceed
              the amount you paid us in the past 12 months.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We may modify these terms at any time. We will notify you of
              significant changes via email or through the Service. Your continued
              use of the Service after such changes constitutes acceptance of the
              new terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              9. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:support@sitekit.com"
                className="text-[#2563eb] hover:underline"
              >
                support@sitekit.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 SiteKit. All rights reserved.</p>
      </footer>
    </div>
  );
}
