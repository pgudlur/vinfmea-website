import Link from "next/link";

export const metadata = {
  title: "Checkout Success - vinFMEA Pro",
  description: "Your vinFMEA Pro account has been created successfully.",
};

export default function CheckoutSuccessPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[var(--bg)] to-white">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[var(--navy)] mb-3">
          Welcome to vinFMEA Pro!
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Your account has been created and your 14-day free trial is now active.
          Check your email for login credentials and setup instructions.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left space-y-4">
          <h2 className="font-semibold text-[var(--navy)] text-sm">Next Steps:</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
              <span>Check your email for your username and temporary password</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
              <span>Log in to the vinFMEA Pro web application</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
              <span>Change your password and start your first FMEA project</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg bg-[var(--blue-dark)] text-white font-semibold hover:bg-[#1D4ED8] transition-colors shadow-md"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="px-8 py-3 rounded-lg bg-gray-100 text-[var(--navy)] font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Need help? Contact us at{" "}
          <a href="mailto:support@vinfmea.com" className="text-blue-600 hover:underline">
            support@vinfmea.com
          </a>
        </p>
      </div>
    </section>
  );
}
