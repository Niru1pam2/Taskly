import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { User } from "~/types";

export default function Watchers({ watchers }: { watchers: User[] }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
      <h3 className="text-lg font-medium mb-4">Watchers</h3>

      <div className="space-y-2">
        {watchers && watchers.length > 0 ? (
          watchers.map((watcher) => (
            <div key={watcher._id}>
              <Avatar>
                <AvatarImage src={watcher.profilePicture} />
                <AvatarFallback>
                  {watcher.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No Watcher</p>
        )}
      </div>
    </div>
  );
}
