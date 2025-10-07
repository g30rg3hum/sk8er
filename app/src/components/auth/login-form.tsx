import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getClientSideUser } from "@/utils/supabase/queries/auth";
import { absenceMessage } from "@/utils/constants/form/validation-messages";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, absenceMessage),
});
type FormData = z.infer<typeof schema>;
const defaultValues: FormData = {
  email: "",
  password: "",
};

interface Props {
  closeDialog: () => void;
}
export default function LoginForm({ closeDialog }: Props) {
  const router = useRouter();
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(true);

  // If not actually authenticated, keep form disabled.
  useEffect(() => {
    const initialCheck = async () => {
      const user = await getClientSideUser();
      if (!user) setIsFormDisabled(false);
    };
    initialCheck();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    disabled: isFormDisabled,
  });
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const { email, password } = data;

    const id = toast.loading("Logging in...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Login failed. Please try again.");
      } else {
        toast.success("Login successful");
        reset();
        setIsFormDisabled(true);
        router.push("/");
        closeDialog();
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      toast.dismiss(id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 mb-6">
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
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button disabled={isSubmitting || isFormDisabled} type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
}
