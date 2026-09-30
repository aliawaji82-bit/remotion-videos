import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const brand = {
  navy: "#0B1F3B",
  slate: "#111B27",
  cyan: "#00C2D7",
  white: "#FFFFFF",
};

export const fontFamily = "Inter";

loadFont({
  family: fontFamily,
  url: staticFile("bigchains/fonts/Inter-SemiBold.otf"),
  weight: "600",
});
loadFont({
  family: fontFamily,
  url: staticFile("bigchains/fonts/Inter-Bold.otf"),
  weight: "700",
});
