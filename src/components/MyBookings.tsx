import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Trash2, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyBookings } from "@/hooks/useMyBookings";
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

interface MyBookingsProps {
  userId: string;
}

export const MyBookings = ({ userId }: MyBookingsProps) => {
  const { bookings, isLoading, deleteMyBooking } = useMyBookings(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Carregando seus agendamentos...
          </p>
        </CardContent>
      </Card>
    );
  }

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date + " " + booking.time);
    return bookingDate >= new Date();
  });

  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date + " " + booking.time);
    return bookingDate < new Date();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Meus Agendamentos
        </CardTitle>
        <CardDescription>
          Gerencie seus horários agendados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Você ainda não tem agendamentos
          </p>
        ) : (
          <div className="space-y-6">
            {upcomingBookings.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Próximos Agendamentos
                </h3>
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border border-primary/20 rounded-lg bg-primary/5 flex justify-between items-center"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(booking.date), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{booking.time}</span>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Não, manter</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMyBooking(booking.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Sim, cancelar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-muted-foreground">
                  Histórico
                </h3>
                <div className="space-y-3">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border border-border rounded-lg bg-muted/30 opacity-60"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(booking.date), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

