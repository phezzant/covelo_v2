"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelInvite(inviteId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("journey_partner")
    .delete()
    .eq("id", inviteId)
    .or(`adult_id.eq.${user.id},child_id.eq.${user.id}`)
    .eq("status", "pending");

  if (error) return { error: error.message };
  revalidatePath("/app/profile");
  return {};
}

export async function updateInviteEmail(
  inviteId: string,
  newEmail: string,
  newName?: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("journey_partner")
    .update({
      invited_email: newEmail.trim(),
      ...(newName?.trim() ? { invited_name: newName.trim() } : {}),
    })
    .eq("id", inviteId)
    .or(`adult_id.eq.${user.id},child_id.eq.${user.id}`)
    .eq("status", "pending");

  if (error) return { error: error.message };
  revalidatePath("/app/profile");
  return {};
}
