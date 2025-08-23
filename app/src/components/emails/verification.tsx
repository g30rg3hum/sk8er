import { Body, Head, Html, Preview, Text } from "@react-email/components";

interface Props {
  verificationCode: string;
}
export default function VerificationEmail({ verificationCode }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code is: {verificationCode}</Preview>
      <Body>
        <Text>{verificationCode}</Text>
      </Body>
    </Html>
  );
}

// TODO: customise this email better.
