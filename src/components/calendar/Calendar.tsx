"use client";

import { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DatesSetArg, EventInput } from "@fullcalendar/core";
import EventModal from "./EventModal";

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

export default function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = useCallback(async (start: string, end: string) => {
    try {
      const response = await fetch(
        `/api/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
      );
      if (response.ok) {
        const data: CalendarEvent[] = await response.json();
        // Convert null end dates to undefined for FullCalendar
        const formattedData: EventInput[] = data.map((event) => ({
          ...event,
          end: event.end || undefined,
        }));
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
    const endStr = event.end ? event.end.toISOString() : null;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: endStr,
      allDay: event.allDay,
      description: event.extendedProps.description || null,
      location: event.extendedProps.location || null,
      color: event.backgroundColor || "#1a73e8",
      extendedProps: {
        submittedByName: event.extendedProps.submittedByName,
        submittedByOrg: event.extendedProps.submittedByOrg,
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
        timeZone="local"
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
