import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Note: Ensure this path is correct

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}