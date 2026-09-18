import { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import type { Task, TaskStatus, TaskPriority } from "../types/task";

interface Filters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export function useTasks(filters: Filters) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const refetch = () => {
    getTasks(filters).then(setTasks).catch(console.error);
  };

  useEffect(() => {
    refetch();
  }, [filters.status, filters.priority, filters.search]);

  return { tasks, refetch };
}
