import VerificationEmail from "@/components/emails/verification";
import generateRandomPassword from "@/utils/random/password";
import resend from "@/utils/resend/client";
import { getUserProfileByEmail } from "@/utils/supabase/queries/profiles";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabaseAdmin = await createClient(true);

    // check that profile exists
    // only send otp > sign up if profile doesn't exist
    const profile = await getUserProfileByEmail(email);

    if (profile)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );

    // generate verification code to complete sign up.
    let res = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password: generateRandomPassword(), // temporary random password
    });
    // verificationCode will be defined if unverified first sign up.
    let verificationCode = res.data.properties?.email_otp;
    let errorCode = res.error?.code;

    // if verified user already, need to generate sign in otp as verificationCode
    if (errorCode === "email_exists") {
      res = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      verificationCode = res.data.properties?.email_otp;
      errorCode = res.error?.code;
    }

    // at this point, verificationCode should be defined
    if (verificationCode) {
      // send verification code
      const { data, error } = await resend.emails.send({
        from: "noreply@sk8er.xyz",
        to: email,
        subject: "Sign up verification code",
        react: VerificationEmail({ verificationCode }),
      });

      if (error) {
        // problem sending email
        return NextResponse.json({ error }, { status: 500 });
      } else {
        // email with verification code successfully sent
        return NextResponse.json(data);
      }
    } else {
      // failure to generate verification code
      // default error
      return NextResponse.json(
        { error: res.error?.message, error_code: errorCode },
        { status: 500 }
      );
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
