import type { TaskStatus, TaskPriority } from "../types/task";

interface FilterBarProps {
  search: string;
  status: TaskStatus | "";
  priority: TaskPriority | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "") => void;
  onPriorityChange: (value: TaskPriority | "") => void;
}

export function FilterBar({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: FilterBarProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white border border-line rounded-full px-4 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="search tasks…"
        className="font-meta text-xs text-ink-muted bg-transparent outline-none w-36"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | "")}
        className="font-meta text-xs text-ink-muted bg-paper rounded-full px-2 py-1 outline-none"
      >
        <option value="">status</option>
        <option value="pending">pending</option>
        <option value="in_progress">in progress</option>
        <option value="completed">completed</option>
      </select>
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "")}
        className="font-meta text-xs text-ink-muted bg-paper rounded-full px-2 py-1 outline-none"
      >
        <option value="">priority</option>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
      </select>
    </div>
  );
}
