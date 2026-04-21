"use client";

import { useEffect } from "react";
import { pixel } from "@/components/MetaPixel";

export default function PackagePixelEvent({ title, price }: { title: string; price: number }) {
  useEffect(() => {
    pixel.viewContent(title, price);
  }, [title, price]);
  return null;
}
