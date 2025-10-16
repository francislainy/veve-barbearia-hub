import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface UserRoleBadgeProps {
  isAdmin: boolean;
}

export const UserRoleBadge = ({ isAdmin }: UserRoleBadgeProps) => {
  if (!isAdmin) return null;

  return (
    <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
      <Shield className="h-3 w-3 mr-1" />
      Admin
    </Badge>
  );
};
