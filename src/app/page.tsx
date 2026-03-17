"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Calendar = dynamic(() => import("@/components/calendar/Calendar"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
            TRAILS Events Calendar
          </h1>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#b5d334] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#9ab82d] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Submit Event
          </Link>
        </div>
        <Calendar />
      </div>
    </main>
  );
}
