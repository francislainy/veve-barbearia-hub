import { Badge } from "@/components/ui/badge";
import { Scissors, User } from "lucide-react";

interface UserRoleBadgeProps {
  isBarbeiro: boolean;
  isAdmin: boolean;
}

export const UserRoleBadge = ({ isBarbeiro, isAdmin }: UserRoleBadgeProps) => {
  if (isAdmin) {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-600">
        <Scissors className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    );
  }

  if (isBarbeiro) {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-600">
        <Scissors className="h-3 w-3 mr-1" />
        Barbeiro
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <User className="h-3 w-3 mr-1" />
      Cliente
    </Badge>
  );
};

