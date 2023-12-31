import { type ReactNode } from "react";

import "../styles/globals.css";
import "../styles/prosemirror.css";
import { ClerkProvider } from "@clerk/nextjs";
import Toaster from "../ui/Toaster";
import { cal, inter } from "../styles/fonts";
import { cn } from "~/utils/cn";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "./ThemeProvider";
import { Analytics } from "@vercel/analytics/react";

// const CabinFont = Cabin({
//   subsets: ["latin"],
//   weight: ["400"],
// });

export const metadata = {
  title: "Studlancer",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn("font-cal", cal.variable, inter.variable)}>
          <NextTopLoader color="#3b82f6" showSpinner={false} />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
          <Analytics />
          <Toaster richColors position="bottom-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
