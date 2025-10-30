// src/components/TaskCard.tsx
import type { Task } from "../types";
import {
  Play,
  Square,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface TaskCardProps {
  task: Task;
  isTimerActive: boolean;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onFinishTask: (taskId: string) => void;
}

export default function TaskCard({
  task,
  isTimerActive,
  onStartTimer,
  onStopTimer,
  onDelete,
  onFinishTask,
}: TaskCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isTimerActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isCompleted = task.status === "Completed";

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
          {task.user_task_name}
        </h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 p-1"
          title="Delete task"
          disabled={isCompleted}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>

      {/* Dates */}
      {(task.planned_start_date || task.planned_end_date) && (
        <div className="space-y-1 mb-4 text-sm text-gray-600">
          {task.planned_start_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Start:{" "}
                {format(new Date(task.planned_start_date), "MMM dd, yyyy")}
              </span>
            </div>
          )}
          {task.planned_end_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                End: {format(new Date(task.planned_end_date), "MMM dd, yyyy")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Estimated Effort */}
      {task.estimated_effort_min && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Clock className="h-4 w-4" />
          <span>Estimated: {task.estimated_effort_min} min</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
        {/* Elapsed Time */}
        <div className="text-sm text-gray-700 font-mono min-w-[80px]">
          {formatElapsedTime(elapsedTime)}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Finish Task Button */}
          {!isCompleted && (
            <button
              onClick={() => onFinishTask(task.id)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1"
              title="Mark task as completed"
            >
              <CheckCircle className="h-4 w-4" />
              Finish Task
            </button>
          )}

          {/* Start Session Button */}
          <button
            onClick={() => onStartTimer(task.id)}
            disabled={isTimerActive || isCompleted}
            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${
              isTimerActive || isCompleted
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            title={isCompleted ? "Cannot start session on completed task" : ""}
          >
            <Play className="h-4 w-4" />
            Start Session
          </button>

          {/* End Session Button */}
          <button
            onClick={() => onStopTimer(task.id)}
            disabled={!isTimerActive || isCompleted}
            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${
              !isTimerActive || isCompleted
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={
              isCompleted
                ? "Task is already completed"
                : !isTimerActive
                ? "No active session to end"
                : ""
            }
          >
            <Square className="h-4 w-4" />
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}