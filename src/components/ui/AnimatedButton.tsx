"use client";

import * as React from "react";
import { motion } from "framer-motion";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "success" | "warning" | "danger";
};

const VARIANT_CLASS: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-[#3f63e6] hover:bg-blue-700 text-white",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  warning: "bg-amber-400 hover:bg-amber-500 text-black",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
};

export default function AnimatedButton({
  className = "",
  loading = false,
  variant = "primary",
  disabled,
  children,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.96 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={isDisabled}
      className={[
        "relative inline-flex items-center justify-center gap-2",
        "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
        "ring-1 ring-black/5",
        "active:shadow-none",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANT_CLASS[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {/* Ripple */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        whileTap={{
          opacity: [0, 1, 0],
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 60%)",
        }}
        transition={{ duration: 0.35 }}
      />

      {/* Loading spinner */}
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
      )}

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
