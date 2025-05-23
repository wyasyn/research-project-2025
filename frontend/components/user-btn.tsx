import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CircleUserRound } from "lucide-react";
import Logout from "./logout";
import DashboardRoutes from "./dashboard-routes";
import { getUser } from "@/lib/actions/users";

export default async function UserBtn() {
  const { user, error } = await getUser();
  if (error || !user) {
    return (
      <div className="mt-auto">
        <CircleUserRound className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={user.image_url}
                alt={user.name}
              />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DashboardRoutes userId={user.id} />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Logout />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
