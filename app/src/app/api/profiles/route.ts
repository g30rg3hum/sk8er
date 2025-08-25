import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { id, username } = await request.json();

    if (!id || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient(true);

    // get email from supabase auth.user
    const { data, error: getEmailError } =
      await supabase.auth.admin.getUserById(id);

    if (getEmailError) {
      return NextResponse.json(
        { error: getEmailError.message },
        { status: 500 }
      );
    }

    const { status, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id,
        email: data.user.email!, // successfully retrieved user here.
        username,
      });

    if (insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: status }
      );
    else {
      return NextResponse.json(
        { message: "Profile created successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
