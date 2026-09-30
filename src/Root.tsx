import "./index.css";
import { Composition, Folder } from "remotion";
import { AiShot } from "./BigChains/AiShot";
import { BigChainsPromo } from "./BigChains/BigChainsPromo";
import { Caption } from "./BigChains/Caption";
import { GlobeNetwork } from "./BigChains/GlobeNetwork";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
      <Folder name="BigChains">
        <Composition
          id="BigChainsPromo"
          component={BigChainsPromo}
          durationInFrames={1650}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="BigChainsCaption"
          component={Caption}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            line1: "Tracking shouldn’t be",
            line2: "this complicated.",
            accentColor: "#00C2D7",
          }}
        />
        <Composition
          id="BigChainsGlobe"
          component={GlobeNetwork}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            accentColor: "#00C2D7",
          }}
        />
        <Composition
          id="BigChainsAiShot"
          component={AiShot}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            file: "",
            label: "Scene 1: Vessel at sea",
          }}
        />
      </Folder>
    </>
  );
};
