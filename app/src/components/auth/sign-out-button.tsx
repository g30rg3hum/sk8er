"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        await supabase.auth.signOut();
        router.refresh();
      }}
    >
      Sign Out
    </Button>
  );
}
