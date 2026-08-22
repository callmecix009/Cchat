export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-grn text-white flex items-center justify-center font-bold text-lg animate-pulse">
          C
        </div>
        <p className="text-muted text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
