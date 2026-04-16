"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import HeartCursor from "../ui/HeartCursor";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSmoothScroll();

  return (
    <div className="relative min-h-screen flex flex-col">
      <HeartCursor />
      <Navbar />
      <main className="flex-1 relative z-[2]">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
