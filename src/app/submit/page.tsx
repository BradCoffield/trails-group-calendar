"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import EventForm, { EventFormData } from "@/components/dashboard/EventForm";

export default function PublicSubmitPage() {
  const formStartedAt = useRef<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    formStartedAt.current = Date.now();
  }, []);

  const handleSubmit = async (data: EventFormData) => {
    const response = await fetch("/api/events/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        website: honeypot, // Honeypot field
        form_started_at: formStartedAt.current.toString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit event");
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-48 bg-[#00a99d] shadow-md -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#b5d334] rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-12 -left-24 w-80 h-80 bg-[#29abe2] rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-md w-full bg-white rounded-xl shadow-xl ring-1 ring-black/5 p-8 text-center mt-12">
          <div className="w-16 h-16 bg-[#b5d334]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#9ab82d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your submission. An administrator will review your event and it will
            appear on the calendar once approved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-[#b5d334] text-white font-medium rounded-lg hover:bg-[#9ab82d] transition-all shadow-sm hover:shadow"
            >
              View Calendar
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                formStartedAt.current = Date.now();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-48 bg-[#00a99d] shadow-md -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#b5d334] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-12 -left-24 w-80 h-80 bg-[#29abe2] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-12 w-64 h-64 bg-[#f7941d] rounded-full blur-3xl opacity-10"></div>
      </div>

      <header className="bg-transparent shadow-none pt-4 pb-2">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/TRAILS Horizontal logo white.png"
              alt="TRAILS Logo"
              width={200}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </header>

      <div className="py-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-[#b5d334] px-6 py-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-5 rounded-full -ml-10 -mb-10"></div>
              <h1 className="text-2xl font-bold text-white relative z-10">Submit an Event</h1>
              <p className="text-white/90 mt-1 relative z-10">
                Share your library event with the TRAILS community
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All submissions are reviewed by an administrator before
                  appearing on the calendar. You&apos;ll receive confirmation once your event is
                  approved.
                </p>
              </div>

              {/* Honeypot field - hidden from users, visible to bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <EventForm
                onSubmit={handleSubmit}
                submitLabel="Submit for Review"
                showSubmitterFields={true}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 bg-white/50 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              ← Back to Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
