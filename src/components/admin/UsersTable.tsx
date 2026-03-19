"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "contributor" | null;
  createdAt: number;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteMessage(null);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: inviteEmail.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteMessage({ type: "success", text: `Invitation sent to ${inviteEmail}` });
        setInviteEmail("");
      } else {
        setInviteMessage({ type: "error", text: data.error || "Failed to send invitation" });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      setInviteMessage({ type: "error", text: "Failed to send invitation" });
    } finally {
      setInviting(false);
    }
  };

  const handleSetRole = async (userId: string, role: "admin" | "contributor" | null) => {
    setUpdating(userId);
    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      if (response.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) {
      return;
    }

    setUpdating(userId);
    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: "admin" | "contributor" | null) => {
    if (role === "admin") {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Admin
        </span>
      );
    }
    if (role === "contributor") {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Contributor
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
        No Role
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleInvite} className="mb-6 flex gap-3">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter email to invite..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={inviting}
        />
        <button
          type="submit"
          disabled={inviting || !inviteEmail.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {inviting ? "Sending..." : "Send Invite"}
        </button>
      </form>

      {inviteMessage && (
        <div
          className={`mb-4 rounded-md px-4 py-3 text-sm ${
            inviteMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {inviteMessage.text}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    {updating === user.id ? (
                      <span className="text-gray-400">Updating...</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleSetRole(user.id, "admin")}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Make Admin
                          </button>
                        )}
                        {user.role !== "contributor" && (
                          <button
                            onClick={() => handleSetRole(user.id, "contributor")}
                            className="text-green-600 hover:text-green-800"
                          >
                            {user.role === "admin" ? "Demote" : "Make Contributor"}
                          </button>
                        )}
                        {user.role !== null && (
                          <button
                            onClick={() => handleSetRole(user.id, null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove Role
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
