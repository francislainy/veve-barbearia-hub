import { useState } from "react";
import { useServices } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const AdminServiceManagement = () => {
  const { services, isLoading, createService, updateService, deleteService } = useServices();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    duration_minutes: "30",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      duration_minutes: "30",
    });
    setEditingService(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success } = await createService(
      formData.name,
      formData.category,
      parseFloat(formData.price),
      parseInt(formData.duration_minutes)
    );
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const { success } = await updateService(editingService.id, {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes),
    });

    if (success) {
      setEditingService(null);
      resetForm();
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
    });
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateService(id, { is_active: !isActive });
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gerenciar Serviços
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Serviço</DialogTitle>
                <DialogDescription>
                  Adicione um novo serviço ao catálogo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Cabelo, Barba, Química"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Criar Serviço</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando serviços...</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                        <TableCell>{service.duration_minutes} min</TableCell>
                        <TableCell>
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Dialog open={editingService?.id === service.id} onOpenChange={(open) => !open && resetForm()}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Serviço</DialogTitle>
                                <DialogDescription>
                                  Atualize as informações do serviço
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nome do Serviço</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category">Categoria</Label>
                                  <Input
                                    id="edit-category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-price">Preço (R$)</Label>
                                  <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-duration">Duração (minutos)</Label>
                                  <Input
                                    id="edit-duration"
                                    type="number"
                                    min="5"
                                    step="5"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                    required
                                  />
                                </div>
                                <Button type="submit" className="w-full">Salvar Alterações</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este serviço?")) {
                                deleteService(service.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

