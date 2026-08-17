import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { WorkspaceAvatar } from "../workspace/work-sapce-avatar";
import { useAuth } from "@/provider/auth-context-provider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspacesQuery } from "@/hooks/use-auth";


interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, logout } = useAuth();
  const { data: workspaces = [], isLoading } = useWorkspacesQuery();

  const isOnWorkspacePage = pathname.includes("/workspace");

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);

    if (isOnWorkspacePage) {
        router.push(`/workspaces/${workspace._id}`);
    } else {

      router.push(`${pathname}?workspaceId=${workspace._id}`);
    }
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <DropdownMenu>
            <DropdownMenuTrigger
            render={<Button variant="outline" />}
            >
            {selectedWorkspace ? (
                <>
                {selectedWorkspace.color && (
                    <WorkspaceAvatar
                    color={selectedWorkspace.color}
                    name={selectedWorkspace.name}
                    />
                )}

                <span className="font-medium">
                    {selectedWorkspace.name}
                </span>
                </>
            ) : (
                <span className="font-medium">
                Select Workspace
                </span>
            )}
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {workspaces.map((ws) => (
                    <DropdownMenuItem
                        key={ws._id}
                        onClick={() => handleOnClick(ws)}
                    >
                        {ws.color && (
                        <WorkspaceAvatar
                            color={ws.color}
                            name={ws.name}
                        />
                        )}

                        <span className="ml-2">{ws.name}</span>
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onCreateWorkspace}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Workspace
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <button className="rounded-full border p-1 w-8 h-8" />
                }
                >
                <Avatar className="w-8 h-8">
                    <AvatarImage
                    src={user?.profilePicture}
                    alt={user?.name}
                    />
                    <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                    <Link href="/user/profile">Profile</Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={logout}>
                    Log Out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};