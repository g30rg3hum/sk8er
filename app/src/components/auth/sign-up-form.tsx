import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

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
    fields: ["username", "password", "confirmPassword"],
  },
];
const lastStepNumber = steps.length - 1;

interface Props {
  closeDialog?: () => void;
  setIsLoginTabDisabled?: (value: boolean) => void;
}
export default function SignUpForm({
  closeDialog,
  setIsLoginTabDisabled,
}: Props) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Step 1. Send verification email
  // This creates a user, unverified.
  // We need this because we need link between email and the code.
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

  // Step 2. Check verification code, but don't want to log in user yet.
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

  // Step 3. Complete profile + create the actual user account.
  // User already authenticated here.
  const completeAccount = async (
    email: string,
    username: string,
    password: string
  ) => {
    const id = toast.loading("Creating account...");
    setIsLoading(true);

    try {
      // need user record before profile since linked
      // no user account or profile here at this point.

      // check if username exists
      const checkUsernameRes = await fetch(
        `/api/profiles/check-username?username=${username}`,
        { method: "GET" }
      );

      const data = await checkUsernameRes.json();

      if (data.exists) {
        toast.error("Username already exists.");
        return false;
      }

      // now can create user account
      const createUserRes = await fetch("/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // only proceed if user creation worked
      if (!createUserRes.ok) {
        toast.error("Failed to create user account. Please contact support.");
        return false;
      }

      // successfuly created user here, so id should be returned
      const userId = (await createUserRes.json()).id;

      // create profile record
      const createProfileRes = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          id: userId,
          username,
        }),
      });

      if (!createProfileRes.ok) {
        toast.error("Failed to create profile. Please contact support.");
        return false;
      }

      // Else, all is well.
      toast.success("Account created successfully");
      return true;
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
      if (setIsLoginTabDisabled) setIsLoginTabDisabled(true);

      const success = await sendVerificationEmail(email);

      if (!success) return;
    }

    // Verify code
    if (currentStep === 1) {
      const success = await checkVerificationCode(email, code);

      if (!success) return;
    }

    // Account completion
    if (currentStep === lastStepNumber) {
      const success = await completeAccount(email, username, password);

      if (!success) return;

      // Success, reset the form.
      reset();
      setCurrentStep(0);

      router.push("/");
      router.refresh();

      if (closeDialog) closeDialog();
    } else {
      setCurrentStep((step) => step + 1);
    }
  };
  const prev = () => {
    if (currentStep > 0) setCurrentStep((step) => step - 1);

    // back to step 0, enable the login tab
    if (currentStep - 1 === 0 && setIsLoginTabDisabled)
      setIsLoginTabDisabled(false);
  };

  // Countdown between OTP requests
  const startResendCooldown = () => {
    setResendCooldown(60);

    const intervalId = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        } else {
          return prev - 1;
        }
      });
    }, 1000);
  };
  const canSendCode = resendCooldown === 0;

  // React hook form
  const form = useForm<FullFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues,
  });
  const {
    control,
    // handleSubmit,
    reset,
    trigger,
    getValues,
    // formState: { errors, isSubmitting },
  } = form;

  // const onSubmit: SubmitHandler<FullFormData> = (data: FullFormData) => {
  //   console.log(data);
  //   reset();
  // };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-3 mb-6">
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
                    <FormDescription>
                      Please enter the code sent to your email. <br />
                      Need a new one?{" "}
                      {canSendCode ? (
                        <>
                          Click{" "}
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={async () => {
                              await sendVerificationEmail(getValues("email"));
                              startResendCooldown();
                            }}
                          >
                            here
                          </Button>{" "}
                          to resend.
                        </>
                      ) : (
                        <>Please wait {resendCooldown} seconds.</>
                      )}
                    </FormDescription>
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
                    <FormLabel>
                      Password{" "}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={15} />
                        </TooltipTrigger>
                        <TooltipContent className="w-max">
                          <p className="max-w-xs">
                            Must contain at least 8 characters: 1 uppercase
                            letter, 1 lowercase letter, 1 special character and
                            1 number.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
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
            <Button onClick={prev} type="button" variant="secondary">
              Back
            </Button>
          )}
          <Button
            className={clsx("transition-none")}
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
