import React, { forwardRef, useEffect, useRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ autoGrow = false, error, className = "", ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const targetRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      if (autoGrow && targetRef.current) {
        targetRef.current.style.height = "auto";
        targetRef.current.style.height = targetRef.current.scrollHeight + "px";
      }
    });

    return (
      <textarea
        ref={targetRef}
        className={`
          w-full rounded-lg border bg-surface-card text-ink
          transition-all duration-200 outline-none resize-none
          placeholder:text-ink-subtle py-2.5 px-3.5 text-[0.9375rem]
          ${
            error
              ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/10"
              : "border-surface-border hover:border-surface-border-strong focus:border-accent-dark focus:ring-4 focus:ring-accent-bg/20"
          }
          disabled:bg-surface-hover disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;
