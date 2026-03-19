import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { corsResponse, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await currentUser();
    if (!adminUser) {
      return corsResponse({ error: "Unauthorized" }, 401);
    }

    const adminRole = adminUser.publicMetadata?.role as string | undefined;
    if (adminRole !== "admin") {
      return corsResponse({ error: "Forbidden" }, 403);
    }

    const { userId } = await req.json();

    if (!userId) {
      return corsResponse({ error: "userId is required" }, 400);
    }

    if (userId === adminUser.id) {
      return corsResponse({ error: "Cannot delete yourself" }, 400);
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return corsResponse({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return corsResponse({ error: "Failed to delete user" }, 500);
  }
}
