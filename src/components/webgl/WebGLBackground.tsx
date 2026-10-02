"use client";

import dynamic from "next/dynamic";

// Client-only and split out of the initial bundle: three.js loads after the
// server-rendered content has painted, so it never delays the LCP.
const WebGLCanvas = dynamic(() => import("./WebGLCanvas"), { ssr: false });

export function WebGLBackground() {
  return <WebGLCanvas />;
}
