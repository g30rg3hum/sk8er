import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { id, email, username } = await request.json();

    if (!id || !email || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { status, error } = await supabase.from("profiles").insert({
      id,
      email,
      username,
    });

    if (error)
      return NextResponse.json({ error: error.message }, { status: status });
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
