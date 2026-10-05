"use client";

import { useEffect } from "react";
import { CvIcon } from "@/components/icons/CvIcon";

/**
 * Opens the print dialog once the web fonts are in (otherwise the sheet could
 * be captured in fallback fonts), and offers a button to open it again.
 */
export function PrintControls({ className, label }: { className: string; label: string }) {
  useEffect(() => {
    let isCancelled = false;
    void document.fonts.ready.then(() => {
      if (!isCancelled) window.print();
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <CvIcon name="printer" />
      {label}
    </button>
  );
}
