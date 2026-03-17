"use client";

import dynamic from "next/dynamic";

const Calendar = dynamic(() => import("@/components/calendar/Calendar"), { ssr: false });

export default function Home() {
  return (
    <main className="h-screen w-full bg-white">
      <div className="mx-auto h-full max-w-7xl p-4 md:p-6 lg:p-8">
        <Calendar />
      </div>
    </main>
  );
}
