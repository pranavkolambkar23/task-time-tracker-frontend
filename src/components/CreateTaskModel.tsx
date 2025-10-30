// src/components/CreateTaskModal.tsx
import { useState } from "react";
import { tasksAPI } from "../api/client";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

interface FormData {
  user_task_name: string;
  planned_start_date?: string;
  planned_end_date?: string;
  estimated_effort_min?: number;
}

export default function CreateTaskModal({
  onClose,
  onTaskCreated,
}: CreateTaskModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await tasksAPI.createTask(data);
      reset();
      onTaskCreated();
    } catch (error: unknown) {
      // Normalize different error shapes (Error, axios-like, string, etc.)
      type AxiosLikeError = { response?: { data?: { message?: string } }; message?: string };
      if (error instanceof Error) {
        setErrorMsg(error.message || "Failed to create task");
      } else if (typeof error === "string") {
        setErrorMsg(error);
      } else if (typeof error === "object" && error !== null) {
        const e = error as AxiosLikeError;
        setErrorMsg(e.response?.data?.message ?? e.message ?? "Failed to create task");
      } else {
        setErrorMsg("Failed to create task");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("user_task_name", {
                required: "Task name is required",
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.user_task_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.user_task_name.message}
              </p>
            )}
          </div>

          {/* Planned Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned Start Date
            </label>
            <input
              type="date"
              {...register("planned_start_date")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Planned End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned End Date
            </label>
            <input
              type="date"
              {...register("planned_end_date")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Estimated Effort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Effort (minutes)
            </label>
            <input
              type="number"
              {...register("estimated_effort_min", { min: 1 })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 60"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
