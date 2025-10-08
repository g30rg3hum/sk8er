import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json(
        { error: "Missing email or code in params" },
        { status: 400 }
      );
    }

    const supabase = await createClient(true);
    // verify verification code, logs in user.
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      // verification code is wrong
      return NextResponse.json(
        // error message from supabase
        { error: error.message || "Invalid verification code" },
        { status: 400 }
      );
    } else {
      // get the user id first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user!.id;

      // sign out immediately after verification.
      await supabase.auth.signOut();

      // and delete the user record.
      // don't need it anymore, already verified code alongside the email.
      // safe for endpoint because only deleted by the user (thru OTP verification)
      await supabase.auth.admin.deleteUser(userId);

      // on next step, the user account + profile creation happens.

      // verification code is correct
      return NextResponse.json({ message: "Verification successful" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
