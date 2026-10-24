import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./routes";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

export default function App() {
  return (
    <>
      <RealtimeProvider>
        <RouterProvider router={router} />
      </RealtimeProvider>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
