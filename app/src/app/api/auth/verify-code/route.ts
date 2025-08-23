import { createClient } from "@/utils/supabase/server";
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

    const supabase = await createClient();
    // verify verification code
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      // verification code is wrong
      return NextResponse.json(
        { error: error.message || "Invalid verification code" },
        { status: 400 }
      );
    } else {
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
