import { Info } from "lucide-react";

export default function DemoModeBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ac-cyan/30 bg-ac-cyan/10 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
      <p className="text-xs text-ac-muted sm:text-sm">
        <strong className="text-foreground">Illustrative tree.</strong> AC is
        live on-chain and the buy widget, VIP/Apex Pool qualification, and
        payout claiming below are all real, read straight from the contract
        — but the referral tree, counts, and reward numbers on this page are
        a sample layout showing how your tree will look, not your real
        downline yet. Your referral link (above) is already live and ready
        to share.
      </p>
    </div>
  );
}
