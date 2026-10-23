import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { TOKEN, SUPPORT_TELEGRAM_URL, SOCIAL_LINKS } from "@/lib/tokenConfig";
import { REFERRAL_LEVELS } from "@/lib/referral";
import {
  FacebookIcon,
  XIcon,
  YoutubeIcon,
  TiktokIcon,
  TelegramIcon,
} from "@/components/ui/SocialIcons";

const SOCIAL_ICON_LINKS = [
  { label: "Facebook", href: SOCIAL_LINKS.facebook, Icon: FacebookIcon },
  { label: "X", href: SOCIAL_LINKS.x, Icon: XIcon },
  { label: "YouTube", href: SOCIAL_LINKS.youtube, Icon: YoutubeIcon },
  { label: "TikTok", href: SOCIAL_LINKS.tiktok, Icon: TiktokIcon },
  { label: "Telegram channel", href: SOCIAL_LINKS.telegramChannel, Icon: TelegramIcon },
];

// Two support channels, by design -- email and Telegram.
const SUPPORT_ICON_LINKS = [
  { label: "Email", href: `mailto:${TOKEN.supportEmail}`, Icon: Mail },
  { label: "Telegram", href: SUPPORT_TELEGRAM_URL, Icon: TelegramIcon },
];

const COLUMNS = [
  {
    title: "Token",
    links: [
      { label: "Tokenomics", href: "#tokenomics" },
      { label: "How to Buy", href: "#how-to-buy" },
      { label: "Launch & Presale", href: "#presale" },
      { label: "Contract on BscScan", href: `${TOKEN.bscScanBase}/address/${TOKEN.contractAddress}` },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Referral Program", href: "/referral-program" },
      { label: "VIP Pool", href: "/referral-program" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Telegram", href: TOKEN.telegramBotUrl },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "BscScan", href: `${TOKEN.bscScanBase}/address/${TOKEN.contractAddress}` },
      { label: "PancakeSwap", href: TOKEN.pancakeSwapUrl },
    ],
  },
  {
    title: "Support",
    links: [
      { label: TOKEN.supportEmail, href: `mailto:${TOKEN.supportEmail}` },
      { label: "Telegram Support", href: SUPPORT_TELEGRAM_URL },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ac-border bg-ac-bg-elevated">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Actoken.org" width={32} height={32} className="h-8 w-8" />
              <span className="text-base font-semibold text-foreground">
                Actoken<span className="text-ac-violet">.org</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70">
              A high-community BEP-20 token on BNB Smart Chain. Fair launch,
              {" "}{REFERRAL_LEVELS}-level USDT referral rewards, a weekly VIP
              Pool, and a ${TOKEN.minBuyUsd}&ndash;${TOKEN.maxBuyUsd} buy
              range designed to protect early-phase price stability.
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
                      className="break-all text-sm text-ac-muted transition hover:text-ac-lime"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-ac-border pt-10 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <span className="text-xs font-semibold uppercase tracking-widest text-ac-muted">Need help?</span>
            <div className="flex gap-3">
              {SUPPORT_ICON_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ac-lime text-black transition hover:brightness-95"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <span className="text-xs font-semibold uppercase tracking-widest text-ac-muted">Follow us</span>
            <div className="flex gap-3">
              {SOCIAL_ICON_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ac-border text-ac-muted transition hover:border-ac-lime/60 hover:text-ac-lime"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-ac-border pt-8 text-xs text-ac-muted sm:flex-row sm:items-center sm:justify-between">
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
