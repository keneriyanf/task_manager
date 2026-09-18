import type { Task } from "../types/task";

const glowColor: Record<Task["priority"], string> = {
  high: "#D6522E",
  medium: "#C98A2E",
  low: "#3D7A5C",
};

const statusColor: Record<Task["status"], string> = {
  pending: "#9C9890",
  in_progress: "#E0A82E",
  completed: "#4C9A6B",
};

export function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick?: () => void;
}) {
  const color = glowColor[task.priority];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-line rounded-xl px-5 py-4 cursor-pointer"
      style={{ boxShadow: `0 0 0 1px ${color}22, 0 0 18px 2px ${color}55` }}
    >
      <p className="font-heading text-[15px] font-medium text-ink mb-1.5">
        {task.title}
      </p>
      <p className="font-meta text-[11px] text-ink-muted flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusColor[task.status] }}
        />
        {task.due_date ? `due ${task.due_date}` : "no due date"} ·{" "}
        {task.priority}
      </p>
    </div>
  );
}