import { type ReactNode } from "react";

import "../styles/globals.css";
import "../styles/prosemirror.css";
import { Noto_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Toaster from "../ui/Toaster";

const NotoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400"],
});
export const metadata = {
  title: "Studlancer",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={NotoSans.className}>
          <main>{children}</main>
          <Toaster richColors position="bottom-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
