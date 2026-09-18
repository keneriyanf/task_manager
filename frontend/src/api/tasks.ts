import type { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '../types/task'

const API_BASE_URL = 'http://localhost:8000'

interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.search) params.set('search', filters.search)

  const response = await fetch(`${API_BASE_URL}/tasks/?${params.toString()}`)
  return handleResponse<Task[]>(response)
}

export async function getTask(id: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`)
  return handleResponse<Task>(response)
}

export async function createTask(data: TaskCreate): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Task>(response)
}

export async function updateTask(id: number, data: TaskUpdate): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Task>(response)
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
}