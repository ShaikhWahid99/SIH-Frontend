import React, { useMemo } from "react";
import ReactFlow, { MarkerType } from "reactflow";

import "reactflow/dist/style.css";

import { nodeTypes } from "./nodeTypes";
import { edgeTypes } from "./edgeTypes";

import nodesJSON from "./data/nodes.json";
import edgesJSON from "./data/edges.json";

export default function FlowDiagram() {
  const nodes = useMemo(() => nodesJSON, []);
  const edges = useMemo(
    () =>
      edgesJSON.map((e) => ({
        ...e,
        type: "curved",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
        style: { strokeWidth: 3, stroke: "#a855f7" },
      })),
    []
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 to-indigo-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      />
    </div>
  );
}
