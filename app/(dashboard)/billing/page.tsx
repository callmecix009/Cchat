import Link from "next/link";

export default function BillingPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold font-display text-dark mb-2">Billing</h1>
      <p className="text-muted mb-8">Your subscription and payment details</p>

      <div className="bg-white rounded-2xl border border-cborder p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-dark">Current Plan</h2>
            <p className="text-muted text-sm mt-1">Active on this workspace</p>
          </div>
          <span className="px-4 py-1.5 bg-grn-bg text-grn-d font-semibold rounded-full text-sm">
            Pro — $5/mo
          </span>
        </div>

        <div className="border-t border-cborder pt-6 mt-6">
          <div className="bg-grn-bg rounded-xl p-6 border-2 border-grn">
            <h3 className="font-semibold text-grn-d mb-2">Pro Plan</h3>
            <p className="text-3xl font-bold font-display text-grn-d">
              $5<span className="text-base font-normal text-muted">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>12,000 AI messages / month</li>
              <li>Smart AI agent (DeepSeek)</li>
              <li>Unlimited commands</li>
              <li>Priority support</li>
            </ul>
            <div className="mt-6 w-full py-2.5 bg-grn text-white font-semibold rounded-xl text-center">
              Current plan
            </div>
            <p className="text-[12.5px] text-muted mt-3 text-center leading-[1.5]">
              Payment of this subscription is managed externally. Cchat processes no transactions of any kind inside the app.
            </p>
          </div>
        </div>
      </div>

      <Link href="/dashboard" className="block mt-6 text-center text-grn hover:text-grn-d font-medium">
        Back to Dashboard
      </Link>
    </div>
  );
}