"use client";

import { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DatesSetArg, EventInput } from "@fullcalendar/core";
import EventModal from "./EventModal";
import { CALENDAR_TIME_ZONE, toZonedDateTimeInput } from "@/lib/timezone";

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
    timeZone: string;
  };
}

export default function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = useCallback(async (startStr: string, endStr: string) => {
    try {
      // Widen the range: the API filters on instants, but events are
      // displayed at wall time in their own zones (up to ±14h skew)
      const start = new Date(startStr);
      start.setUTCDate(start.getUTCDate() - 2);
      const end = new Date(endStr);
      end.setUTCDate(end.getUTCDate() + 2);

      const response = await fetch(
        `/api/events?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
      );
      if (response.ok) {
        const data: CalendarEvent[] = await response.json();
        // Feed FullCalendar naive wall-time strings in each event's own
        // zone (calendar timeZone="UTC" renders them verbatim); the real
        // instants stay in extendedProps for the modal
        const formattedData: EventInput[] = data.map((event) => {
          const tz = event.extendedProps.timeZone || CALENDAR_TIME_ZONE;
          const wallStart = toZonedDateTimeInput(event.start, tz);
          const wallEnd = event.end ? toZonedDateTimeInput(event.end, tz) : undefined;
          return {
            ...event,
            start: event.allDay ? wallStart.slice(0, 10) : wallStart,
            end: wallEnd ? (event.allDay ? wallEnd.slice(0, 10) : wallEnd) : undefined,
            extendedProps: {
              ...event.extendedProps,
              description: event.description,
              location: event.location,
              startInstant: event.start,
              endInstant: event.end,
            },
          };
        });
        setEvents(formattedData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      fetchEvents(arg.startStr, arg.endStr);
    },
    [fetchEvents],
  );

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const event = arg.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.extendedProps.startInstant,
      end: event.extendedProps.endInstant || null,
      allDay: event.allDay,
      description: event.extendedProps.description || null,
      location: event.extendedProps.location || null,
      color: event.backgroundColor || "#1a73e8",
      extendedProps: {
        submittedByName: event.extendedProps.submittedByName,
        submittedByOrg: event.extendedProps.submittedByOrg,
        timeZone: event.extendedProps.timeZone,
      },
    });
    setIsModalOpen(true);
  }, []);

  return (
    <div className="h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listMonth",
        }}
        events={events}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        timeZone="UTC"
        height="100%"
        eventDisplay="block"
        dayMaxEvents={3}
        nowIndicator={true}
      />
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
