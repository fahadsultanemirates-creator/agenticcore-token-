"use client";

import { useEffect } from "react";
import { captureReferrerFromUrl } from "@/lib/referral";

// Runs once on every page load (mounted at the root layout) so a referral
// link landing anywhere on the site -- not just the homepage -- still gets
// captured before the visitor eventually buys from the dashboard.
export default function ReferralCapture() {
  useEffect(() => {
    captureReferrerFromUrl();
  }, []);
  return null;
}
