"use client";

import { useState, useEffect, useCallback } from "react";

interface PendingEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  description: string | null;
  location: string | null;
  color: string;
  approved: boolean;
  createdAt: string;
  extendedProps: {
    submittedByName: string;
    submittedByOrg: string | null;
    submittedByUserId: string;
  };
}

export default function PendingEventsTable() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events/pending");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching pending events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (response.ok) {
        setEvents(events.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject (delete) this event?")) return;

    try {
      const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (response.ok) {
        setEvents(events.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Error rejecting event:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateTime = (start: string, end: string | null, allDay: boolean) => {
    const startDate = formatDate(start);
    if (allDay) {
      return `${startDate} (All day)`;
    }
    const startTime = formatTime(start);
    if (end) {
      const endDate = formatDate(end);
      const endTime = formatTime(end);
      if (startDate === endDate) {
        return `${startDate}, ${startTime} - ${endTime}`;
      }
      return `${startDate} ${startTime} - ${endDate} ${endTime}`;
    }
    return `${startDate} at ${startTime}`;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (events.length === 0) {
    return <div className="text-center py-8 text-gray-500">No pending events to review.</div>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header with color bar */}
          <div className="h-2" style={{ backgroundColor: event.color }} />

          <div className="p-4">
            {/* Title and Actions Row */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(event.id)}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(event.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {/* Date & Time */}
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700">
                  {formatDateTime(event.start, event.end, event.allDay)}
                </span>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  <span className="text-gray-700">{event.location}</span>
                </div>
              )}

              {/* Submitted By */}
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="text-gray-700">
                  <span className="font-medium">{event.extendedProps.submittedByName}</span>
                  {event.extendedProps.submittedByOrg && (
                    <span className="text-gray-500"> · {event.extendedProps.submittedByOrg}</span>
                  )}
                </div>
              </div>

              {/* Submitted Date */}
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-500">Submitted {formatDate(event.createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
