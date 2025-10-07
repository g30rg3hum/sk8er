import LoginForm from "@/components/auth/login-form";
import SignUpForm from "@/components/auth/sign-up-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";

interface Props {
  closeDialog: () => void;
}
export default function LoginOrRegister({ closeDialog }: Props) {
  return (
    <div>
      <Tabs defaultValue="login">
        <TabsList className="mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm closeDialog={closeDialog} />
        </TabsContent>

        <TabsContent value="register">
          <SignUpForm closeDialog={closeDialog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
