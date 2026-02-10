"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ESC to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const content = useMemo(() => {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* overlay */}
            <motion.div
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-[6px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-black/10"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 480, damping: 34 }}
            >
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500" />

              <div className="flex items-start justify-between gap-4 px-7 pb-4 pt-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>

              <div className="px-7 pb-6">{children}</div>

              {footer && (
                <div className="flex flex-col-reverse gap-2 border-t bg-slate-50/70 px-7 py-5 sm:flex-row sm:justify-end">
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }, [open, onClose, title, subtitle, children, footer]);

  if (!mounted) return null;

  // ✅ Portal: modal keluar dari parent yang transform
  return createPortal(content, document.body);
}
