import CchatLogo from "@/components/branding/CchatLogo";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <CchatLogo size={56} className="shrink-0" />
            <span className="font-disp font-[800] text-[26px] tracking-tight text-dark">Cchat</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
