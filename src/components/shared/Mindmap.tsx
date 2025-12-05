import React, { useMemo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// --- TYPES ---
export interface MindmapNode {
  id?: string;
  title: string;
  code?: string;
  link?: string;
  children?: MindmapNode[];
  _hue?: number; // Internal property for coloring
}

interface Props {
  data: MindmapNode;
  width?: number;
  height?: number;
}

const randomHue = () => Math.floor(Math.random() * 360);

export default function Mindmap({
  data,
  width = 1200,
  height = 800
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  /* ----------------------------------------------------------
      1. LAYOUT + COLOR ASSIGNMENT + SORTING (VERTICAL)
  ---------------------------------------------------------- */
  const root = useMemo(() => {
    
    // Create a safe copy and sort children
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

    // Assign color hues
    h.each((node: any) => {
      if (node.depth === 0) node.data._hue = 210; // deep blue for root
      else if (node.depth === 1) node.data._hue = randomHue();
      else node.data._hue = node.parent.data._hue;
    });

    // VERTICAL LAYOUT CONFIGURATION
    // FIXED: Increased first value (Width) from 220 -> 340 to stop overlap
    const layout = d3.tree()
      .nodeSize([340, 150]) 
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3));

    layout(h);
    return h;
  }, [data]);

  /* ----------------------------------------------------------
      2. ZOOM + PAN
  ---------------------------------------------------------- */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = svg.select(".mindmap-group");

    const zoom = d3.zoom()
      .scaleExtent([0.1, 2]) // Limit zoom levels
      .filter((event) => event.type !== "click")
      .on("zoom", (ev) => g.attr("transform", ev.transform));

    // @ts-ignore
    svg.call(zoom);
    
    // Initial Center: Translate to horizontal center, and slightly down from top
    // @ts-ignore
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 100).scale(0.8));
  }, [width, height]);

  // VERTICAL LINK GENERATOR
  // x accessor returns d.x (horizontal pos), y accessor returns d.y (vertical pos)
  const curve = d3.linkVertical()
    .x((d: any) => d.x)
    .y((d: any) => d.y);

  /* ----------------------------------------------------------
      3. RENDER
  ---------------------------------------------------------- */
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full border rounded-xl bg-slate-50"
      style={{
        cursor: "grab",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <defs>
        <filter id="node-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
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
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
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
          // Thicker lines near root
          const thickness = Math.max(2, 8 - link.target.depth * 2);

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
                filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))",
              }}
            />
          );
        })}

        {/* ======================= NODES ======================= */}
        {root.descendants().map((node: any, i: number) => {
          // VERTICAL: Use (x, y) directly
          const { x, y } = node;
          const { title, link } = node.data;

          const isRoot = node.depth === 0;
          const nodeId = `n-${i}`;
          const isHovered = hoveredNode === nodeId;
          const anchor = "middle"; 

          // --- FIXED: TITLE SPLITTING LOGIC ---
          // Split title if it's long (e.g. > 25 chars)
          let lines = [title];
          if (title.length > 28) {
             const mid = Math.floor(title.length / 2);
             // try to find a space near the middle
             const spaceIdx = title.lastIndexOf(" ", mid + 5);
             if (spaceIdx > 10) {
               lines = [title.slice(0, spaceIdx), title.slice(spaceIdx + 1)];
             } else {
               // Force split if no suitable space
               lines = [title.slice(0, mid), title.slice(mid)];
             }
          }

          // Adjust box size based on line count
          const isMultiLine = lines.length > 1;
          
          // Calculate approximate text width for pill size (based on longest line)
          const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, "");
          const charWidth = 9; 
          const textWidth = Math.max(120, longestLine.length * charWidth + 30);
          
          const rectWidth = isRoot ? 280 : textWidth;
          // Taller box if multi-line
          const rectHeight = isRoot ? 70 : (isMultiLine ? 55 : 40); 
          
          // Center the rect on the node's x,y
          const rectX = -(rectWidth / 2);
          const rectY = -(rectHeight / 2);

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

              {/* ===== NODE BOX ===== */}
              <rect
                x={rectX}
                y={rectY}
                width={rectWidth}
                height={rectHeight}
                rx={isRoot ? 10 : 20}
                fill={isRoot ? "#1e293b" : "white"}
                stroke={isHovered ? "#3b82f6" : "transparent"} // hover blue
                strokeWidth={2}
                filter="url(#node-shadow)"
                style={{ transition: "150ms" }}
              />

              {/* ===== NODE TEXT (Supports 2 Lines) ===== */}
              <text
                dy={isMultiLine ? "-0.2em" : "0.35em"} // shift up slightly if 2 lines
                textAnchor={anchor}
                style={{
                  fontSize: isRoot ? "18px" : "14px",
                  fontWeight: isRoot ? 700 : 500,
                  fill: isRoot ? "white" : link ? "#2563eb" : "#1e293b",
                  textDecoration: link && isHovered ? "underline" : "none",
                  pointerEvents: "none",
                }}
              >
                {lines.map((line, idx) => (
                  <tspan 
                    key={idx} 
                    x="0" 
                    dy={idx === 0 ? "0" : "1.2em"} // Second line drops down
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}