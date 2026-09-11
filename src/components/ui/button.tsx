import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap transition outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#111111] text-white hover:bg-[#333333]",
        primary: "bg-[#111111] text-white hover:bg-[#333333]",
        secondary: "bg-[#FDEBEC] text-[#9F2F2D] border border-[#FDEBEC] hover:bg-[#fbdada]",
        outline: "border border-[#EAEAEA] bg-white text-[#2F3437] hover:border-[#d4d4d4] hover:bg-[#F7F6F3]",
        ghost: "text-[#787774] hover:bg-[#F7F6F3] hover:text-[#2F3437]",
        destructive: "bg-[#FDEBEC] text-[#9F2F2D] hover:bg-[#fbdada]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-11 px-6 py-2.5 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
