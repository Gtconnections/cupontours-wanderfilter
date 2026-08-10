import "@/app/(front)/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  icons: { icon: "/icon_cupon.svg" },
  title: "Membership Verification - Cupon Tours",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}<SpeedInsights />
      <body>{children}</body>
    </html>
  );
}
