export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="h-10 w-10 rounded-full border-[3px] border-slate-200 animate-spin"
        style={{ borderTopColor: "var(--primary, #2563eb)" }}
      />
    </div>
  );
}
