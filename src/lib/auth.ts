import { currentUser } from "@clerk/nextjs/server";

export type UserRole = "admin" | "contributor" | null;

export async function getUserRole(): Promise<UserRole> {
  const user = await currentUser();
  if (!user) return null;

  const role = user.publicMetadata?.role as string | undefined;
  if (role === "admin") return "admin";
  if (role === "contributor") return "contributor";
  return null;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

export async function isContributor(): Promise<boolean> {
  const role = await getUserRole();
  return role === "contributor";
}

export async function isAdminOrContributor(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin" || role === "contributor";
}

export async function getCurrentUserInfo() {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.emailAddresses[0]?.emailAddress || "Unknown User",
    email: user.emailAddresses[0]?.emailAddress,
  };
}
