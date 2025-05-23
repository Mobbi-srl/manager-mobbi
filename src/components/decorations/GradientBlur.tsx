
import { cn } from "@/lib/utils";

interface GradientBlurProps {
  className?: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color: "green" | "emerald" | "cyan";
}

const GradientBlur = ({ className, position, color }: GradientBlurProps) => {
  const colorMap = {
    green: "from-verde-dark",
    emerald: "from-verde-DEFAULT",
    cyan: "from-verde-light",
  };

  const positionMap = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div
      className={cn(
        "absolute -z-10 h-72 w-72 blur-[100px] rounded-full opacity-20",
        colorMap[color],
        positionMap[position],
        className
      )}
    />
  );
};

export { GradientBlur };
