import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import LayoutWrapper from "../components/LayoutWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "EduGenie - AI Assessment Creator",
  description: "Create and customize exam question papers in seconds using advanced AI grounding models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-warm">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
