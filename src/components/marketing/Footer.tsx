import Link from "next/link";
import { TOKEN } from "@/lib/tokenConfig";

const COLUMNS = [
  {
    title: "Token",
    links: [
      { label: "Tokenomics", href: "#tokenomics" },
      { label: "How to Buy", href: "#how-to-buy" },
      { label: "Launch & Presale", href: "#presale" },
      { label: "Contract (coming soon)", href: "#how-to-buy" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Referral Program", href: "#referral" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "BscScan", href: TOKEN.bscScanBase },
      { label: "PancakeSwap", href: TOKEN.pancakeSwapUrl },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ac-border bg-ac-bg-elevated">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ac-violet to-ac-violet-dark text-sm font-black text-white">
                AC
              </span>
              <span className="text-base font-semibold text-foreground">AgenticCore</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ac-muted">
              A high-community BEP-20 token on BNB Smart Chain. Fair launch,
              7-level referral rewards, and a $100 max-buy cap designed to
              protect early-phase price stability.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ac-muted transition hover:text-ac-lime"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ac-border pt-8 text-xs text-ac-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AgenticCore. AC is a utility token;
            nothing here is financial advice.
          </p>
          <p>
            Ticker <span className="text-foreground">{TOKEN.ticker}</span> ·{" "}
            {TOKEN.standard} on {TOKEN.chain}
          </p>
        </div>
      </div>
    </footer>
  );
}
