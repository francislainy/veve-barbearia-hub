import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'barbeiro';
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isBarbeiro, isAdmin, loading: roleLoading } = useUserRole(user);

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireRole === 'barbeiro' && !isBarbeiro) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
