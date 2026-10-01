import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => {
  const isVertical = orientation === "vertical";

  return (
    <SliderPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        "relative flex touch-none select-none cursor-pointer group",
        isVertical
          ? "flex-col h-full w-auto items-center px-1.5"
          : "w-full items-center py-1.5",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative grow overflow-hidden rounded-full bg-white/15 transition-all",
          isVertical
            ? "w-2 h-full group-hover:w-2.5"
            : "h-2 w-full group-hover:h-2.5"
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute rounded-full",
            isVertical
              ? "w-full bottom-0 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400"
              : "h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-white bg-vault-accent shadow-md ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vault-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-hover:scale-125" />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider }
