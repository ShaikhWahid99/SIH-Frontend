import { BaseEdge, EdgeProps, getBezierPath } from "reactflow";

export default function CurvedEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd } = props;

  const curvature = 0.55;

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      style={style}
      markerEnd={markerEnd}
    />
  );
}
