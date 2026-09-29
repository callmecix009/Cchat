"use client";

// Wireframe placeholders shown while page data loads. Each mimics its page
// layout so content doesn't jump when data arrives. Dashboard is omitted
// (loads fast enough to not need it).

function L({ className = "" }: { className?: string }) {
  return <span className={`skel ${className}`} />;
}

export function InboxSkeleton() {
  return (
    <div className="bg-white overflow-hidden flex flex-1 min-h-0" aria-hidden="true">
      {/* conversation list */}
      <aside className="w-full md:w-[300px] lg:w-[310px] flex-none flex flex-col border-r border-[#E9E9E7] bg-white min-h-0">
        <div className="flex-none p-3 border-b border-[#E9E9E7]">
          <L className="block h-9 rounded-[8px]" />
          <div className="flex gap-1.5 mt-2.5">
            {[72, 84, 66, 68, 70].map((w) => (
              <L key={w} className="h-7 rounded-[7px]" />
            ))}
          </div>
        </div>
        <ul className="flex-1 overflow-hidden min-h-0 divide-y divide-[#F1F1EF]">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <li key={i} className="flex gap-2.5 px-3 py-2.5 items-start">
              <L className="w-10 h-10 rounded-full flex-none" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <L className="h-3.5 w-24" />
                  <L className="h-2.5 w-10 ml-auto flex-none" />
                </div>
                <L className="block h-3 mt-1.5 w-11/12" />
                <L className="block h-[18px] w-16 mt-1.5 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      </aside>
      {/* active conversation */}
      <section className="flex-1 min-w-0 hidden md:flex flex-col bg-white min-h-0">
        <div className="flex-none border-b border-[#E9E9E7] px-4 py-2.5 flex items-center gap-2.5">
          <L className="w-10 h-10 rounded-full flex-none" />
          <div className="flex-1 min-w-0">
            <L className="block h-3.5 w-28" />
            <L className="block h-2.5 w-36 mt-1" />
          </div>
          <L className="h-8 w-24 rounded-[8px] flex-none" />
        </div>
        <div className="flex-1 min-h-0 p-4 flex flex-col gap-2.5 bg-[#FCFCF9]">
          <L className="h-[22px] w-16 rounded-full self-center" />
          <L className="h-12 rounded-[12px] w-[45%]" />
          <L className="h-20 rounded-[12px] w-[65%] self-end" />
          <L className="h-10 rounded-[12px] w-[38%]" />
          <L className="h-14 rounded-[12px] w-[55%] self-end" />
          <L className="h-10 rounded-[12px] w-[30%]" />
        </div>
        <div className="flex-none p-3 border-t border-[#E9E9E7] flex items-center gap-2">
          <L className="w-9 h-9 rounded-full flex-none" />
          <L className="h-10 rounded-[10px] flex-1" />
          <L className="w-9 h-9 rounded-full flex-none" />
        </div>
      </section>
      {/* contact panel */}
      <aside className="hidden xl:flex w-[300px] flex-none flex-col border-l border-[#E9E9E7] bg-white p-4 gap-3">
        <L className="h-4 w-28" />
        <div className="flex items-center gap-3">
          <L className="w-14 h-14 rounded-full flex-none" />
          <div className="flex-1">
            <L className="block h-4 w-24" />
            <L className="block h-3 w-32 mt-1.5" />
          </div>
        </div>
        <L className="block h-12 rounded-[10px]" />
        <L className="block h-16 rounded-[10px]" />
        <L className="block h-24 rounded-[10px]" />
        <L className="block h-24 rounded-[10px]" />
      </aside>
    </div>
  );
}

export function ProductsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="ptable overflow-hidden">
        <div className="flex gap-4 px-[14px] py-[11px] border-b border-[#E9E9E7]">
          {["w-24", "w-20", "w-14", "w-14", "w-16", "w-20"].map((w, i) => (
            <L key={i} className={`h-3 ${w}${i === 5 ? " ml-auto" : ""}`} />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <div key={r} className="flex items-center gap-4 px-[14px] py-[11px] border-b border-[#F1F1EF]">
            <L className="rounded-[10px] flex-none" />
            <div className="flex-1 min-w-0">
              <L className="block h-3.5 w-40 max-w-full" />
              <L className="block h-2.5 w-16 mt-1" />
            </div>
            <L className="h-5 w-16 rounded-full hidden sm:block" />
            <L className="h-3.5 w-20 hidden md:block" />
            <L className="h-7 w-20 rounded-[8px] hidden md:block" />
            <L className="h-5 w-16 rounded-full hidden sm:block" />
            <div className="flex gap-1 ml-auto">
              <L className="w-[29px] h-[29px] rounded-[8px]" />
              <L className="w-[29px] h-[29px] rounded-[8px]" />
              <L className="w-[29px] h-[29px] rounded-[8px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsCard({ fields }: { fields: number }) {
  return (
    <div className="polsec">
      <div className="flex items-center gap-2 mb-4">
        <L className="w-[22px] h-[22px] rounded-[6px]" />
        <L className="h-4 w-36" />
      </div>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="mb-4">
          <L className="block h-3 w-28 mb-1.5" />
          <L className="block h-[38px] rounded-[8px]" />
        </div>
      ))}
      <div className="flex gap-2">
        <L className="h-9 w-28 rounded-[8px]" />
        <L className="h-9 w-24 rounded-[8px]" />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" aria-hidden="true">
      <div>
        <SettingsCard fields={3} />
      </div>
      <div>
        <SettingsCard fields={2} />
        <div className="polsec">
          <div className="flex items-center gap-2 mb-4">
            <L className="w-[22px] h-[22px] rounded-[6px]" />
            <L className="h-4 w-28" />
          </div>
          <L className="block h-3 w-full mb-2" />
          <L className="block h-3 w-4/5 mb-4" />
          <L className="block h-9 w-32 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
