import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { brand } from "./brand";

// Coded motion-graphics alternatives to the Flow b-roll for scenes 1, 2 and 8.
// Same palette as the globe: deep navy, slate, steel and a restrained cyan.
// No text anywhere; captions are layered on top in BigChainsPromo.

const containerPalette = ["#22406a", "#3a4a5e", "#6b4a3e", "#b9bec6", "#2c3e57", "#4a5d75"];
const pickContainer = (seed: string) =>
  containerPalette[Math.floor(random(seed) * containerPalette.length)];

type SceneProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

const sceneSchema = {
  accentColor: { type: "color", default: brand.cyan, description: "Accent color" },
} as const satisfies InteractivitySchema;

// Container grid seen from above, drawn in local coordinates.
const ContainerGrid: React.FC<{
  x: number;
  y: number;
  cols: number;
  rows: number;
  w: number;
  h: number;
  gap: number;
  seed: string;
}> = ({ x, y, cols, rows, w, h, gap, seed }) => {
  const cells: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      cells.push(
        <rect
          key={`${c}-${r}`}
          x={x + c * (w + gap)}
          y={y + r * (h + gap)}
          width={w}
          height={h}
          rx={1.5}
          fill={pickContainer(`${seed}-${c}-${r}`)}
        />,
      );
    }
  }
  return <g>{cells}</g>;
};

