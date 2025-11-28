// app/(private)/layout.tsx

import Sidebar from "./Sidebar";
import Header from "./Topbar";
import type { ReactNode } from "react";
export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}