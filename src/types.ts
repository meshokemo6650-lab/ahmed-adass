/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface TaskAttachment {
  name: string;
  type: 'image' | 'file' | 'audio';
  url: string; // Base64 or mock URL
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:MM
  reminderTime: 'none' | '5m' | '15m' | '30m' | '1h' | '1d';
  color: string; // Tailwind bg color class, e.g., 'bg-emerald-500'
  icon: string; // Lucide icon name
  priority: Priority;
  categoryId: string;
  completed: boolean;
  completionPercentage: number;
  notes?: string;
  attachments?: TaskAttachment[];
  links?: string[];
  voiceNoteUrl?: string; // Base64 voice note or mock
  recurrence: Recurrence;
  recurrenceCount?: number;
  duration?: string; // e.g., "1.5h", "45m"
  location?: string;
  createdAt: string;
  subtasks?: SubTask[];
  comments?: TaskComment[];
  assignedTo?: string; // Collaboration mock
  autoMigrated?: boolean; // True if carried over from yesterday
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  color: string; // CSS color class or hex
  icon: string; // Lucide icon name
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  isLoggedIn: boolean;
  timezone: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  fontSize: 'normal' | 'large' | 'xl';
  autoMigrateTasks: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  activeSessions: { device: string; ip: string; lastActive: string }[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'task_new' | 'task_overdue' | 'task_completed' | 'sync' | 'shared';
  createdAt: string;
  read: boolean;
}