// ---------------------------------------------------------------------------
// Scene 1: container vessel from above, with an uncertain, flickering route
// to a destination that keeps pulsing: "Where is my shipment?"
const VesselAtSeaInner: React.FC<SceneProps> = ({ accentColor, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const shipX = interpolate(frame, [0, 4 * fps], [1020, 1110]);
  const shipY = interpolate(frame, [0, 4 * fps], [470, 445]);
  const heading = -16;
  const rad = (heading * Math.PI) / 180;
  const bow = [shipX + 410 * Math.cos(rad), shipY + 410 * Math.sin(rad)];
  const target = [1720, 170];
  const routeFlicker = 0.35 + 0.45 * random(`route-${Math.floor(frame / 4)}`);

  const waves = new Array(46).fill(0).map((_, i) => {
    const x0 = random(`wx-${i}`) * (width + 200);
    const y = random(`wy-${i}`) * height;
    const x = ((x0 - frame * (0.5 + random(`ws-${i}`) * 0.6)) % (width + 200) + width + 200) % (width + 200) - 100;
    return (
      <path
        key={i}
        d={`M${x},${y} q24,-7 48,0 t48,0`}
        fill="none"
        stroke={brand.white}
        strokeOpacity={0.05 + random(`wo-${i}`) * 0.07}
        strokeWidth={1.5}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 68% 38%, #143461 0%, ${brand.navy} 50%, ${brand.slate} 100%)`,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          scale: interpolate(frame, [0, 4 * fps], [1, 1.06]),
        }}
      >
        <defs>
          <linearGradient id="wake" gradientUnits="userSpaceOnUse" x1={-380} y1={0} x2={-980} y2={0}>
            <stop offset="0%" stopColor={brand.white} stopOpacity={0.45} />
            <stop offset="100%" stopColor={brand.white} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="trail" gradientUnits="userSpaceOnUse" x1={-380} y1={0} x2={-900} y2={0}>
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {waves}
        <path
          d={`M${bow[0]},${bow[1]} Q${(bow[0] + target[0]) / 2 + 40},${bow[1] - 60} ${target[0]},${target[1]}`}
          fill="none"
          stroke={accentColor}
          strokeWidth={2.5}
          strokeDasharray="4 14"
          strokeDashoffset={-frame * 1.5}
          strokeLinecap="round"
          opacity={routeFlicker}
          filter="url(#softGlow)"
        />
        {[0, 1, 2].map((k) => {
          const p = ((frame + k * 20) % 60) / 60;
          return (
            <circle
              key={k}
              cx={target[0]}
              cy={target[1]}
              r={8 + p * 60}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              opacity={(1 - p) * 0.6}
            />
          );
        })}
        <circle cx={target[0]} cy={target[1]} r={7} fill={accentColor} filter="url(#softGlow)" />
        <g transform={`translate(${shipX} ${shipY}) rotate(${heading})`}>
          <path d="M-380,-60 L-960,-230 M-380,60 L-960,230" stroke="url(#wake)" strokeWidth={3} fill="none" />
          <path d="M-380,0 L-900,0" stroke="url(#trail)" strokeWidth={46} strokeLinecap="round" fill="none" />
          <ellipse cx={0} cy={18} rx={410} ry={84} fill="#050b14" opacity={0.55} filter="url(#shadow)" />
          <path
            d="M-380,-76 L240,-76 Q370,-74 410,0 Q370,74 240,76 L-380,76 Q-396,0 -380,-76 Z"
            fill="#1a2332"
            stroke="#34465f"
            strokeWidth={2}
          />
          <ContainerGrid x={-300} y={-66} cols={9} rows={4} w={56} h={29} gap={5} seed="deck" />
          <rect x={-366} y={-70} width={50} height={140} rx={4} fill="#c7ccd4" />
          <rect x={-356} y={-60} width={8} height={120} rx={2} fill="#2c3e57" />
          <circle cx={392} cy={0} r={3} fill={accentColor} filter="url(#softGlow)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const VesselAtSea = Interactive.withSchema({
  Component: VesselAtSeaInner,
  componentName: "<VesselAtSea>",
  schema: sceneSchema,
  wrapInSequence: true,
});

// ---------------------------------------------------------------------------
// Scene 2: too many disconnected systems. Blank app windows keep popping up
// and overlapping while a cursor hops between them.
const windows = new Array(14).fill(0).map((_, i) => ({
  x: 110 + random(`x-${i}`) * 1330,
  y: 70 + random(`y-${i}`) * 440,
  w: 360 + random(`w-${i}`) * 170,
  h: 220 + random(`h-${i}`) * 110,
  rot: (random(`r-${i}`) - 0.5) * 4,
  kind: i % 3,
  appear: 4 + i * 6,
}));

const WindowBody: React.FC<{ w: number; h: number; kind: number; seed: number; accentColor: string }> = ({
  w,
  h,
  kind,
  seed,
  accentColor,
}) => {
  const inner: React.ReactNode[] = [];
  if (kind === 0) {
    for (let r = 0; r < 6; r++) {
      const y = 50 + r * ((h - 70) / 6);
      inner.push(<rect key={r} x={20} y={y} width={(w - 40) * (0.4 + random(`l-${seed}-${r}`) * 0.6)} height={10} rx={5} fill="#2c3e57" />);
    }
  } else if (kind === 1) {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        inner.push(
          <rect
            key={`${r}-${c}`}
            x={20 + c * ((w - 40) / 4)}
            y={52 + r * ((h - 72) / 5)}
            width={(w - 40) / 4 - 10}
            height={12}
            rx={3}
            fill={c === 3 && random(`t-${seed}-${r}`) > 0.6 ? "#7a5a36" : "#2c3e57"}
          />,
        );
      }
    }
  } else {
    const bars = 8;
    for (let b = 0; b < bars; b++) {
      const bh = (h - 90) * (0.2 + random(`b-${seed}-${b}`) * 0.8);
      inner.push(
        <rect
          key={b}
          x={24 + b * ((w - 48) / bars)}
          y={h - 20 - bh}
          width={(w - 48) / bars - 10}
          height={bh}
          rx={3}
          fill={b === 5 ? accentColor : "#34496a"}
          opacity={b === 5 ? 0.6 : 1}
        />,
      );
    }
  }
  return <>{inner}</>;
};

