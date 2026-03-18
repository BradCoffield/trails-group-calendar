import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { corsResponse, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(req: Request) {
  try {
    const adminUser = await currentUser();
    if (!adminUser) {
      return corsResponse({ error: "Unauthorized" }, 401);
    }

    const adminRole = adminUser.publicMetadata?.role as string | undefined;
    if (adminRole !== "admin") {
      return corsResponse({ error: "Forbidden" }, 403);
    }

    const { userId, role } = await req.json();

    if (!userId) {
      return corsResponse({ error: "userId is required" }, 400);
    }

    if (role !== "admin" && role !== "contributor" && role !== null) {
      return corsResponse(
        { error: "role must be 'admin', 'contributor', or null" },
        400
      );
    }

    if (userId === adminUser.id) {
      return corsResponse({ error: "Cannot change your own role" }, 400);
    }

    const client = await clerkClient();
    const updated = await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    return corsResponse({
      success: true,
      user: {
        id: updated.id,
        role: updated.publicMetadata?.role || null,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return corsResponse({ error: "Failed to update user role" }, 500);
  }
}
