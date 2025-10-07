"use client";

import LoginOrRegister from "@/components/auth/login-or-register";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Sign In</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authenticate</DialogTitle>
          <DialogDescription>
            Please sign into your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <LoginOrRegister closeDialog={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
