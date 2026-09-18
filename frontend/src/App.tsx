import { useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { Timeline } from "./components/Timeline";
import { useTasks } from "./hooks/useTasks";
import type { TaskStatus, TaskPriority } from "./types/task";

function App() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");

  const tasks = useTasks({
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <FilterBar
        search={search}
        status={status}
        priority={priority}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
      />
      <Timeline tasks={tasks} />
    </div>
  );
}

export default App;
