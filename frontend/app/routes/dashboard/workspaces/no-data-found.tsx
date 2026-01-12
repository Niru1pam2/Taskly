import { FolderSearch, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NoDataFoundProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void;
}

export default function NoDataFound({
  title,
  description,
  buttonText,
  buttonAction,
}: NoDataFoundProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center animate-in fade-in-50">
      {/* Icon Circle */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
        <FolderSearch className="h-10 w-10 text-muted-foreground" />
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-muted-foreground max-w-sm mx-auto mb-6 text-sm">
        {description}
      </p>

      {/* Action Button (Only renders if text & action are provided) */}
      {buttonText && buttonAction && (
        <Button onClick={buttonAction} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}
