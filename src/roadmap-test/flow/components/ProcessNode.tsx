import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { TbArrowsJoin2, TbFilter, TbSortAscending, TbLayoutColumns } from "react-icons/tb";
import { MdOutlineMergeType } from "react-icons/md";

export interface ProcessNodeData {
  label: string;
  value: string;
  progress: number;
  iconType: "join" | "filter" | "sort" | "merge" | "column";
  color?: string;
}

const icons = {
  join: TbArrowsJoin2,
  filter: TbFilter,
  sort: TbSortAscending,
  merge: MdOutlineMergeType,
  column: TbLayoutColumns,
};

function ProcessNode({ data, isConnectable }: NodeProps<ProcessNodeData>) {
  const Icon = icons[data.iconType];
  const accent = data.color || "#a855f7";

  return (
    <div
      className="bg-white border-2 rounded-xl shadow-md p-4 min-w-[200px]"
      style={{ borderColor: accent }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#fff", borderColor: accent }}
      />

      <div className="flex items-center gap-3 mb-3">
        <Icon className="text-gray-700 text-xl" />
        <p className="text-gray-800 font-semibold">{data.label}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 h-2 rounded-full">
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: accent, width: `${data.progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">{data.value}</p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#fff", borderColor: accent }}
      />
    </div>
  );
}

export default memo(ProcessNode);
