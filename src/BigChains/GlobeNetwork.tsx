import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import landTopology from "world-atlas/land-110m.json";
import { brand } from "./brand";

type LonLat = [number, number];

const ports: Record<string, LonLat> = {
  jeddah: [39.17, 21.48],
  dammam: [50.1, 26.43],
  jebelAli: [55.03, 25.01],
  portSaid: [32.3, 31.26],
  piraeus: [23.6, 37.94],
  barcelona: [2.17, 41.38],
  rotterdam: [4.1, 51.95],
  hamburg: [9.99, 53.55],
  mombasa: [39.66, -4.06],
  durban: [31.0, -29.87],
  mumbai: [72.83, 18.94],
  colombo: [79.85, 6.93],
  singapore: [103.8, 1.26],
  hongKong: [114.17, 22.3],
  shanghai: [121.5, 31.23],
  ningbo: [121.55, 29.87],
  busan: [129.04, 35.1],
};

const routes: [keyof typeof ports, keyof typeof ports][] = [
  ["jeddah", "shanghai"],
  ["rotterdam", "dammam"],
  ["busan", "jeddah"],
  ["jebelAli", "jeddah"],
  ["ningbo", "dammam"],
  ["jeddah", "barcelona"],
  ["jebelAli", "mumbai"],
  ["mumbai", "singapore"],
  ["singapore", "hongKong"],
  ["hongKong", "busan"],
  ["portSaid", "rotterdam"],
  ["piraeus", "jeddah"],
  ["colombo", "jebelAli"],
  ["singapore", "colombo"],
  ["hamburg", "portSaid"],
  ["mombasa", "jeddah"],
  ["durban", "jebelAli"],
  ["shanghai", "singapore"],
];

const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>;
const land = feature(topology, topology.objects.land) as FeatureCollection;
const graticule = geoGraticule10();

const SAMPLES = 64;

type GlobeNetworkProps = {
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

// Scene 3: shipping routes flicker independently, then settle into one
// synchronised network with light pulses, while the globe drifts from the
// Middle East towards Asia. Built in code so it stays on-brand and text-free.
const GlobeNetworkInner: React.FC<GlobeNetworkProps> = ({ accentColor, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cx = width * 0.6;
  const cy = height * 0.48;
  const radius = height * 0.41;
  const center: LonLat = [
    interpolate(frame, [0, 5 * fps], [36, 62], { extrapolateRight: "clamp" }),
    interpolate(frame, [0, 5 * fps], [24, 20], { extrapolateRight: "clamp" }),
  ];

  const projection = geoOrthographic()
    .scale(radius)
    .translate([cx, cy])
    .rotate([-center[0], -center[1]])
    .clipAngle(90);
  const path = geoPath(projection);

  // 1 while routes are scattered, 0 once they are organised.
  const chaos = interpolate(frame, [1.6 * fps, 2.8 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const pulseStart = 2.4 * fps;
  const pulseDuration = 1.6 * fps;

  // Point on a route arc, lifted above the surface, or null when behind the globe.
  const arcPoint = (a: LonLat, b: LonLat, t: number, lift: number) => {
    const p = geoInterpolate(a, b)(t) as LonLat;
    if (geoDistance(p, center) > Math.PI / 2 - 0.02) {
      return null;
    }
    const [x, y] = projection(p) as [number, number];
    const k = 1 + lift * Math.sin(Math.PI * t);
    return [cx + (x - cx) * k, cy + (y - cy) * k] as const;
  };

  const routeElements = routes.map(([from, to], i) => {
    const a = ports[from];
    const b = ports[to];
    const lift = 0.04 + 0.1 * Math.min(1, geoDistance(a, b) / 1.5);

    const drawDelay = random(`delay-${i}`) * 1.2 * fps;
    const drawn = interpolate(frame, [drawDelay, drawDelay + 0.7 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const flicker = random(`flicker-${i}-${Math.floor(frame / 3)}`);
    const opacity = chaos * (0.15 + 0.55 * flicker) + (1 - chaos) * 0.75;

    let d = "";
    let penDown = false;
    const steps = Math.max(1, Math.round(SAMPLES * drawn));
    for (let s = 0; s <= steps; s++) {
      const pt = arcPoint(a, b, (s / steps) * drawn, lift);
      if (!pt) {
        penDown = false;
        continue;
      }
      d += `${penDown ? "L" : "M"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
      penDown = true;
    }

    const pulseT = ((frame - pulseStart) / pulseDuration) % 1;
    const pulse = frame >= pulseStart ? arcPoint(a, b, pulseT, lift) : null;

    return (
      <g key={`${from}-${to}`}>
        <path
          d={d}
          fill="none"
          stroke={accentColor}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={drawn > 0 ? opacity : 0}
          filter="url(#routeGlow)"
        />
        {pulse ? (
          <circle
            cx={pulse[0]}
            cy={pulse[1]}
            r={5}
            fill={brand.white}
            opacity={interpolate(frame, [pulseStart, pulseStart + 0.4 * fps], [0, 1], {
              extrapolateRight: "clamp",
            })}
            filter="url(#pulseGlow)"
          />
        ) : null}
      </g>
    );
  });

  const portElements = Object.entries(ports).map(([name, p]) => {
    if (geoDistance(p, center) > Math.PI / 2 - 0.02) {
      return null;
    }
    const [x, y] = projection(p) as [number, number];
    const breathe = 0.6 + 0.4 * Math.sin((frame / fps) * Math.PI * 1.2 + random(name) * 6);
    return (
      <circle
        key={name}
        cx={x}
        cy={y}
        r={4}
        fill={accentColor}
        opacity={(1 - chaos * 0.6) * breathe}
        filter="url(#pulseGlow)"
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 60% 45%, ${brand.navy} 0%, ${brand.slate} 70%)`,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], { extrapolateRight: "clamp" }),
          scale: interpolate(frame, [0, 5 * fps], [0.96, 1.02], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
        }}
      >
        <defs>
          <radialGradient id="ocean" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#12305a" />
            <stop offset="100%" stopColor={brand.navy} />
          </radialGradient>
          <radialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor={accentColor} stopOpacity={0} />
            <stop offset="91%" stopColor={accentColor} stopOpacity={0.14} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
          </radialGradient>
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pulseGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={radius * 1.1} fill="url(#atmosphere)" />
        <circle cx={cx} cy={cy} r={radius} fill="url(#ocean)" stroke={accentColor} strokeOpacity={0.25} strokeWidth={1.5} />
        <path d={path(graticule) ?? ""} fill="none" stroke={accentColor} strokeOpacity={0.06} strokeWidth={1} />
        <path d={path(land) ?? ""} fill="#152236" stroke="#2a4a72" strokeOpacity={0.6} strokeWidth={1} />
        {routeElements}
        {portElements}
      </svg>
    </AbsoluteFill>
  );
};

const globeNetworkSchema = {
  accentColor: { type: "color", default: brand.cyan, description: "Route color" },
} as const satisfies InteractivitySchema;

export const GlobeNetwork = Interactive.withSchema({
  Component: GlobeNetworkInner,
  componentName: "<GlobeNetwork>",
  schema: globeNetworkSchema,
  wrapInSequence: true,
});
