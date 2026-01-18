import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SiteKit",
  description: "SiteKit Privacy Policy",
};

export const dynamic = "force-static";


export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Last updated: January 8, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4">
              <li>
                <strong>Account Information:</strong> Name, email address, and
                password when you create an account
              </li>
              <li>
                <strong>Content:</strong> Websites, pages, and content you
                create using our Service
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact
                with our Service
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, and device identifiers
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Protect against fraud and abuse</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              3. Information Sharing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We do not sell your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4">
              <li>With your consent</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              4. Data Security
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction. This includes encryption, secure
              servers, and regular security audits.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Cookies and Tracking
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use cookies and similar tracking technologies to collect
              information about your browsing activities. You can control
              cookies through your browser settings, though this may affect
              some features of our Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              7. Data Retention
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We retain your information for as long as your account is active
              or as needed to provide you with our Service. We may also retain
              certain information as required by law or for legitimate business
              purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Our Service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If we become aware of such collection, we will delete the
              information immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@sitekit.com"
                className="text-[#2563eb] hover:underline"
              >
                privacy@sitekit.com
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