const FragmentedSystemsInner: React.FC<SceneProps> = ({ accentColor, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const hop = 16;
  const hopIndex = Math.floor(frame / hop);
  const hopT = Easing.inOut(Easing.cubic)(Math.min(1, (frame % hop) / 10));
  const visible = windows.filter((w) => w.appear <= frame);
  const pick = (k: number) => {
    const pool = visible.length > 0 ? visible : windows.slice(0, 1);
    const win = pool[Math.floor(random(`hop-${k}`) * pool.length)];
    return [win.x + win.w * 0.55, win.y + win.h * 0.45];
  };
  const from = pick(hopIndex - 1);
  const to = pick(hopIndex);
  const cursor = [from[0] + (to[0] - from[0]) * hopT, from[1] + (to[1] - from[1]) * hopT];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, #172a44 0%, ${brand.slate} 65%)`,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          scale: interpolate(frame, [0, 4 * fps], [1.04, 1]),
        }}
      >
        <defs>
          <filter id="winShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#02060c" floodOpacity="0.7" />
          </filter>
        </defs>
        {windows.map((win, i) => {
          const pop = spring({ frame: frame - win.appear, fps, config: { damping: 18, stiffness: 180 } });
          if (frame < win.appear) {
            return null;
          }
          const driftX = Math.sin(frame / 40 + i) * 4;
          const driftY = Math.cos(frame / 50 + i * 2) * 3;
          const active = visible.length > 0 && Math.abs(cursor[0] - (win.x + win.w * 0.55)) < 2 && Math.abs(cursor[1] - (win.y + win.h * 0.45)) < 2;
          return (
            <g
              key={i}
              transform={`translate(${win.x + driftX + win.w / 2} ${win.y + driftY + win.h / 2}) rotate(${win.rot}) scale(${0.85 + 0.15 * pop}) translate(${-win.w / 2} ${-win.h / 2})`}
              opacity={pop}
              filter="url(#winShadow)"
            >
              <rect width={win.w} height={win.h} rx={10} fill="#15253b" stroke={active ? accentColor : "#2a4368"} strokeWidth={active ? 2 : 1.5} />
              <rect width={win.w} height={34} rx={10} fill="#1c3050" />
              <rect y={24} width={win.w} height={10} fill="#1c3050" />
              {[0, 1, 2].map((d) => (
                <circle key={d} cx={18 + d * 16} cy={17} r={5} fill="#3a5275" />
              ))}
              <rect x={win.w - 110} y={12} width={90} height={10} rx={5} fill="#2c4466" />
              <WindowBody w={win.w} h={win.h} kind={win.kind} seed={i} accentColor={accentColor} />
            </g>
          );
        })}
        <g transform={`translate(${cursor[0]} ${cursor[1]})`}>
          <path d="M0,0 L0,30 L8,23 L14,36 L19,34 L13,21 L24,21 Z" fill={brand.white} stroke="#0b1626" strokeWidth={1.5} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const FragmentedSystems = Interactive.withSchema({
  Component: FragmentedSystemsInner,
  componentName: "<FragmentedSystems>",
  schema: sceneSchema,
  wrapInSequence: true,
});

// ---------------------------------------------------------------------------
// Scene 8A: a modern port from above. Cranes work the ship, trucks move in
// orderly lanes and leave thin cyan trails.
const lanesY = [405, 640, 875];
const trucks = new Array(9).fill(0).map((_, i) => ({
  lane: lanesY[i % 3],
  dir: i % 2 === 0 ? 1 : -1,
  offset: random(`truck-${i}`) * 2400,
  speed: 4.2 + random(`tspeed-${i}`) * 1.2,
}));

