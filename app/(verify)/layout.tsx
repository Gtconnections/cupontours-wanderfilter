import "@/app/(front)/globals.css";

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
      <body>{children}</body>
    </html>
  );
}
