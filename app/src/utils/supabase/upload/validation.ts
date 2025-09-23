import { oneMB } from "@/utils/constants/sizes/mb";
import { ALLOWED_MIME_TYPES, AllowedFileType } from "../types/assets.types";

export const MAX_FILE_SIZES = {
  video: 100 * oneMB,
  image: 10 * oneMB,
};
export const MAX_FILE_SIZE = Math.max(
  MAX_FILE_SIZES.video,
  MAX_FILE_SIZES.image
);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: AllowedFileType;
}

export function validateFile(file: File): ValidationResult {
  if (!file) return { isValid: false, error: "No file provided" };

  // determine the file type
  let fileType: AllowedFileType | null = null;

  if (ALLOWED_MIME_TYPES.video.includes(file.type)) fileType = "video";

  if (ALLOWED_MIME_TYPES.image.includes(file.type)) fileType = "image";

  if (!fileType)
    return {
      isValid: false,
      error: `Type ${file.type} is not supported. Please upload a video (MP4, MOV, QUICKTIME, AVI) or image (JPG, JPEG, PNG, WEBP, GIF)`,
    };

  // now check file size
  const maxSize = MAX_FILE_SIZES[fileType];
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / oneMB;

    return {
      isValid: false,
      error: `File size for ${fileType} exceeds limit. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  // additional validation for files to avoid corrupted/tiny files
  if (fileType === "video") {
    if (file.size < 1024) {
      // less than 1KB
      return {
        isValid: false,
        error: "Video file is corrupted or too small.",
      };
    }
  }

  if (fileType === "image") {
    if (file.size < 100) {
      // less than 100 bytes
      return {
        isValid: false,
        error: "Image file is corrupted or too small.",
      };
    }
  }

  // otherwise valid
  return { isValid: true, fileType };
}
