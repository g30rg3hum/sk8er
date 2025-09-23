import { z } from "zod";
import { absenceMessage } from "../validation-messages";
import { MAX_FILE_SIZE } from "@/utils/supabase/upload/validation";
import { oneMB } from "../../sizes/mb";
import { ALLOWED_MIME_TYPES } from "@/utils/supabase/types/assets.types";

export const schema = z.object({
  type: z.enum(["showcase", "help"]),
  title: z
    .string()
    .min(1, absenceMessage)
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, absenceMessage)
    .max(1000, "Description must be less than 1000 characters"),
  assetFile: z
    .instanceof(File, { error: "Please upload a file" })
    .optional() // initially undefined
    // basic form validation - detailed validation occurs upon upload
    .refine((file) => file !== undefined, "Please upload a file")
    .refine((file) => file && file.size > 0, "File should not be empty")
    .refine(
      (file) => file && file.size <= MAX_FILE_SIZE,
      `File size exceeds the limit of ${MAX_FILE_SIZE / oneMB}MB`
    )
    .refine(
      (file) =>
        file &&
        (ALLOWED_MIME_TYPES.image.includes(file.type) ||
          ALLOWED_MIME_TYPES.video.includes(file.type)),
      "File type is not supported. Please upload a video (MP4, MOV, QUICKTIME, AVI) or image (JPG, JPEG, PNG, WEBP, GIF)"
    ),
});
