// src/types/index.ts

export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface Task {
  id: string;
  user_task_name: string;
  planned_start_date?: string;
  planned_end_date?: string;
  estimated_effort_min?: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSession {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_sec?: number;
  notes?: string;
  created_at: string;
}

export interface TaskWithTimeSpent extends Task {
  time_spent_seconds: number;
}

export interface CurrentDaySummary {
  total_time_tracked: string;
  total_time_tracked_seconds: number;
  completed_tasks_count: number;
  tasks_worked_on_count: number;
  tasks_worked_on: TaskWithTimeSpent[];
  completed_tasks: TaskWithTimeSpent[];
  in_progress_tasks: TaskWithTimeSpent[];
  pending_tasks: TaskWithTimeSpent[];
  task_status_chart: {
    PENDING: number;
    IN_PROGRESS: number;
    DONE: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  username?: string;
}