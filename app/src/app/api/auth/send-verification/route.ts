import VerificationEmail from "@/components/emails/verification";
import generateRandomPassword from "@/utils/random/password";
import resend from "@/utils/resend/client";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient(true);
    // generate verification code
    const res = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password: generateRandomPassword(), // temporary random password
    });
    const verificationCode = res.data.properties?.email_otp;

    if (verificationCode) {
      // send verification code
      const { data, error } = await resend.emails.send({
        from: "noreply@sk8er.xyz",
        to: email,
        subject: "Sign up verification code",
        react: VerificationEmail({ verificationCode }),
      });

      if (error) {
        console.error(error);
        // problem sending email
        return NextResponse.json({ error }, { status: 500 });
      } else {
        // email with verification code successfully sent
        return NextResponse.json(data);
      }
    } else {
      // failure to generate verification code
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
  } catch (error) {
    // error at any step
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
