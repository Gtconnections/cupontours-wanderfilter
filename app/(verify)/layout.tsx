import "@/app/(front)/globals.css";

export const metadata = {
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
