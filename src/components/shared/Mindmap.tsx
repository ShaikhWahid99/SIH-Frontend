import React, { useMemo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// --- TYPES ---
export interface MindmapNode {
  id?: string;
  title: string;
  code?: string;
  link?: string;
  children?: MindmapNode[];
  _hue?: number;
}

interface Props {
  data: MindmapNode;
  width?: number;
  height?: number;
}

const randomHue = () => Math.floor(Math.random() * 360);

// --- HELPER: WORD WRAPPER ---
function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/);
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === 5) {
         const remaining = words.slice(i).join(" ");
         currentLine = remaining.length > maxChars ? remaining.slice(0, maxChars) + "..." : remaining;
         break; 
      }
    }
  }
  lines.push(currentLine);
  return lines;
}

export default function Mindmap({
  data,
  width = 1200,
  height = 800
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  /* ----------------------------------------------------------
      1. LAYOUT CONFIGURATION
  ---------------------------------------------------------- */
  const root = useMemo(() => {
    const sortedData = {
      ...data,
      children: data.children
        ? [...data.children].sort((a: any, b: any) => {
            const codeA = a.code || "ZZZ";
            const codeB = b.code || "ZZZ";
            return codeA.localeCompare(codeB);
          })
        : []
    };

    const h = d3.hierarchy(sortedData);

    h.each((node: any) => {
      if (node.depth === 0) node.data._hue = 210; 
      else if (node.depth === 1) node.data._hue = randomHue();
      else node.data._hue = node.parent.data._hue;
    });

    const layout = d3.tree()
      .nodeSize([140, 260]) 
      .separation((a, b) => (a.parent === b.parent ? 1.05 : 1.15));

    layout(h);
    return h;
  }, [data]);

  /* ----------------------------------------------------------
      2. ZOOM + CENTER
  ---------------------------------------------------------- */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = svg.select(".mindmap-group");

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .filter((event) => event.type !== "click")
      .on("zoom", (ev) => g.attr("transform", ev.transform));

    // @ts-ignore
    svg.call(zoom);
    // @ts-ignore
    svg.call(zoom.transform, d3.zoomIdentity.translate(120, height / 2).scale(0.8));
    
  }, [width, height, data]);

  const curve = d3.linkHorizontal()
    .x((d: any) => d.y)
    .y((d: any) => d.x);

  /* ----------------------------------------------------------
      3. RENDER
  ---------------------------------------------------------- */
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full border rounded-xl bg-slate-50"
      style={{ cursor: "grab", fontFamily: "Inter, sans-serif" }}
    >
      <defs>
        <filter id="node-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
        </filter>
      </defs>

      <g className="mindmap-group">
        {/* EDGES */}
        <defs>
          {root.links().map((link: any, i: number) => {
            const hue = link.target.data._hue;
            const id = `edgegrad-${i}`;
            return (
              <linearGradient
                key={id}
                id={id}
                gradientUnits="userSpaceOnUse"
                x1={link.source.y} y1={link.source.x}
                x2={link.target.y} y2={link.target.x}
              >
                <stop offset="0%" stopColor={`hsl(${hue}, 80%, 35%)`} stopOpacity="1" />
                <stop offset="50%" stopColor={`hsl(${hue}, 80%, 45%)`} stopOpacity="0.9" />
                <stop offset="100%" stopColor={`hsl(${hue}, 80%, 55%)`} stopOpacity="0.85" />
              </linearGradient>
            );
          })}
        </defs>

        {root.links().map((link: any, i: number) => {
          const id = `edgegrad-${i}`;
          const thickness = Math.max(2, 6 - link.target.depth);
          return (
            <path
              key={i}
              d={curve(link) || ""}
              fill="none"
              stroke={`url(#${id})`}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))" }}
            />
          );
        })}

        {/* NODES */}
        {root.descendants().map((node: any, i: number) => {
          const x = node.y; 
          const y = node.x; 
          const { title, link } = node.data;
          const isRoot = node.depth === 0;
          const nodeId = `n-${i}`;
          const isHovered = hoveredNode === nodeId;

          // --- 1. WRAP TEXT ---
          const maxChars = isRoot ? 22 : 24; 
          const lines = wrapText(title, maxChars);
          
          // --- 2. SIZING CONFIG ---
          // Increase Line Height for readability (1.2x font size)
          const fontSize = isRoot ? 16 : 13;
          const lineHeight = fontSize * 1.3; 
          
          const verticalPadding = isRoot ? 26 : 22; 
          const horizontalPadding = isRoot ? 32 : 24; 
          
          const longestLineChars = lines.reduce((max, line) => Math.max(max, line.length), 0);
          
          // Width Multipliers
          const charWidth = isRoot ? 10.5 : 8; 
          const minWidth = 100;
          
          const rectWidth = Math.max(minWidth, longestLineChars * charWidth + horizontalPadding);
          const rectHeight = (lines.length * lineHeight) + verticalPadding;

          return (
            <g
              key={i}
              transform={`translate(${x}, ${y})`}
              onMouseEnter={() => setHoveredNode(nodeId)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (link) window.open(link, "_blank");
              }}
              style={{ cursor: link ? "pointer" : "default" }}
            >
              <rect
                x={-rectWidth / 2}
                y={-rectHeight / 2}
                width={rectWidth}
                height={rectHeight}
                rx={isRoot ? 10 : 6}
                fill={isRoot ? "#1e293b" : "white"}
                stroke={isHovered ? "#3b82f6" : "transparent"}
                strokeWidth={2}
                filter="url(#node-shadow)"
                style={{ transition: "all 200ms ease" }}
              />

              <text
                textAnchor="middle"
                // dominantBaseline="central" helps align vertically
                dominantBaseline="middle" 
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: isRoot ? 700 : 500,
                  fill: isRoot ? "white" : link ? "#2563eb" : "#1e293b",
                  textDecoration: link && isHovered ? "underline" : "none",
                  pointerEvents: "none",
                }}
              >
                {lines.map((line, idx) => {
                    // CALCULATE EXACT Y for each line relative to center (0)
                    // Formula: (index - middleIndex) * lineHeight
                    const middleIndex = (lines.length - 1) / 2;
                    const lineY = (idx - middleIndex) * lineHeight;
                    
                    return (
                      <tspan
                        key={idx}
                        x="0"
                        y={lineY} // Explicit Y position ensures perfect centering
                      >
                        {line}
                      </tspan>
                    );
                })}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}