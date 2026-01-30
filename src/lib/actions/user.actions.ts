"use server";

import { getDatabase } from "@/lib/db/database";
import { UserService } from "@/lib/services/user.service";
import { revalidatePath } from "next/cache";

/**
 * Check if onboarding is required
 */
export async function checkOnboardingStatus() {
  const db = await getDatabase();
  const userService = new UserService(db);
  return userService.isOnboardingNeeded();
}

/**
 * Handle initial admin setup
 */
export async function completeOnboarding(data: {
  username: string;
  password: string;
  emoji: string;
  color: string;
}) {
  try {
    const db = await getDatabase();
    const userService = new UserService(db);
    await userService.completeOnboarding(
      data.username,
      data.password,
      data.emoji,
      data.color
    );
    
    revalidatePath("/");
    revalidatePath("/login");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Failed to complete onboarding" };
  }
}

/**
 * Get all available user profiles
 */
export async function getProfiles() {
  const db = await getDatabase();
  const userService = new UserService(db);
  return userService.getProfiles();
}

/**
 * Create a new user profile (Admin only)
 */
export async function createProfile(data: {
  username: string;
  password?: string;
  displayName: string;
  emoji: string;
  color: string;
  isAdmin: boolean;
}) {
  try {
    const db = await getDatabase();
    const userService = new UserService(db);
    await userService.createUser({
        username: data.username,
        password: data.password || 'changeme', // Default if not provided
        displayName: data.displayName,
        emoji: data.emoji,
        color: data.color,
        isAdmin: data.isAdmin,
    });
    revalidatePath("/settings");
    revalidatePath("/profiles");
    return { success: true };
  } catch (error) {
    console.error("Error creating profile:", error);
    return { error: "Failed to create profile" };
  }
}

/**
 * Delete a user profile (Admin only)
 */
export async function deleteProfile(id: string) {
    try {
      const db = await getDatabase();
      const userService = new UserService(db);
      await userService.deleteUser(id);
      revalidatePath("/settings");
      revalidatePath("/profiles");
      return { success: true };
    } catch (error) {
      console.error("Error deleting profile:", error);
      return { error: "Failed to delete profile" };
    }
}
