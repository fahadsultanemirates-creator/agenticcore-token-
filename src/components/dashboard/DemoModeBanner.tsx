import { Info } from "lucide-react";

export default function DemoModeBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ac-cyan/30 bg-ac-cyan/10 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
      <p className="text-xs text-ac-muted sm:text-sm">
        <strong className="text-foreground">Preview data.</strong> The AC
        contract isn&apos;t deployed yet, so referral counts, tree depth, and
        rewards below are illustrative. Your real referral link (above) is
        already live and ready to share.
      </p>
    </div>
  );
}
