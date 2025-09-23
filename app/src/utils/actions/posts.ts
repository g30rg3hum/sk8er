"use server";

import { createClient } from "../supabase/server";
import { FormData as CreatePostFormData } from "@/components/posts/create-post-form";
import { z } from "zod";
import { uploadAsset } from "../supabase/upload/asset";
import { schema } from "../constants/form/schemas/create-post";

interface createPostResult {
  success: boolean;
  error?: string;
}
export async function createPost(
  formData: FormData
): Promise<createPostResult> {
  const supabase = await createClient();

  // Get the current user for which to create the post
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Need to be logged in to create a post
  if (authError || !user)
    return {
      success: false,
      error: "You must be logged in to create a post.",
    };

  // Logged in, need to get the data
  const rawFormData = Object.fromEntries(formData) as CreatePostFormData;
  // console.log(rawFormData);

  // Server-side validation on top of the client-side form validation that already exists
  // Using the same schema as form, should be the same anyways, just backup validation.
  const validatedFields = schema.safeParse(rawFormData);

  if (!validatedFields.success)
    return {
      success: false,
      error: z.prettifyError(validatedFields.error), // prettified string.
    };

  // passed validation, now create the post with the form data.
  try {
    const { type, title, description, assetFile } = rawFormData;

    // Try to upload the file first.
    const uploadResult = await uploadAsset(assetFile!, user.id);

    // console.log(uploadResult);

    if (!uploadResult.success)
      return {
        success: false,
        error: uploadResult.error!, // should be defined whenever success: false
      };

    // File uploaded successful, now create the post in database.
    const { error: createPostRecordError } = await supabase
      .from("posts")
      .insert({
        type,
        title,
        description,
        asset_url: uploadResult.url!, // defined upon success.
        asset_type: uploadResult.fileType!,
        user_id: user.id,
      });

    if (createPostRecordError) {
      return {
        success: false,
        error: createPostRecordError.message,
      };
    }

    return { success: true };
  } catch {
    // Unexpected error
    // console.error(error)
    return {
      success: false,
      error: "An unexpected error in the server occurred.",
    };
  }
}
