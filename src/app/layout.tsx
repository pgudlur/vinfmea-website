import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vinFMEA Pro - Professional FMEA & Control Plan Suite",
  description:
    "AIAG-VDA compliant FMEA software with SFMEA, DFMEA, PFMEA, Control Plans, ISO 26262 functional safety, and multi-language support. Built for automotive quality engineers.",
  keywords:
    "FMEA software, DFMEA, PFMEA, SFMEA, Control Plan, AIAG VDA, ISO 26262, ASIL, quality engineering, automotive",
  openGraph: {
    title: "vinFMEA Pro - Professional FMEA & Control Plan Suite",
    description:
      "Complete FMEA solution: SFMEA, DFMEA, PFMEA, Control Plans with ISO 26262 safety analysis.",
    url: "https://vinfmea.com",
    siteName: "vinFMEA Pro",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
