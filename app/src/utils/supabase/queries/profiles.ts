import { createClient } from "../server";
import { Tables } from "../types/database.types";

export type Profile = Tables<"profiles">;

export async function getUserProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  return data;
}

export async function getUserProfileByEmail(
  email: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;

  return data;
}
