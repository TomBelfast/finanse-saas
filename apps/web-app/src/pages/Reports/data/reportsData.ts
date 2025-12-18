import { ChartConfig } from "~/components/ui/chart";

// 1. User Engagement
export const userEngagementData = [
  { day: 'Monday', usersCount: 120, sessionTime: 15.2, pagesViewed: 8.5 },
  { day: 'Tuesday', usersCount: 132, sessionTime: 17.8, pagesViewed: 10.2 },
  { day: 'Wednesday', usersCount: 101, sessionTime: 14.3, pagesViewed: 7.8 },
  { day: 'Thursday', usersCount: 134, sessionTime: 16.9, pagesViewed: 9.6 },
  { day: 'Friday', usersCount: 90, sessionTime: 12.1, pagesViewed: 6.3 },
  { day: 'Saturday', usersCount: 85, sessionTime: 10.5, pagesViewed: 5.2 },
  { day: 'Sunday', usersCount: 93, sessionTime: 11.2, pagesViewed: 5.8 },
];

export const userEngagementConfig = {
  usersCount: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  sessionTime: {
    label: "Session Time",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// 2. Revenue
export const revenueData = [
  { month: 'January', revenue: 12500, users: 150, averageRevenue: 83.33 },
  { month: 'February', revenue: 15000, users: 175, averageRevenue: 85.71 },
  { month: 'March', revenue: 18500, users: 200, averageRevenue: 92.5 },
  { month: 'April', revenue: 22000, users: 220, averageRevenue: 100.0 },
  { month: 'May', revenue: 24500, users: 240, averageRevenue: 102.08 },
  { month: 'June', revenue: 21000, users: 210, averageRevenue: 100.0 },
];

export const revenueConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

// 3. Top Users (Pie/Donut & Bar)
export const topUsersByActivity = [
  { name: 'John Doe', email: 'john@ex.com', sessions: 45, documentsCreated: 28, fill: "hsl(var(--chart-1))" },
  { name: 'Jane Smith', email: 'jane@ex.com', sessions: 38, documentsCreated: 22, fill: "hsl(var(--chart-2))" },
  { name: 'Robert Brown', email: 'robert@ex.com', sessions: 32, documentsCreated: 18, fill: "hsl(var(--chart-3))" },
  { name: 'Sarah Williams', email: 'sarah@ex.com', sessions: 30, documentsCreated: 15, fill: "hsl(var(--chart-4))" },
  { name: 'Thomas Wilson', email: 'thomas@ex.com', sessions: 25, documentsCreated: 12, fill: "hsl(var(--chart-5))" },
].map((u, i) => ({ ...u, key: (i + 1).toString() }));

export const topUsersConfig = {
  sessions: {
    label: "Sessions",
  },
  documentsCreated: {
    label: "Documents",
  },
} satisfies ChartConfig;

export const documentsConfig = {
  documentsCreated: {
    label: "Documents",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig;

