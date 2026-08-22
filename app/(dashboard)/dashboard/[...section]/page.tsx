import Link from "next/link";

export default async function SectionPage({ params }: { params: Promise<{ section: string[] }> }) {
  const { section } = await params;
  const name = section[0] ?? "section";
  const label = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="max-w-[1240px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-disp font-bold tracking-tight text-dark">{label}</h1>
          <p className="text-sm text-muted">This section is coming soon.</p>
        </div>
      </div>

      <div className="bg-white border border-cborder rounded-[16px] p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-grn-bg text-grn-d flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l2 2" /><circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h2 className="font-disp text-lg font-bold text-dark mb-1">The {label} view is being built</h2>
        <p className="text-sm text-muted max-w-md mx-auto mb-6">
          The setup wizard answers will power this section. It&apos;s next on the roadmap.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-grn text-white font-semibold text-sm hover:bg-grn-d transition-colors">
            Back to dashboard
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-cborder text-dark font-semibold text-sm hover:border-grn transition-colors">
            Edit setup wizard
          </Link>
        </div>
      </div>
    </div>
  );
}