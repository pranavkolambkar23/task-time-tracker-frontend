// scr/pages/CDSPage.tsx

// src/pages/CDSPage.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cdsAPI } from "../api/client";

// Define TypeScript interfaces for type safety
interface Task {
  id: string;
  user_task_name: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  time_spent_seconds: number;
}

interface CDSData {
  total_time_tracked: string;
  total_time_tracked_seconds: number;
  completed_tasks_count: number;
  tasks_worked_on_count: number;
  tasks_worked_on: Task[];
  completed_tasks: Task[];
  in_progress_tasks: Task[];
  pending_tasks: Task[];
  task_status_chart: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
}

interface CDSResponse {
  status: string;
  message: string;
  data: CDSData;
}

const COLORS = ["#FFBB28", "#0088FE", "#00C49F"]; // PENDING, IN_PROGRESS, DONE

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

const CDSPage = () => {
  // Fetch CDS data using React Query
  const { data, isLoading, error } = useQuery<CDSResponse>({
    queryKey: ["cdsSummary"],
    queryFn: async () => {
      const result = await cdsAPI.getCurrentDaySummary();

      // Optional: ensure business logic success
      if (result.status !== "success") {
        throw new Error(result.message || "Unexpected API response");
      }

      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  const [chartData, setChartData] = useState<{ name: string; value: number }[]>(
    []
  );

  useEffect(() => {
    if (data?.data.task_status_chart) {
      const { PENDING, IN_PROGRESS, COMPLETED } = data.data.task_status_chart;
      setChartData([
        { name: "Pending", value: PENDING },
        { name: "In Progress", value: IN_PROGRESS },
        { name: "Completed", value: COMPLETED },
      ]);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading CDS summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <div>Error loading data. Please try again later.</div>
      </div>
    );
  }

  const cds = data!.data;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Current Day Summary
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">
            Total Time Tracked
          </h3>
          <p className="text-2xl font-bold mt-2">{cds.total_time_tracked}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completed Tasks</h3>
          <p className="text-2xl font-bold mt-2">{cds.completed_tasks_count}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Tasks Worked On</h3>
          <p className="text-2xl font-bold mt-2">{cds.tasks_worked_on_count}</p>
        </div>
      </div>

      {/* Chart and Task Lists Side-by-Side (on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Task Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${
                      typeof percent === "number"
                        ? (percent * 100).toFixed(0)
                        : "0"
                    }%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Lists */}
        <div className="space-y-6">
          {/* In Progress */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              In Progress ({cds.in_progress_tasks.length})
            </h3>
            {cds.in_progress_tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks in progress.</p>
            ) : (
              <ul className="space-y-2">
                {cds.in_progress_tasks.map((task) => (
                  <li
                    key={task.id}
                    className="border-l-4 border-blue-500 pl-3 py-1"
                  >
                    <div className="font-medium">{task.user_task_name}</div>
                    <div className="text-sm text-gray-500">
                      Time: {formatTime(task.time_spent_seconds)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-yellow-600 mb-3">
              Pending ({cds.pending_tasks.length})
            </h3>
            {cds.pending_tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending tasks.</p>
            ) : (
              <ul className="space-y-2">
                {cds.pending_tasks.map((task) => (
                  <li
                    key={task.id}
                    className="border-l-4 border-yellow-500 pl-3 py-1"
                  >
                    <div className="font-medium">{task.user_task_name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Completed */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              Completed ({cds.completed_tasks.length})
            </h3>
            {cds.completed_tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No completed tasks today.</p>
            ) : (
              <ul className="space-y-2">
                {cds.completed_tasks.map((task) => (
                  <li
                    key={task.id}
                    className="border-l-4 border-green-500 pl-3 py-1"
                  >
                    <div className="font-medium">{task.user_task_name}</div>
                    <div className="text-sm text-gray-500">
                      Time: {formatTime(task.time_spent_seconds)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CDSPage;
