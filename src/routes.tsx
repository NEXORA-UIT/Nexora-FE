import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Nexora</h1>
      </div>
    ),
  },
]);
