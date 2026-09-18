import { useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { Timeline } from "./components/Timeline";
import { TaskFormModal } from "./components/TaskFormModal";
import { useTasks } from "./hooks/useTasks";
import type { TaskStatus, TaskPriority, Task } from "./types/task";

function App() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { tasks, isLoading, error, refetch } = useTasks({
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const openNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    refetch();
  };

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

      <button
        onClick={openNewTask}
        className="fixed bottom-8 right-8 z-20 bg-ink text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
      >
        +
      </button>

      <Timeline
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onTaskClick={openEditTask}
      />

      {showForm && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default App;
