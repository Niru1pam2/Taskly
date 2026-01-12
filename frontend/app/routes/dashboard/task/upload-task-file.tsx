import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, UploadCloud } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useQueryClient } from "@tanstack/react-query"; // Assuming you use React Query
import { useUploadTaskFileMutation } from "~/hooks/use-task";

export default function UploadFile({ taskId }: { taskId: string }) {
  const { mutate: uploadFile, isPending: isUploading } =
    useUploadTaskFileMutation();

  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast.error("File is too large. Limit is 5MB.");
      return;
    }

    const formData = new FormData();

    formData.append("attachment", file);

    uploadFile(
      { taskId, formData },
      {
        onSuccess: () => {
          toast.success("File uploaded successfully");
          e.target.value = "";
        },

        onError: (error: any) => {
          toast.error(error.response.data.message || "Failed to upload file");
        },
      }
    );
  };

  return (
    <div className="w-full">
      <input
        type="file"
        id={`upload-${taskId}`}
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <label htmlFor={`upload-${taskId}`}>
        <Button
          variant="outline"
          className="w-full border-dashed border-2 h-24 flex flex-col gap-2 hover:bg-muted/50 cursor-pointer"
          disabled={isUploading}
          asChild
        >
          <span className="flex flex-col items-center justify-center text-muted-foreground">
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-6 w-6 mb-2" />
                <span>Click to Upload Attachment</span>
                <span className="text-xs font-normal opacity-75">
                  (Max 5MB)
                </span>
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}
