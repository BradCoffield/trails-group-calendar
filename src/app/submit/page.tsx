"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import EventForm, { EventFormData } from "@/components/dashboard/EventForm";

export default function PublicSubmitPage() {
  const formStartedAt = useRef<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const getFormStartTime = useCallback(() => {
    if (formStartedAt.current === null) {
      formStartedAt.current = Date.now();
    }
    return formStartedAt.current;
  }, []);

  const handleSubmit = async (data: EventFormData) => {
    const response = await fetch("/api/events/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        website: honeypot, // Honeypot field
        form_started_at: getFormStartTime().toString(),
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
              className="px-4 py-2 bg-[#b5d334] text-white font-medium rounded-lg hover:bg-[#9ab82d] transition-colors"
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#b5d334] px-6 py-5">
            <h1 className="text-2xl font-bold text-white">Submit an Event</h1>
            <p className="text-white/90 mt-1">Share your library event with the TRAILS community</p>
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
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
