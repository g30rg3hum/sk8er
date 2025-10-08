import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../../ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import AuthDialog from "./auth-dialog";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "@/components/auth/sign-out-button";

export default async function Header() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  const isAuthenticated = !error && data.user;

  return (
    <div className="w-full flex justify-between items-center bg-card border p-6">
      <Image
        src="/images/logo-black.png"
        alt="sk8er logo"
        width={100}
        height={1000}
      />

      <NavigationMenu viewport={false}>
        <NavigationMenuList className="flex gap-4">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          {!isAuthenticated && (
            <NavigationMenuItem>
              <AuthDialog />
            </NavigationMenuItem>
          )}
          {isAuthenticated && (
            <NavigationMenuItem>
              <SignOutButton />
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
