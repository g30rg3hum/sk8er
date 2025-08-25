"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import clsx from "clsx";
import toast from "react-hot-toast";
import { getClientSideUser } from "@/utils/supabase/queries/auth";

const fullSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    code: z
      .string()
      .min(6, "Verification code must be 6 digits")
      .max(6, "Verification code must be 6 digits")
      .regex(/^\d{6}$/, "Verification code must contain only numbers"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
const defaultValues: FullFormData = {
  email: "",
  code: "",
  username: "",
  password: "",
  confirmPassword: "",
};
type FullFormData = z.infer<typeof fullSchema>;
type FieldName = keyof FullFormData;

// Individual steps
const steps = [
  {
    step: "email",
    fields: ["email"],
  },
  {
    step: "verification",
    fields: ["code"],
  },
  {
    step: "details",
    fields: ["username", "password"],
  },
];
const lastStepNumber = steps.length - 1;

export default function SignUpForm() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Step 1. Send verification email
  const sendVerificationEmail = async (email: string) => {
    const id = toast.loading("Sending verification code...");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send verification code");
        return false;
      } else {
        toast.success("Verification code sent successfully");
        return true;
      }
    } catch {
      toast.error("Failed to send verification code");
      return false;
    } finally {
      toast.dismiss(id);
      setIsLoading(false);
    }
  };

  // Step 2. Check verification code, logs in user.
  const checkVerificationCode = async (email: string, code: string) => {
    const id = toast.loading("Verifying code...");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Verification code is incorrect");
        return false;
      } else {
        toast.success("Successfully verified code");
        return true;
      }
    } catch {
      toast.error("Failed to verify code");
      return false;
    } finally {
      toast.dismiss(id);
      setIsLoading(false);
    }
  };

  // Step 3. Complete profile
  const completeProfile = async (
    email: string,
    username: string,
    password: string
  ) => {
    const id = toast.loading("Creating profile...");
    setIsLoading(true);

    try {
      // get the current logged in user's id
      const user = await getClientSideUser();

      if (!user) {
        toast.error(
          "There was an authentication issue during sign up - please try again from the start"
        );
        return false;
      }

      // create profile record
      const createProfileRes = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          email,
          username,
        }),
      });

      // change password
      const changePasswordRes = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          password,
        }),
      });

      if (!createProfileRes.ok || !changePasswordRes) {
        const createProfileData = await createProfileRes.json();
        const changePasswordData = await changePasswordRes.json();

        if (createProfileData.error) toast.error(createProfileData.error);
        if (changePasswordData.error) toast.error(changePasswordData.error);

        if (!createProfileData.error && !changePasswordData.error)
          toast.error("Failed to create profile");

        return false;
      } else {
        toast.success("Profile created successfully");
        return true;
      }
    } catch {
      toast.error("Failed to create profile");
      return false;
    } finally {
      toast.dismiss(id);
      setIsLoading(false);
    }
  };

  // Step navigation
  const isLastStep = currentStep === lastStepNumber;
  const next = async () => {
    // Validation
    const currentFields = steps[currentStep].fields;
    const output = await trigger(currentFields as FieldName[], {
      shouldFocus: true, // Focus on first invalid field
    });

    // Validation errors
    if (!output) return;

    const email = form.getValues("email");
    const code = form.getValues("code");
    const username = form.getValues("username");
    const password = form.getValues("password");

    // Send verification email
    if (currentStep === 0) {
      const success = await sendVerificationEmail(email);

      if (!success) return;
    }

    // Verify code
    if (currentStep === 1) {
      const success = await checkVerificationCode(email, code);

      if (!success) return;
    }

    if (currentStep === lastStepNumber) {
      const success = await completeProfile(email, username, password);

      if (!success) return;
    } else {
      setCurrentStep((step) => step + 1);
    }
  };
  const prev = () => {
    if (currentStep > 0) setCurrentStep((step) => step - 1);
  };

  // React hook form
  const form = useForm<FullFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues,
  });
  const {
    control,
    // handleSubmit,
    // reset,
    trigger,
    // formState: { errors, isSubmitting },
  } = form;

  // const onSubmit: SubmitHandler<FullFormData> = (data: FullFormData) => {
  //   console.log(data);
  //   reset();
  // };

  return (
    <Form {...form}>
      <form>
        <div className="flex flex-col gap-3 mb-4">
          {currentStep === 0 && (
            <>
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="john.doe@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {currentStep === 1 && (
            <>
              <FormField
                control={control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {currentStep === 2 && (
            <>
              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="john.doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep === 1 && (
            <Button
              className="w-1/2"
              onClick={prev}
              type="button"
              variant="secondary"
            >
              Back
            </Button>
          )}
          <Button
            className={clsx(
              currentStep !== 1 ? "w-full" : "w-1/2",
              "transition-none"
            )}
            onClick={next}
            type="button"
            disabled={isLoading}
          >
            {isLastStep ? "Create" : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
