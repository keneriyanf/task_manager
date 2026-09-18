import type { Task } from "../types/task";
import { TaskCard } from "./TaskCard";

interface Props {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onTaskClick: (task: Task) => void;
}

export function Timeline({ tasks, isLoading, error, onTaskClick }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="relative max-w-xl mx-auto pl-8">
      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-line" />

      <div className="sticky top-20 z-10 flex items-center gap-2 mb-6">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-ink" />
        <span className="font-meta text-[11px] font-medium text-ink bg-line/40 px-2.5 py-1 rounded-full">
          today · {today}
        </span>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-line/40 animate-pulse" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <p className="font-meta text-xs text-high">{error}</p>
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <p className="font-meta text-xs text-ink-muted">no tasks yet</p>
      )}

      {!isLoading &&
        !error &&
        tasks.map((task, i) => (
          <div
            key={task.id}
            className="relative mb-4 animate-[fadeIn_0.3s_ease-out_both]"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="absolute -left-5 top-5 w-4 h-0.5 bg-line" />
            <div className="absolute -left-6 top-4 w-2 h-2 rounded-full bg-line" />
            <TaskCard task={task} onClick={() => onTaskClick(task)} />
          </div>
        ))}
    </div>
  );
}
