import { AuthProvider } from '@/components/providers/AuthProvider';

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 