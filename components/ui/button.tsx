import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-300 ease-in-out transform hover:scale-105 disabled:pointer-events-none disabled:opacity-60 disabled:transform-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg focus:ring-primary",
                destructive:
                    "bg-destructive text-white shadow-md hover:bg-destructive/90 hover:shadow-lg focus:ring-destructive",
                outline:
                    "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-md focus:ring-primary",
                secondary:
                    "bg-gradient-to-r from-accent to-orange-500 text-white shadow-md hover:shadow-lg focus:ring-accent",
                ghost: "text-brand-soft-text hover:text-primary hover:bg-brand-bg/80 focus:ring-primary",
                link: "text-primary underline-offset-4 hover:underline focus:ring-primary",
                magic: "bg-gradient-to-r from-primary via-accent to-secondary text-white shadow-lg hover:shadow-xl hover:glow-amber animate-pulse-gentle focus:ring-primary",
            },
            size: {
                default: "h-10 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-12 rounded-lg px-6 py-3 has-[>svg]:px-4 text-base",
                xl: "h-14 rounded-lg px-8 py-4 has-[>svg]:px-6 text-lg",
                icon: "size-10",
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
