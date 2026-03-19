"use client";

import { useState, useMemo } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PendingEventsTable, AllEventsTable, UsersTable } from "@/components/admin";

import { EventForm } from "@/components/dashboard";

type Tab = "pending" | "all" | "create" | "users";

export default function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const isAdmin = useMemo(() => {
    if (!isLoaded || !isSignedIn || !user) return null;
    const role = user.publicMetadata?.role as string | undefined;
    return role === "admin";
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in required</h1>
        <p className="text-gray-600">Please sign in to access the admin panel.</p>
        <SignInButton mode="modal">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Checking permissions...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
        <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
        >
          Go to Calendar
        </button>
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
      </div>

      <header className="bg-transparent shadow-none pt-4">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 flex items-center justify-between">
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
          <h1 className="text-xl font-semibold text-white bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            Admin Panel
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50/80 px-6 pt-6">
            <nav className="-mb-px flex gap-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "pending"
                    ? "border-b-2 border-[#00a99d] text-[#00a99d]"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                }`}
              >
                Pending Approval
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "border-b-2 border-[#00a99d] text-[#00a99d]"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "create"
                    ? "border-b-2 border-[#00a99d] text-[#00a99d]"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                }`}
              >
                + Create Event
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "users"
                    ? "border-b-2 border-[#00a99d] text-[#00a99d]"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                }`}
              >
                Users
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "pending" && (
              <div>
                <h2 className="mb-4 text-lg font-medium text-gray-900">Events Pending Approval</h2>
                <PendingEventsTable />
              </div>
            )}
            {activeTab === "all" && (
              <div>
                <h2 className="mb-4 text-lg font-medium text-gray-900">All Events</h2>
                <AllEventsTable />
              </div>
            )}
            {activeTab === "create" && (
              <div>
                <h2 className="mb-4 text-lg font-medium text-gray-900">Create New Event</h2>
                <p className="mb-6 text-sm text-gray-600">
                  Events created by admins are automatically approved.
                </p>
                <EventForm
                  onSubmit={async (data) => {
                    const response = await fetch("/api/events", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || "Failed to create event");
                    }
                    setActiveTab("all");
                  }}
                  submitLabel="Create Event"
                />
              </div>
            )}
            {activeTab === "users" && (
              <div>
                <h2 className="mb-4 text-lg font-medium text-gray-900">User Management</h2>
                <p className="mb-6 text-sm text-gray-600">
                  Manage user roles. Admins have full access. Contributors can submit events.
                </p>
                <UsersTable />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
