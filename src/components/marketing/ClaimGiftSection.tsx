import ClaimTiersTable from "@/components/ui/ClaimTiersTable";

// Deliberately small and plain -- a quick-reference strip under the Hero,
// not a full marketing section with its own heading/blur orbs like the
// sections below it. The Hero's own pill link already carries the pitch;
// this just shows the live tier breakdown for anyone who scrolls past it
// without connecting a wallet.
export default function ClaimGiftSection() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-16 sm:px-8">
      <ClaimTiersTable />
    </section>
  );
}
