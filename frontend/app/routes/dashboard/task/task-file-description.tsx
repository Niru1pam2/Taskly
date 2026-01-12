import type { Task } from "~/types";

import { format } from "date-fns";
import { DownloadCloud, FileIcon, Paperclip } from "lucide-react";

export default function FileDescription({ task }: { task: any }) {
  // Helper function to format bytes to KB or MB
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 1. Empty State
  if (!task.attachments || task.attachments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2 py-2">
        <Paperclip className="h-4 w-4" />
        <span>No attachments added yet.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Paperclip className="h-4 w-4" />
        Attachments ({task.attachments.length})
      </h4>

      <div className="grid grid-cols-1 gap-2">
        {task.attachments.map((file: any) => (
          <div
            key={file._id}
            className="group flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 shrink-0 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm font-medium hover:underline hover:text-primary"
                  title={file.fileName}
                >
                  {file.fileName}
                </a>

                <p className="text-xs text-muted-foreground truncate">
                  {formatFileSize(file.fileSize || 0)}

                  {file.uploadedAt && (
                    <>
                      <span className="mx-1">•</span>
                      {format(new Date(file.uploadedAt), "MMM d, yyyy")}
                    </>
                  )}

                  {file.uploadedBy?.name && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-foreground/80">
                        by {file.uploadedBy.name}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <a
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 rounded-md p-2 text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-all"
              title="Download"
            >
              <DownloadCloud className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
