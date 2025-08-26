import { randomBytes } from "crypto";

export default function generateRandomPassword(length: number = 16): string {
  return randomBytes(length).toString("base64").slice(0, length);
}
