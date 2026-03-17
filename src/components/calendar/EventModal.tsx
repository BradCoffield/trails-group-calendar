"use client";

import { useEffect, useRef } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  description: string | null;
  location: string | null;
  color: string;
  extendedProps: {
    submittedByName: string;
    submittedByOrg: string | null;
  };
}

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDateTime(dateStr: string, allDay: boolean): string {
  const date = new Date(dateStr);
  if (allDay) {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{
          animation: "modalSlideIn 0.2s ease-out",
        }}
      >
        <style jsx>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        <div className="px-6 py-5" style={{ backgroundColor: event.color }}>
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-white leading-tight pr-4">{event.title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg p-2" style={{ backgroundColor: `${event.color}15` }}>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: event.color }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {formatDateTime(event.start, event.allDay)}
              </p>
              {event.end && !event.allDay && (
                <p className="text-sm text-gray-500">to {formatDateTime(event.end, false)}</p>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 rounded-lg p-2"
                style={{ backgroundColor: `${event.color}15` }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: event.color }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="font-medium text-gray-900 pt-2">{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 border-t pt-4 text-sm text-gray-500">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p>
              {event.extendedProps.submittedByName}
              {event.extendedProps.submittedByOrg && (
                <span className="text-gray-400"> • {event.extendedProps.submittedByOrg}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
