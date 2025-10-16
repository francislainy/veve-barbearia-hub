import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield } from "lucide-react";
import { useAdminManagement } from "@/hooks/useAdminManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminUserManagement = () => {
  const { promoteUserToRole, createAdminUser, isLoading } = useAdminManagement();

  // Promote existing user
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState<"admin" | "barbeiro">("barbeiro");

  // Create new user
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "barbeiro">("barbeiro");

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail) return;

    const result = await promoteUserToRole(promoteEmail, promoteRole);
    if (result.success) {
      setPromoteEmail("");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    if (newPassword.length < 6) {
      return;
    }

    const result = await createAdminUser(newEmail, newPassword, newRole);
    if (result.success) {
      setNewEmail("");
      setNewPassword("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciar Administradores
        </CardTitle>
        <CardDescription>
          Promova usuários existentes ou crie novos administradores e barbeiros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="promote" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="promote">Promover Usuário</TabsTrigger>
            <TabsTrigger value="create">Criar Novo</TabsTrigger>
          </TabsList>

          <TabsContent value="promote" className="space-y-4 mt-4">
            <form onSubmit={handlePromoteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promote-email">Email do Usuário</Label>
                <Input
                  id="promote-email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  O usuário deve já ter uma conta criada
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promote-role">Função</Label>
                <Select value={promoteRole} onValueChange={(value: "admin" | "barbeiro") => setPromoteRole(value)}>
                  <SelectTrigger id="promote-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barbeiro">Barbeiro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Promovendo..." : "Promover Usuário"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 mt-4">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="novo@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">Função</Label>
                <Select value={newRole} onValueChange={(value: "admin" | "barbeiro") => setNewRole(value)}>
                  <SelectTrigger id="new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barbeiro">Barbeiro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Criando..." : "Criar Usuário"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Diferenças entre Funções:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li><strong>Barbeiro:</strong> Acesso ao painel admin, pode gerenciar agendamentos</li>
            <li><strong>Administrador:</strong> Todas as permissões de barbeiro + gerenciamento de usuários</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

