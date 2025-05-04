
// Re-export toast from sonner for convenience
import { toast } from "sonner";

export { toast };

export const useToast = () => {
  return { toast };
};
