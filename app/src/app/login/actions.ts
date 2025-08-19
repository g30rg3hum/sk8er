"use server";

import { createClient } from "@/utils/supabase/server";
import { isString } from "@/utils/types/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  // Check that data are strings.
  if (!isString(email) || !isString(password)) {
    throw new Error("Invalid input");
  }

  const data = {
    email,
    password,
  };

  // Attempt to sign in
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  // Sign in successful
  // Purge cached data across all pages
  revalidatePath("/", "layout");
  // Redirect to home
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!isString(email) || !isString(password)) {
    throw new Error("Invalid input");
  }

  const data = {
    email,
    password,
  };

  // NOTE: no error when signing up with duplicate email (VERIFIED OR NOT).
  // TODO: need to handle duplicate emails.
  const { error } = await supabase.auth.signUp(data);

  // NOTE: throws error if too frequent signUp requests. over_email_send_rate_limit
  // TODO: handle and feedback this error.
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  // Email confirmation still required.
  // Never goes to "/", middleware always redirects to "/login"
  // TODO: do we want to be able to go to "/" even not logged in?
  redirect("/");
}
