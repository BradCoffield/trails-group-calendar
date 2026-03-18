import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { corsResponse, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return corsResponse({ error: "Unauthorized" }, 401);
    }

    const role = user.publicMetadata?.role as string | undefined;
    if (role !== "admin") {
      return corsResponse({ error: "Forbidden" }, 403);
    }

    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ limit: 100 });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name:
        u.firstName && u.lastName
          ? `${u.firstName} ${u.lastName}`
          : u.emailAddresses[0]?.emailAddress || "Unknown",
      email: u.emailAddresses[0]?.emailAddress || "",
      role: (u.publicMetadata?.role as string) || null,
      createdAt: u.createdAt,
    }));

    return corsResponse(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return corsResponse({ error: "Failed to fetch users" }, 500);
  }
}
