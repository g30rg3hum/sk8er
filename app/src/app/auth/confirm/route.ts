import { createClient } from "@/utils/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// NOTE: email confirmation turned on by default.
// Confirmation email link.
// Exchange secure code for Auth token.
// Logs in user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Redirect to specified redirect url or **root**
      redirect(next);
    }
  }

  // TODO: add instructions, e.g. expired, information from error const.
  redirect("/error");
}
