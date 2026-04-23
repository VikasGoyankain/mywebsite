import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Code, Coin & Constitution",
    default: "Code, Coin & Constitution | Vikas Goyanka",
  },
  description:
    "Navigating the intersections of Technology, Banking, and the Law. Research journal by Vikas Goyanka.",
  openGraph: {
    siteName: "Code, Coin & Constitution",
    url: "https://vikasgoyanka.in/ccc",
    type: "website",
  },
};

export default function CCCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="ccc-page">{children}</div>;
}
