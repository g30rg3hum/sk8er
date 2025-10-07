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

export default function Header() {
  return (
    <div className="w-full flex justify-between items-center bg-card border p-6">
      <Image
        src="/images/logo-black.png"
        alt="sk8er logo"
        width={100}
        height={1000}
      />

      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <AuthDialog />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
