"use client";

import dynamic from "next/dynamic";
import LoadingGlobe from "@/components/ui/LoadingGlobe";

const GlobeApp = dynamic(() => import("@/components/GlobeApp"), {
  ssr: false,
  loading: () => <LoadingGlobe />,
});

export default function Home() {
  return <GlobeApp />;
}
