"use client";

import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";

function useMaxToasts(max: number) {
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter((t) => t.visible) // only consider visible toasts
      .filter((_, i) => i >= max) // is toast over max?
      .forEach((t) => toast.dismiss(t.id)); // dismiss excess toasts
  }, [toasts, max]); // execute very time toasts changes.
}

type Props = React.ComponentProps<typeof Toaster> & {
  max?: number;
};
export default function ToasterWithMax({ max = 3, ...props }: Props) {
  useMaxToasts(max);

  return <Toaster {...props} />;
}
