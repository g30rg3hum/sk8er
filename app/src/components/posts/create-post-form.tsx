"use client";

import { ALLOWED_MIME_TYPES } from "@/utils/supabase/types/assets.types";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { startTransition, useRef } from "react";
import { createPost } from "@/utils/actions/posts";
import toast from "react-hot-toast";
import { schema } from "@/utils/constants/form/schemas/create-post";

export type FormData = z.infer<typeof schema>;
const defaultValues: FormData = {
  type: "showcase",
  title: "",
  description: "",
  assetFile: undefined,
};

export default function CreatePostForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData(); // actual FormData object
    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    // asset file is optional in schema but validated before submission.
    // should be present
    if (data.assetFile) formData.append("assetFile", data.assetFile);

    // BEGIN TO CREATE POST
    const id = toast.loading("Creating post...");

    const result = await createPost(formData);

    // console.log(result);
    if (result.success) {
      toast.success("Post successfully created!");
      reset();
      fileInputRef.current!.value = ""; // manually clear file input el
    } else
      // back-end errors are vague and sensitive to user, show generic error message
      // because any sort of error that occurs here, can't be fixed by user.
      toast.error(
        "An issue occurred in the server while creating post. Please contact support."
      );

    toast.dismiss(id);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Tabs
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="mb-4"
                >
                  <TabsList {...field}>
                    <TabsTrigger value="showcase">Showcase</TabsTrigger>
                    <TabsTrigger value="help">Help</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 mb-6">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="My awesome kickflip"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Landed my first ever one!"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="assetFile"
            render={({ field: { ref, name, onBlur, onChange } }) => (
              <FormItem>
                <FormLabel>Upload image/video</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    placeholder="Upload file"
                    ref={(e) => {
                      ref(e); // React hook form ref
                      fileInputRef.current = e; // local ref
                    }}
                    accept={ALLOWED_MIME_TYPES.image
                      .concat(ALLOWED_MIME_TYPES.video)
                      .join(",")}
                    name={name}
                    onBlur={onBlur}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          Post
        </Button>
      </form>
    </Form>
  );
}
