export default function PremiumAd() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-base-300 bg-base-200 px-4 py-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/36">Sponsored</p>
      <h3 className="mb-2 text-[1rem] font-extrabold tracking-tight text-base-content">Yap Premium</h3>
      <p className="mb-4 text-[13px] leading-[1.55] text-base-content/52">
        Get a verified badge, longer yaps, and an ad-free experience.
      </p>
      <button className="btn btn-primary h-10 min-h-0 w-full rounded-[10px] border-none px-4 text-[13px] font-bold shadow-none">
        Subscribe &mdash; $8/mo
      </button>
    </div>
  );
}
