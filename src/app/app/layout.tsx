import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgenticCore (AC)",
  // Kept out of search results on purpose. This route is the installed
  // app's entry point, not a landing page -- indexing it would put a
  // stripped-down screen with no explanation of the token into results
  // that should be reaching "/".
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return children;
}
