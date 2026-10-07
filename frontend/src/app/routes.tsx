import { createHashRouter, Navigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import WorkspacesPage from "@/pages/WorkspacesPage";
import WorkspacePage from "@/pages/WorkspacePage";
import AppsPage from "@/pages/AppsPage";
import SettingsPage from "@/pages/SettingsPage";
import ActivityPage from "@/pages/ActivityPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/workspaces" replace />,
      },
      {
        path: "workspaces",
        element: <WorkspacesPage />,
      },
      {
        path: "workspaces/:workspaceId",
        element: <WorkspacePage />,
      },
      {
        path: "apps",
        element: <AppsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "activity",
        element: <ActivityPage />,
      },
      {
        path: "*",
        element: <Navigate to="/workspaces" replace />,
      },
    ],
  },
]);