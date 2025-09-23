import { createClient } from "../server";
import { AllowedFileType } from "../types/assets.types";
import { validateFile } from "./validation";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileType?: AllowedFileType; // only if successful.
}
export async function uploadAsset(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileValidation = validateFile(file);
  if (!fileValidation.isValid) {
    return {
      success: false,
      error: fileValidation.error,
    };
  }

  // requires server-side client to match uid in RLS policy
  const supabase = await createClient();

  // Begin to try to upload.
  try {
    // Generate the unique file name.
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.${fileExtension}`;

    // attempt to upload
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(fileName, file, {
        cacheControl: "3600", // 1 hour
        upsert: false, // don't overwrite existing files
      });

    if (uploadError) {
      // console.error("Upload error:", uploadError);
      return {
        success: false,
        error: `An error occurred while uploading asset: ${uploadError.message}`,
      };
    }

    // Get the public URL to retrieve it
    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      fileType: fileValidation.fileType,
    };
  } catch {
    // console.error("Upload error", error);
    return {
      success: false,
      error: "An unexpected error occurred during file upload.",
    };
  }
}
