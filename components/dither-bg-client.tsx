"use client";

import dynamic from "next/dynamic";

const DitherBg = dynamic(() => import("@/components/dither-bg"), { ssr: false });

export { DitherBg };
