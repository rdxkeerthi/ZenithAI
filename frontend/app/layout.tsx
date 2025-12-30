import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StressGuardAI - AI-Powered Stress Detection",
  description: "Real-time stress monitoring and analysis using advanced AI technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* SVG Filters for Advanced Effects */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <filter id="liquid-distortion" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01 0.02"
                numOctaves="3"
                result="turbulence"
                seed="2"
              >
                <animate
                  attributeName="baseFrequency"
                  from="0.01 0.02"
                  to="0.02 0.01"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale="3"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>
        </svg>

        <div className="main-background">
          {children}
        </div>
      </body>
    </html>
  );
}
