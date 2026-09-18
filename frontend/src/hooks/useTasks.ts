import { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import type { Task, TaskStatus, TaskPriority } from "../types/task";

interface Filters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

// bare-bones for now — loading/error states land in Phase 7
export function useTasks(filters: Filters) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks(filters).then(setTasks).catch(console.error);
  }, [filters.status, filters.priority, filters.search]);

  return tasks;
}
