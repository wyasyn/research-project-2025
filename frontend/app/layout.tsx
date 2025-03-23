import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const playfair = localFont({
  src: "../assets/fonts/PlayfairDisplay.ttf",
  display: "swap",
  variable: "--font-play-fair",
});
const inter = localFont({
  src: "../assets/fonts/Inter.ttf",
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Face Recognition Attendance | Secure & Contactless Check-ins",
  description:
    "Enhance security and efficiency with AI-powered face recognition attendance. Fast, accurate, and contactless check-ins for workplaces, schools, and events. Say goodbye to manual tracking!",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
