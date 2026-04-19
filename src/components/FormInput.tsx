import { InputHTMLAttributes, forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:opacity-50 ${className}`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  )
);
FormInput.displayName = "FormInput";

export default FormInput;
