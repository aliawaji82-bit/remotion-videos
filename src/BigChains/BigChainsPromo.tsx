import { Video } from "@remotion/media";
import { AbsoluteFill, Series, staticFile, useVideoConfig } from "remotion";
import { AiShot } from "./AiShot";
import { brand } from "./brand";
import { Caption } from "./Caption";
import { GlobeNetwork } from "./GlobeNetwork";

// Big Chains B2B promo, 55s @ 30fps.
// Scenes 1, 2 and 8 are Flow-generated b-roll (placeholders until delivered)
// and scene 3 is the coded globe; all four get their captions here.
// Scenes 4-7 and 9 are the finished brand and screen-recording clips from
// the video kit, which already carry their text.
export const BigChainsPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: brand.slate }}>
      <Series>
        <Series.Sequence name="1 Hook: vessel at sea" durationInFrames={120} premountFor={fps}>
          <AiShot name="AI shot" file="" label="Scene 1: Vessel at sea" premountFor={fps} />
          <Caption
            name="Caption"
            from={10}
            premountFor={fps}
            line1="Where is my shipment?"
            line2=""
            accentColor={brand.cyan}
          />
        </Series.Sequence>
        <Series.Sequence name="2 Problem: fragmented tracking" durationInFrames={120} premountFor={fps}>
          <AiShot name="AI shot" file="" label="Scene 2: Fragmented tracking" premountFor={fps} />
          <Caption
            name="Caption"
            from={10}
            premountFor={fps}
            line1="Tracking shouldn’t be"
            line2="this complicated."
            accentColor={brand.cyan}
          />
        </Series.Sequence>
        <Series.Sequence name="3 Transition: connected network" durationInFrames={150} premountFor={fps}>
          <GlobeNetwork name="Globe network" accentColor={brand.cyan} premountFor={fps} />
          <Caption
            name="Caption"
            from={15}
            premountFor={fps}
            line1="One platform."
            line2="Complete visibility."
            accentColor={brand.cyan}
          />
        </Series.Sequence>
        <Series.Sequence name="4 Brand intro" durationInFrames={120} premountFor={fps}>
          <Video
            name="scene04_brand_intro.mp4"
            src={staticFile("bigchains/scene04_brand_intro.mp4")}
            premountFor={fps}
          />
        </Series.Sequence>
        <Series.Sequence name="5 Dashboard" durationInFrames={210} premountFor={fps}>
          <Video
            name="scene05_dashboard.mp4"
            src={staticFile("bigchains/scene05_dashboard.mp4")}
            premountFor={fps}
          />
        </Series.Sequence>
        <Series.Sequence name="6 Shipment visibility" durationInFrames={210} premountFor={fps}>
          <Video
            name="scene06_shipment_visibility.mp4"
            src={staticFile("bigchains/scene06_shipment_visibility.mp4")}
            premountFor={fps}
          />
        </Series.Sequence>
        <Series.Sequence name="7 Analytics" durationInFrames={210} premountFor={fps}>
          <Video
            name="scene07_analytics.mp4"
            src={staticFile("bigchains/scene07_analytics.mp4")}
            premountFor={fps}
          />
        </Series.Sequence>
        <Series.Sequence name="8 Business value: port in control" durationInFrames={300} premountFor={fps}>
          <AiShot name="AI shot 8A" file="" label="Scene 8A: Port aerial" durationInFrames={150} premountFor={fps} />
          <AiShot name="AI shot 8B" file="" label="Scene 8B: Crane lift" from={150} premountFor={fps} />
          <Caption
            name="Caption"
            from={20}
            premountFor={fps}
            line1="Less manual tracking."
            line2="More control."
            accentColor={brand.cyan}
          />
        </Series.Sequence>
        <Series.Sequence name="9 Final frame" durationInFrames={210} premountFor={fps}>
          <Video
            name="scene09_final_frame.mp4"
            src={staticFile("bigchains/scene09_final_frame.mp4")}
            premountFor={fps}
          />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
