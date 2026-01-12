import { Loader2Icon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon className="animate-spin size-10" />
    </div>
  );
}
