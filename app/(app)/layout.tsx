// app/(private)/layout.tsx
'use client';

import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import Header from "./Topbar";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile("matches" in e ? e.matches : !!(e as any).matches);
    setIsMobile(mq.matches);
    if ("addEventListener" in mq) {
      mq.addEventListener("change", onChange as any);
      return () => mq.removeEventListener("change", onChange as any);
    } else {
      // fallback for older browsers
      (mq as any).addListener(onChange);
      return () => (mq as any).removeListener(onChange);
    }
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col">
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}