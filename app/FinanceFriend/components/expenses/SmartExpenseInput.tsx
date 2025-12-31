"use client"
import { forwardRef, useRef, useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { MicIcon } from "lucide-react";

interface SmartExpenseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

export const SmartExpenseInput = forwardRef<HTMLInputElement, SmartExpenseInputProps>(
  ({ onChange, ...props }, ref) => {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = (node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };
    
    useEffect(() => {
      if (onChange && typeof onChange === 'function') {
        onChange(value);
      }
    }, [value, onChange]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };
    
    return (
      <div className="relative">
        <Input
          ref={mergedRef}
          value={value}
          onChange={handleChange}
          className="pr-10"
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500"
          onClick={() => {
            // In a real app, this would activate speech recognition
            alert("Voice input would be implemented here in a production app");
          }}
        >
          <MicIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

SmartExpenseInput.displayName = "SmartExpenseInput";
