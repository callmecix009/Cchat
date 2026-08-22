export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ background: 'linear-gradient(160deg,#071510 0%,#0C2417 60%,#0F2E1D 100%)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-lime2 text-[#06170D] flex items-center justify-center font-bold text-lg animate-pulse">
          C
        </div>
        <p className="text-[#8FAA99] text-sm font-medium">Loading setup wizard...</p>
      </div>
    </div>
  );
}
