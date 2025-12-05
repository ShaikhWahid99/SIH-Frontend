import React, { useMemo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// --- TYPES ---
export interface MindmapNode {
  id?: string;
  title: string;
  link?: string;
  children?: MindmapNode[];
}

interface Props {
  data: MindmapNode;
  width?: number;
  height?: number;
}

const randomHue = () => Math.floor(Math.random() * 360);

export default function Mindmap({
  data,
  width = 1400,
  height = 900
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  /* ----------------------------------------------------------
     1. LAYOUT + COLOR ASSIGNMENT
  ---------------------------------------------------------- */
  const root = useMemo(() => {
    const h = d3.hierarchy(data);

    // assign color hues
    h.each((node: any) => {
      if (node.depth === 0) node.data._hue = 210; // deep blue for root
      else if (node.depth === 1) node.data._hue = randomHue();
      else node.data._hue = node.parent.data._hue;
    });

    const layout = d3.tree()
      .nodeSize([60, 260])
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 2));

    layout(h);
    return h;
  }, [data]);

  /* ----------------------------------------------------------
     2. ZOOM + PAN (fixed so clicking works)
  ---------------------------------------------------------- */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = svg.select(".mindmap-group");

    const zoom = d3.zoom()
      .filter((event) => event.type !== "click")
      .on("zoom", (ev) => g.attr("transform", ev.transform));

    // @ts-ignore
    svg.call(zoom);
    // @ts-ignore
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 4, height / 2));
  }, [width, height]);

  /* Smooth S-curve generator */
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
      style={{
        background: "#f9fafb",
        cursor: "grab",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <defs>
        {/* subtle soft shadow */}
        <filter id="node-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>

      <g className="mindmap-group">

        {/* ======================= GRADIENTS FOR EDGES ======================= */}
        <defs>
          {root.links().map((link: any, i: number) => {
            const hue = link.target.data._hue;
            const id = `edgegrad-${i}`;
            return (
              <linearGradient
                key={id}
                id={id}
                gradientUnits="userSpaceOnUse"
                x1={link.source.y}
                y1={link.source.x}
                x2={link.target.y}
                y2={link.target.x}
              >
                <stop offset="0%" stopColor={`hsl(${hue}, 80%, 35%)`} stopOpacity="1" />
                <stop offset="50%" stopColor={`hsl(${hue}, 80%, 45%)`} stopOpacity="0.9" />
                <stop offset="100%" stopColor={`hsl(${hue}, 80%, 55%)`} stopOpacity="0.85" />
              </linearGradient>
            );
          })}
        </defs>

        {/* ======================= EDGES ======================= */}
        {root.links().map((link: any, i: number) => {
          const id = `edgegrad-${i}`;
          const thickness = Math.max(3, 11 - link.target.depth * 2);

          return (
            <path
              key={i}
              d={curve(link) || ""}
              fill="none"
              stroke={`url(#${id})`}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.25))",
              }}
            />
          );
        })}

        {/* ======================= NODES ======================= */}
        {root.descendants().map((node: any, i: number) => {
          const { x, y } = node;
          const { title, link } = node.data;

          const isRoot = node.depth === 0;
          const hasChildren = node.children?.length > 0;
          const nodeId = `n-${i}`;
          const isHovered = hoveredNode === nodeId;

          let anchor: "start" | "middle" | "end" = "start";
          let xOffset = 14;

          if (isRoot) {
            anchor = "middle";
            xOffset = 0;
          } else if (hasChildren) {
            anchor = "end";
            xOffset = -14;
          }

          // calculate text width
          const widthEst = title.length * 9 + 28;

          return (
            <g
              key={i}
              transform={`translate(${y}, ${x})`}
              onMouseEnter={() => setHoveredNode(nodeId)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (link) window.open(link, "_blank");
              }}
              style={{ cursor: link ? "pointer" : "default" }}
            >

              {/* ===== ROOT NODE BOX ===== */}
              {isRoot && (
                <rect
                  x={-140}
                  y={-35}
                  width={280}
                  height={70}
                  rx={10}
                  fill="#1e293b"
                  filter="url(#node-shadow)"
                />
              )}

              {/* ===== REGULAR NODE PILL ===== */}
              {!isRoot && (
                <rect
                  x={anchor === "end" ? -widthEst : 0}
                  y={-18}
                  width={widthEst}
                  height={36}
                  rx={18}
                  fill="white"
                  stroke={isHovered ? "#334155" : "transparent"}
                  strokeWidth={2}
                  filter="url(#node-shadow)"
                  style={{
                    transition: "150ms",
                  }}
                />
              )}

              {/* ===== NODE TEXT ===== */}
              <text
                dy="0.35em"
                x={xOffset}
                textAnchor={anchor}
                style={{
                  fontSize: isRoot ? "18px" : "15px",
                  fontWeight: isRoot ? 700 : hasChildren ? 600 : 500,
                  fill: isRoot ? "white" : link ? "#2563eb" : "#1e293b",
                  textDecoration: link && isHovered ? "underline" : "none",
                  pointerEvents: "none",
                }}
              >
                {title}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
