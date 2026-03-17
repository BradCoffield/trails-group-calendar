"use client";

import { useState, useEffect } from "react";
import ColorPicker from "@/components/ui/ColorPicker";

export interface EventFormData {
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string;
  submitted_by_org: string;
  description: string;
  color: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
}

interface ValidationErrors {
  title?: string;
  start_time?: string;
  end_time?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
  submitted_by_org?: string;
  description?: string;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  showSubmitterFields?: boolean;
}

function addMinutes(dateTimeStr: string, minutes: number): string {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString().slice(0, 16);
}

function getDefaultStartTime(): string {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  return now.toISOString().slice(0, 16);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Submit Event",
  showSubmitterFields = false,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    start_time: initialData?.start_time || getDefaultStartTime(),
    end_time: initialData?.end_time || "",
    all_day: initialData?.all_day || false,
    location: initialData?.location || "",
    submitted_by_org: initialData?.submitted_by_org || "",
    description: initialData?.description || "",
    color: initialData?.color || "#00a99d",
    submitted_by_name: initialData?.submitted_by_name || "",
    submitted_by_email: initialData?.submitted_by_email || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasAutoFilledEnd, setHasAutoFilledEnd] = useState(false);

  useEffect(() => {
    if (
      formData.start_time &&
      !formData.end_time &&
      !formData.all_day &&
      !hasAutoFilledEnd &&
      !initialData?.end_time
    ) {
      setFormData((prev) => ({
        ...prev,
        end_time: addMinutes(prev.start_time, 60),
      }));
      setHasAutoFilledEnd(true);
    }
  }, [
    formData.start_time,
    formData.end_time,
    formData.all_day,
    hasAutoFilledEnd,
    initialData?.end_time,
  ]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Title is required";
        if (value.length > 200) return "Title must be 200 characters or less";
        break;
      case "start_time":
        if (!value) return "Start date/time is required";
        if (new Date(value) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          return "Start date cannot be more than 1 day in the past";
        }
        break;
      case "end_time":
        if (value && formData.start_time && new Date(value) <= new Date(formData.start_time)) {
          return "End time must be after start time";
        }
        break;
      case "submitted_by_name":
        if (showSubmitterFields && !value.trim()) return "Name is required";
        if (value.length > 100) return "Name must be 100 characters or less";
        break;
      case "submitted_by_email":
        if (showSubmitterFields && !value.trim()) return "Email is required";
        if (value && !EMAIL_REGEX.test(value)) return "Please enter a valid email address";
        break;
      case "submitted_by_org":
        if (showSubmitterFields && !value.trim()) return "Organization is required";
        if (value.length > 200) return "Organization must be 200 characters or less";
        break;
      case "description":
        if (value.length > 2000) return "Description must be 2000 characters or less";
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    errors.title = validateField("title", formData.title);
    errors.start_time = validateField("start_time", formData.start_time);
    errors.end_time = validateField("end_time", formData.end_time);
    errors.description = validateField("description", formData.description);

    if (showSubmitterFields) {
      errors.submitted_by_name = validateField(
        "submitted_by_name",
        formData.submitted_by_name || "",
      );
      errors.submitted_by_email = validateField(
        "submitted_by_email",
        formData.submitted_by_email || "",
      );
      errors.submitted_by_org = validateField("submitted_by_org", formData.submitted_by_org);
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([, v]) => v !== undefined),
    ) as ValidationErrors;

    setFieldErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = formData[name as keyof EventFormData];
    const error = validateField(name, typeof value === "string" ? value : "");
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors above before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      if (!initialData) {
        setFormData({
          title: "",
          start_time: getDefaultStartTime(),
          end_time: "",
          all_day: false,
          location: "",
          submitted_by_org: "",
          description: "",
          color: "#00a99d",
          submitted_by_name: "",
          submitted_by_email: "",
        });
        setTouched({});
        setFieldErrors({});
        setHasAutoFilledEnd(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = (name: string) =>
    `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
      touched[name] && fieldErrors[name as keyof ValidationErrors]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }`;

  const renderFieldError = (name: keyof ValidationErrors) =>
    touched[name] && fieldErrors[name] ? (
      <p className="mt-1 text-sm text-red-600">{fieldErrors[name]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          maxLength={200}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          onBlur={() => handleBlur("title")}
          className={inputClassName("title")}
        />
        {renderFieldError("title")}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="all_day"
          checked={formData.all_day}
          onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="all_day" className="text-sm font-medium text-gray-700">
          All Day Event
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
            Start Date/Time *
          </label>
          <input
            type={formData.all_day ? "date" : "datetime-local"}
            id="start_time"
            required
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            onBlur={() => handleBlur("start_time")}
            className={inputClassName("start_time")}
          />
          {renderFieldError("start_time")}
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
            End Date/Time
          </label>
          <input
            type={formData.all_day ? "date" : "datetime-local"}
            id="end_time"
            value={formData.end_time}
            min={formData.start_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            onBlur={() => handleBlur("end_time")}
            className={inputClassName("end_time")}
          />
          {renderFieldError("end_time")}
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          maxLength={200}
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {showSubmitterFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="submitted_by_name" className="block text-sm font-medium text-gray-700">
              Your Name *
            </label>
            <input
              type="text"
              id="submitted_by_name"
              required
              maxLength={100}
              value={formData.submitted_by_name || ""}
              onChange={(e) => setFormData({ ...formData, submitted_by_name: e.target.value })}
              onBlur={() => handleBlur("submitted_by_name")}
              className={inputClassName("submitted_by_name")}
            />
            {renderFieldError("submitted_by_name")}
          </div>
          <div>
            <label htmlFor="submitted_by_email" className="block text-sm font-medium text-gray-700">
              Your Email *
            </label>
            <input
              type="email"
              id="submitted_by_email"
              required
              value={formData.submitted_by_email || ""}
              onChange={(e) => setFormData({ ...formData, submitted_by_email: e.target.value })}
              onBlur={() => handleBlur("submitted_by_email")}
              className={inputClassName("submitted_by_email")}
            />
            {renderFieldError("submitted_by_email")}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="submitted_by_org" className="block text-sm font-medium text-gray-700">
          Organization {showSubmitterFields && "*"}
        </label>
        <input
          type="text"
          id="submitted_by_org"
          required={showSubmitterFields}
          maxLength={200}
          value={formData.submitted_by_org}
          onChange={(e) => setFormData({ ...formData, submitted_by_org: e.target.value })}
          onBlur={() => handleBlur("submitted_by_org")}
          placeholder="e.g., Billings Public Library"
          className={inputClassName("submitted_by_org")}
        />
        {showSubmitterFields && renderFieldError("submitted_by_org")}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
          <span className="ml-2 text-xs text-gray-400">{formData.description.length}/2000</span>
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={2000}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          onBlur={() => handleBlur("description")}
          className={inputClassName("description")}
        />
        {renderFieldError("description")}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Color</label>
        <ColorPicker
          value={formData.color}
          onChange={(color) => setFormData({ ...formData, color })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
