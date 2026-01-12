import { isAxiosError } from "axios";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
  useAddCommentMutation,
  useGetCommentsByTaskIdQuery,
} from "~/hooks/use-task";
import type { Comment, User } from "~/types";

export default function CommentSection({
  taskId,
  members,
}: {
  taskId: string;
  members: User[];
}) {
  const [newComment, setNewComment] = useState("");

  const { mutate: addComment, isPending } = useAddCommentMutation();

  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added successfully");
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          }
          toast.error("Something went wrong. Please try again!");
        },
      }
    );
  };
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3>Comments</h3>

      <ScrollArea className="h-75 mb-4 mt-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 space-y-8">
              <Avatar className="size-8">
                <AvatarImage src={comment.author.profilePicture} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">
                    {comment.author.name}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No comments yet</p>
          </div>
        )}
      </ScrollArea>

      <Separator className="my-4" />

      <div className="mt-4">
        <Textarea
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <Button
            disabled={!newComment.trim() || isPending}
            onClick={handleAddComment}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
