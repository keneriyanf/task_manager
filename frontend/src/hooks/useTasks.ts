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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    getTasks(filters)
      .then(setTasks)
      .catch(() => setError("could not reach the server"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refetch();
  }, [filters.status, filters.priority, filters.search]);

  return { tasks, isLoading, error, refetch };
}
