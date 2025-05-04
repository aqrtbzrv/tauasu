
import { useEffect } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useStore } from "./lib/store";
import AuthForm from "./components/AuthForm";

const queryClient = new QueryClient();

const App = () => {
  const theme = useStore((state) => state.theme);
  const currentUser = useStore((state) => state.currentUser);
  
  // Update the theme class on the html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Use only Sonner Toaster to avoid conflicts */}
        <Toaster className="toaster group" theme={theme} />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={currentUser ? <Index /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/" replace /> : <AuthForm />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
