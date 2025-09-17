import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('student' | 'professor')[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(redirectTo);
        return;
      }
      
      if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, navigate, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}