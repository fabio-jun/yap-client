import { CheckCircle, Type, EyeOff, TrendingUp, Undo2, Bookmark } from "lucide-react";

const PERKS = [
  { icon: CheckCircle, label: "Verified badge", desc: "Let people know it is really you." },
  { icon: Type, label: "Longer yaps", desc: "Up to 2,000 characters per post." },
  { icon: EyeOff, label: "Ad-free experience", desc: "No ads." },
  { icon: TrendingUp, label: "Boosted reach", desc: "Your yaps appear higher in replies." },
  { icon: Undo2, label: "Edit yaps", desc: "Fix typos up to 2 times per post." },
  { icon: Bookmark, label: "Bookmark folders", desc: "Organise your saves." },
];

export default function PremiumPage() {
  return (
    <div className="animate-fade-in px-4 pb-12 pt-4">
      <h1 className="text-[3rem] font-extrabold tracking-tight text-base-content">
        Yap Premium<span className="text-primary">.</span>
      </h1>
      <p className="mb-8 text-[16px] text-base-content/50">Everything you love about Yap, enhanced.</p>

      <div className="mb-8 w-full overflow-hidden rounded-[14px] border-2 border-primary bg-base-200 px-5 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary">Monthly</p>
        <div className="flex items-baseline gap-1">
          <span className="text-[3.25rem] font-extrabold tracking-tight text-base-content">$8</span>
          <span className="text-[16px] text-base-content/50">/month</span>
        </div>
        <p className="mb-4 text-[15px] text-base-content/50">Cancel anytime. No commitment.</p>
        <button className="btn btn-primary h-11 min-h-0 w-full rounded-[10px] border-none text-[15px] font-bold shadow-none">Subscribe now</button>
      </div>

      <div className="divide-y divide-base-300 border-b border-base-300">
        {PERKS.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-4 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[16px] font-bold tracking-tight text-base-content">{label}</p>
              <p className="mt-0.5 text-[15px] text-base-content/50">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
