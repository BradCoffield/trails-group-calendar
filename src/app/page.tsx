"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

const Calendar = dynamic(() => import("@/components/calendar/Calendar"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-48 bg-[#00a99d] shadow-md -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#b5d334] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-12 -left-24 w-80 h-80 bg-[#29abe2] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-12 w-64 h-64 bg-[#f7941d] rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/TRAILS Horizontal logo white.png"
              alt="TRAILS Logo"
              width={200}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#b5d334] px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-[#9ab82d] hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <div className="rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 h-[calc(100vh-160px)] min-h-[500px]">
          <Calendar />
        </div>
      </div>
    </main>
  );
}
