import { Video } from "@remotion/media";
import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { brand, fontFamily } from "./brand";

type AiShotProps = {
  readonly file: string;
  readonly label: string;
  readonly style?: React.CSSProperties;
};

// B-roll slot for the Flow-generated scenes (1, 2, 3, 8).
// With `file` empty it shows a branded placeholder naming the expected file;
// once the clip is in public/, set `file` (e.g. "bigchains/scene01_vessel.mp4").
// Use `trimBefore` on the instance to pick the best seconds of the 8s generation.
const AiShotInner: React.FC<AiShotProps> = ({ file, label, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (file) {
    return (
      <AbsoluteFill style={style}>
        <Video
          src={file.startsWith("http") ? file : staticFile(file)}
          muted
          objectFit="cover"
          premountFor={fps}
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 65% 35%, #16335c 0%, ${brand.navy} 45%, ${brand.slate} 100%)`,
        ...style,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage: `linear-gradient(${brand.cyan} 1px, transparent 1px), linear-gradient(90deg, ${brand.cyan} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `${interpolate(frame, [0, 10 * fps], [0, 120])}px 0px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 300,
          width: "100%",
          textAlign: "center",
          fontFamily,
          color: brand.white,
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: brand.cyan,
          }}
        >
          AI SHOT PENDING
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 20 }}>
          {label}
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.55, marginTop: 20 }}>
          Generate in Flow, then set the file prop
        </div>
      </div>
    </AbsoluteFill>
  );
};

const aiShotSchema = {
  file: {
    type: "text-content",
    default: "",
    description: "Clip path in public/ (empty = placeholder)",
  },
  label: { type: "text-content", default: "", description: "Scene label" },
} as const satisfies InteractivitySchema;

export const AiShot = Interactive.withSchema({
  Component: AiShotInner,
  componentName: "<AiShot>",
  schema: aiShotSchema,
  wrapInSequence: true,
});
