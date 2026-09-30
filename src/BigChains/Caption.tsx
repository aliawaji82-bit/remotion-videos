import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { brand, fontFamily } from "./brand";

type CaptionProps = {
  readonly line1: string;
  readonly line2: string;
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

// Lower-third title matching the kit's caption_sceneXX.png artwork:
// a cyan bar, a white first line and an accent-coloured second line
// over a navy gradient that keeps the rest of the frame clean.
const CaptionInner: React.FC<CaptionProps> = ({
  line1,
  line2,
  accentColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(to bottom, rgba(11, 31, 59, 0) 55%, rgba(11, 31, 59, 0.92) 82%, ${brand.navy} 100%)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 86,
          bottom: 125,
          display: "flex",
          gap: 28,
          fontFamily,
          fontWeight: 700,
          fontSize: 64,
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
        }}
      >
        <div
          style={{
            width: 8,
            borderRadius: 2,
            backgroundColor: accentColor,
            scale: interpolate(frame, [0, 0.5 * fps], ["1 0", "1 1"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            transformOrigin: "bottom",
          }}
        />
        <div>
          <div
            style={{
              color: brand.white,
              opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [0.2 * fps, 0.8 * fps],
                ["0px 24px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
            }}
          >
            {line1}
          </div>
          {line2 ? (
            <div
              style={{
                color: accentColor,
                opacity: interpolate(frame, [0.45 * fps, 1.05 * fps], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame,
                  [0.45 * fps, 1.05 * fps],
                  ["0px 24px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  },
                ),
              }}
            >
              {line2}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const captionSchema = {
  line1: { type: "text-content", default: "", description: "First line (white)" },
  line2: {
    type: "text-content",
    default: "",
    description: "Second line (accent, optional)",
  },
  accentColor: {
    type: "color",
    default: brand.cyan,
    description: "Accent color",
  },
} as const satisfies InteractivitySchema;

export const Caption = Interactive.withSchema({
  Component: CaptionInner,
  componentName: "<Caption>",
  schema: captionSchema,
  wrapInSequence: true,
});
