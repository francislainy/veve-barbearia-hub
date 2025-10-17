import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, Trash2, Users } from "lucide-react";
import { useAdminManagement } from "@/hooks/useAdminManagement";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export const AdminUserManagement = () => {
  const {
    users,
    loadingUsers,
    toggleAdminRole,
    deleteUser,
    isLoading
  } = useAdminManagement();

  const { user } = useAuth();
  const { isAdmin } = useUserRole(user);

  useEffect(() => {
    console.log('AdminUserManagement - Current user:', user?.id);
    console.log('AdminUserManagement - Is admin:', isAdmin);
    console.log('AdminUserManagement - Users loaded:', users);
    console.log('AdminUserManagement - Loading state:', loadingUsers);
  }, [user, isAdmin, users, loadingUsers]);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    await toggleAdminRole(userId, currentIsAdmin);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerenciar Usuários ({users.length})
        </CardTitle>
        <CardDescription>
          Visualize todos os usuários e gerencie permissões de administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <p className="text-center text-muted-foreground py-8">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            <p className="text-sm text-muted-foreground">
              Debug: Verifique o console do navegador para mais informações
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Usuário</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_admin}
                      onCheckedChange={() => handleToggleAdmin(user.id, user.is_admin)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o usuário {user.full_name}?
                            Todos os agendamentos e dados deste usuário serão removidos.
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Informações:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li><strong>Admin:</strong> Pode gerenciar usuários, serviços, horários e agendamentos</li>
            <li><strong>Cliente:</strong> Pode apenas fazer agendamentos</li>
            <li>⚠️ Excluir um usuário remove todos os seus dados permanentemente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
