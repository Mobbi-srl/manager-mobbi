
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: "user" | "lock";
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative w-full">
        <div className="flex items-center space-x-2 mb-2">
          {icon === "user" && (
            <User className="h-4 w-4 text-verde-light opacity-70" />
          )}
          {icon === "lock" && (
            <Lock className="h-4 w-4 text-verde-light opacity-70" />
          )}
          <label className="text-sm font-medium text-gray-300">{label}</label>
        </div>
        <div className="relative">
          <Input
            type={inputType}
            className={cn(
              "bg-gray-900/50 border-gray-700 focus:border-verde-light focus:ring-verde-light/20 h-11 py-2 px-3",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
