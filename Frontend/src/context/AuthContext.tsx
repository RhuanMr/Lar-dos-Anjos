import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginForm, RegisterForm } from '../types';
import { supabase } from '../config/supabase';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 Verificando autenticação...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Sessão encontrada, buscando dados do usuário...');
          // Buscar dados completos do usuário no backend
          try {
            const response = await api.get('/auth/me', {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });
            
            if (response.data.success) {
              setUser(response.data.data);
              console.log('✅ Dados do usuário carregados');
            }
          } catch (apiError) {
            console.warn('⚠️ Erro ao buscar dados do usuário no backend:', apiError);
            // Continuar sem dados do backend, mas manter sessão
          }
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Verificação de autenticação concluída');
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event);
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const response = await api.get('/auth/me', {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });
            
            if (response.data.success) {
              setUser(response.data.data);
            }
          } catch (error) {
            console.warn('⚠️ Erro ao buscar dados do usuário no auth change:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Buscar dados completos do usuário no backend
        const response = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`
          }
        });
        
        if (response.data.success) {
          setUser(response.data.data);
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: RegisterForm): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Criar perfil do usuário no backend
        const response = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          nome: formData.nome,
          telefone: formData.telefone,
          cpf: formData.cpf,
          role: formData.role || 'user'
        });
        
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
