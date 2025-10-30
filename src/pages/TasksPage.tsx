// src/pages/TasksPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksAPI, timeSessionsAPI } from "../api/client";
import type { Task } from "../types";
import { Plus, Clock } from "lucide-react";
import CreateTaskModal from "../components/CreateTaskModel";
import TaskCard from "../components/TaskCard";

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await tasksAPI.getTasks();
      return response.data as Task[];
    },
  });

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeSessionsAPI.startTimer(taskId),
    onSuccess: (_, taskId) => {
      setActiveTimers((prev) => new Set(prev).add(taskId));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeSessionsAPI.stopTimer(taskId),
    onSuccess: (_, taskId) => {
      setActiveTimers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleStartTimer = (taskId: string) => {
    startTimerMutation.mutate(taskId);
  };

  const handleStopTimer = (taskId: string) => {
    stopTimerMutation.mutate(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  // Group tasks by status
  const pendingTasks = tasksData?.filter((t) => t.status === "Pending") || [];
  const inProgressTasks =
    tasksData?.filter((t) => t.status === "In Progress") || [];
  const completedTasks =
    tasksData?.filter((t) => t.status === "Completed") || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  // When clikced on finish task
  const handleFinishTask = async (taskId: string) => {
    try {
      await tasksAPI.updateTask(taskId, { status: "Completed" });
      // Invalidate or refetch tasks to reflect change
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      console.error("Failed to finish task", error);
      // Optional: show toast/notification
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track your tasks</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          New Task
        </button>
      </div>

      {/* Tasks Grid */}
      {tasksData && tasksData.length > 0 ? (
        <div className="space-y-8">
          {/* In Progress Tasks */}
          {inProgressTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                In Progress ({inProgressTasks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isTimerActive={activeTimers.has(task.id)}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    onDelete={handleDeleteTask}
                    onFinishTask={handleFinishTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Pending ({pendingTasks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isTimerActive={activeTimers.has(task.id)}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    onDelete={handleDeleteTask}
                    onFinishTask={handleFinishTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Completed ({completedTasks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isTimerActive={false}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    onDelete={handleDeleteTask}
                    onFinishTask={handleFinishTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first task to start tracking time
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            Create Task
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
