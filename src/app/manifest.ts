import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trust and Trip",
    short_name: "Trust & Trip",
    description: "Handcrafted travel packages across 60+ destinations. Honeymoons, family holidays, group tours.",
    start_url: "/",
    display: "browser",
    background_color: "#FAF7F2",
    theme_color: "#0B1C2C",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
