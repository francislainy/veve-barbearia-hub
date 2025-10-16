import { useState } from "react";
import { useTimeSlots } from "@/hooks/useTimeSlots";
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
import { Plus, Trash2, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const AdminTimeSlotManagement = () => {
  const { timeSlots, isLoading, createTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimeSlots();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTime, setNewTime] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success } = await createTimeSlot(newTime);
    if (success) {
      setIsCreateDialogOpen(false);
      setNewTime("");
    }
  };

  const handleToggleAvailable = async (id: string, isAvailable: boolean) => {
    await updateTimeSlot(id, !isAvailable);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gerenciar Horários
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Horário</DialogTitle>
                <DialogDescription>
                  Adicione um novo horário de atendimento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Horário (HH:MM)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Adicionar Horário</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando horários...</p>
        ) : timeSlots.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum horário cadastrado
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.time}</TableCell>
                  <TableCell>
                    <Switch
                      checked={slot.is_available}
                      onCheckedChange={() => handleToggleAvailable(slot.id, slot.is_available)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este horário?")) {
                          deleteTimeSlot(slot.id);
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
        )}
      </CardContent>
    </Card>
  );
};

