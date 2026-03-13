import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/types";

interface UserMultiSelectProps {
  label: string;
  users: User[];
  selectedUsers: string[];
  onToggle: (userId: string) => void;
  isLoading?: boolean;
}

export function UserMultiSelect({
  label,
  users,
  selectedUsers,
  onToggle,
  isLoading = false,
}: UserMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <div className="w-full">
      <Label>{label}</Label>
      <div className="border rounded-lg overflow-hidden w-full">
        {/* Search Input */}
        <div className="p-2 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* User List */}
        <div className="p-3 max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No users found" : "No users available"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={() => onToggle(user._id)}
                  />
                  <span className="text-sm flex-1">{user.username}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedUsers.length > 0 && (
          <div className="px-3 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
          </div>
        )}
      </div>
    </div>
  );
}
