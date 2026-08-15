import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import WorkspacesPage from "@/pages/WorkspacesPage";
import WorkspacePage from "@/pages/WorkspacePage";
import SettingsPage from "@/pages/SettingsPage";
import ActivityPage from "@/pages/ActivityPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <WorkspacesPage />,
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
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "activity",
        element: <ActivityPage />,
      },
    ],
  },
]);