const PortAerialInner: React.FC<SceneProps> = ({ accentColor, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0e1a2b", ...style }}>
      <svg width={width} height={height}>
        <defs>
          <filter id="portGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="truckTrailR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="truckTrailL" x1="1" x2="0" y1="0" y2="0">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <g
          transform={`translate(${interpolate(frame, [0, 5 * fps], [-40, -200])} ${interpolate(frame, [0, 5 * fps], [-20, -60])}) scale(1.12)`}
        >
          <rect x={-200} y={-200} width={2600} height={460} fill={brand.navy} />
          {new Array(30).fill(0).map((_, i) => (
            <path
              key={i}
              d={`M${random(`px-${i}`) * 2400 - 200 - frame * 0.4},${random(`py-${i}`) * 200 + 10} q20,-5 40,0 t40,0`}
              stroke={brand.white}
              strokeOpacity={0.06}
              fill="none"
            />
          ))}
          <path d="M260,110 L1640,110 Q1720,110 1760,175 Q1720,240 1640,240 L260,240 Z" fill="#1a2332" stroke="#34465f" strokeWidth={2} />
          <ContainerGrid x={330} y={122} cols={22} rows={4} w={52} h={24} gap={4} seed="port-ship" />
          <rect x={272} y={118} width={44} height={114} rx={4} fill="#c7ccd4" />
          <rect x={-200} y={260} width={2600} height={1100} fill="#151f2e" />
          <line x1={-200} x2={2400} y1={260} y2={260} stroke={accentColor} strokeOpacity={0.35} strokeWidth={2} />
          {[480, 800, 1120, 1440].map((cx, i) => {
            const trolley = 140 + ((Math.sin(frame / 22 + i * 1.7) + 1) / 2) * 190;
            return (
              <g key={cx}>
                <rect x={cx - 34} y={80} width={68} height={300} rx={4} fill="#2a3a52" stroke="#4a6184" strokeWidth={1.5} />
                <line x1={cx - 20} x2={cx - 20} y1={84} y2={376} stroke="#4a6184" />
                <line x1={cx + 20} x2={cx + 20} y1={84} y2={376} stroke="#4a6184" />
                <rect x={cx - 26} y={trolley} width={52} height={28} rx={3} fill="#c7ccd4" />
                <circle cx={cx} cy={trolley + 14} r={3} fill={accentColor} filter="url(#portGlow)" />
              </g>
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6].map((c) =>
            [0, 1].map((r) => (
              <ContainerGrid
                key={`${c}-${r}`}
                x={c * 330 - 40}
                y={450 + r * 235}
                cols={5}
                rows={6}
                w={50}
                h={22}
                gap={5}
                seed={`yard-${c}-${r}`}
              />
            )),
          )}
          {lanesY.map((y) => (
            <line key={y} x1={-200} x2={2400} y1={y} y2={y} stroke="#2a3a52" strokeWidth={2} strokeDasharray="30 24" />
          ))}
          {trucks.map((t, i) => {
            const span = 2600;
            const raw = (t.offset + frame * t.speed * 1.4) % span;
            const x = t.dir === 1 ? raw - 200 : span - raw - 200;
            const trail = 260;
            return (
              <g key={i}>
                <rect
                  x={t.dir === 1 ? x - trail : x + 44}
                  y={t.lane - 2}
                  width={trail}
                  height={4}
                  fill={`url(#${t.dir === 1 ? "truckTrailR" : "truckTrailL"})`}
                  filter="url(#portGlow)"
                />
                <rect x={x} y={t.lane - 11} width={44} height={22} rx={3} fill="#d5d9df" />
                <rect x={t.dir === 1 ? x + 32 : x} y={t.lane - 11} width={12} height={22} rx={2} fill="#8a96a8" />
              </g>
            );
          })}
        </g>
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 55% 40%, rgba(0,0,0,0) 45%, rgba(8,14,24,0.7) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const PortAerial = Interactive.withSchema({
  Component: PortAerialInner,
  componentName: "<PortAerial>",
  schema: sceneSchema,
  wrapInSequence: true,
});

// ---------------------------------------------------------------------------
// Scene 8B: side view of a gantry crane lifting a container off a ship
// at blue hour, port lights switching on, cyan trails along the quay.
const CraneLiftInner: React.FC<SceneProps> = ({ accentColor, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const lift = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const travel = interpolate(frame, [1.8 * fps, 4.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const trolleyX = 1420 - travel * 560;
  const boxY = 520 - lift * 150;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(to bottom, #0a1322 0%, ${brand.navy} 55%, #1d2a3d 72%, #2b2a33 78%, #0d1624 79%)`,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          scale: interpolate(frame, [0, 5 * fps], [1, 1.08]),
          transformOrigin: "60% 55%",
        }}
      >
        <defs>
          <filter id="craneGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[260, 420, 1760, 1880].map((x, i) => (
          <g key={x} opacity={0.5}>
            <rect x={x} y={640 - i * 18} width={60} height={210 + i * 18} fill="#111c2c" />
          </g>
        ))}
        <path d="M1120,690 L1920,690 L1920,850 L1160,850 Z" fill="#141e2d" stroke="#2c3e57" strokeWidth={2} />
        <ContainerGrid x={1180} y={560} cols={12} rows={4} w={54} h={30} gap={3} seed="crane-ship" />
        <rect x={0} y={850} width={width} height={230} fill="#0b1422" />
        <g stroke="#5b7394" strokeWidth={10} fill="none" strokeLinecap="round">
          <line x1={720} y1={850} x2={720} y2={300} />
          <line x1={1000} y1={850} x2={1000} y2={300} />
          <line x1={720} y1={600} x2={1000} y2={600} strokeWidth={8} />
          <line x1={720} y1={600} x2={1000} y2={420} strokeWidth={5} />
          <line x1={860} y1={170} x2={560} y2={290} strokeWidth={4} />
          <line x1={860} y1={170} x2={1760} y2={290} strokeWidth={4} />
          <line x1={860} y1={170} x2={860} y2={300} strokeWidth={8} />
        </g>
        <rect x={520} y={290} width={1260} height={26} rx={4} fill="#34496a" stroke="#6d86aa" strokeWidth={1.5} />
        <line x1={520} y1={316} x2={1780} y2={316} stroke={accentColor} strokeOpacity={0.35} strokeWidth={2} />
        <rect x={trolleyX - 40} y={312} width={80} height={24} rx={3} fill="#c7ccd4" />
        <line x1={trolleyX - 24} y1={336} x2={trolleyX - 24} y2={boxY - 10} stroke="#8a96a8" strokeWidth={2} />
        <line x1={trolleyX + 24} y1={336} x2={trolleyX + 24} y2={boxY - 10} stroke="#8a96a8" strokeWidth={2} />
        <rect x={trolleyX - 70} y={boxY - 12} width={140} height={10} rx={2} fill="#4a5d75" />
        <rect x={trolleyX - 66} y={boxY} width={132} height={62} rx={3} fill="#3a4a5e" stroke="#5b7394" strokeWidth={1.5} />
        {[1, 2, 3, 4, 5, 6, 7].map((k) => (
          <line key={k} x1={trolleyX - 66 + k * 16.5} x2={trolleyX - 66 + k * 16.5} y1={boxY + 6} y2={boxY + 56} stroke="#2c3a4c" strokeWidth={2} />
        ))}
        <circle cx={860} cy={166} r={5} fill={accentColor} filter="url(#craneGlow)" opacity={0.5 + 0.5 * Math.sin(frame / 6)} />
        {new Array(16).fill(0).map((_, i) => {
          const on = interpolate(frame, [10 + i * 6, 20 + i * 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <circle
              key={i}
              cx={60 + i * 120}
              cy={842}
              r={4}
              fill={i % 4 === 0 ? accentColor : "#f3d9a4"}
              opacity={on * 0.9}
              filter="url(#craneGlow)"
            />
          );
        })}
        {[0, 1, 2].map((k) => (
          <line
            key={k}
            x1={0}
            x2={width}
            y1={880 + k * 22}
            y2={880 + k * 22}
            stroke={accentColor}
            strokeOpacity={0.25 - k * 0.06}
            strokeWidth={2}
            strokeDasharray="120 260"
            strokeDashoffset={frame * (6 + k * 2)}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const CraneLift = Interactive.withSchema({
  Component: CraneLiftInner,
  componentName: "<CraneLift>",
  schema: sceneSchema,
  wrapInSequence: true,
});
