import { useState } from "react";
import { createTask, updateTask, deleteTask } from "../api/tasks";
import type { Task, TaskStatus, TaskPriority } from "../types/task";

interface Props {
  task: Task | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskFormModal({ task, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "pending");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium",
  );
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) return;

    const data = {
      title,
      description: description || null,
      status,
      priority,
      due_date: dueDate || null,
    };

    try {
      if (task) {
        await updateTask(task.id, data);
      } else {
        await createTask(data);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setFormError("could not save this task");
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      onSaved();
    } catch (err) {
      console.error(err);
      setFormError("could not delete this task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-30 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-line rounded-xl p-6 w-full max-w-sm flex flex-col gap-3"
      >
        <p className="font-heading text-base font-medium text-ink">
          {task ? "edit task" : "new task"}
        </p>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
          required
          className="font-meta text-sm border border-line rounded-lg px-3 py-2 outline-none"
        />
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="description"
          rows={2}
          className="font-meta text-sm border border-line rounded-lg px-3 py-2 outline-none resize-none"
        />
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="font-meta text-xs border border-line rounded-lg px-2 py-1.5 flex-1"
          >
            <option value="pending">pending</option>
            <option value="in_progress">in progress</option>
            <option value="completed">completed</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="font-meta text-xs border border-line rounded-lg px-2 py-1.5 flex-1"
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
        <input
          type="date"
          value={dueDate ?? ""}
          onChange={(e) => setDueDate(e.target.value)}
          className="font-meta text-xs border border-line rounded-lg px-3 py-2"
        />

        {formError && (
          <p className="font-meta text-xs text-high">{formError}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {task ? (
            <button
              type="button"
              onClick={handleDelete}
              className="font-meta text-xs text-high cursor-pointer"
            >
              delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="font-meta text-xs text-ink-muted px-3 py-1.5 cursor-pointer"
            >
              cancel
            </button>
            <button
              type="submit"
              className="font-meta text-xs bg-ink text-white rounded-full px-4 py-1.5 cursor-pointer"
            >
              save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
