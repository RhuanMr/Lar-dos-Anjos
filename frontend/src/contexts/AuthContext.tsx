import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const checkingAuth = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedProject');
  }, []);

  useEffect(() => {
    // Verificar token no localStorage ao carregar
    const checkAuth = async () => {
      // Evitar múltiplas chamadas simultâneas
      if (checkingAuth.current) {
        return;
      }

      checkingAuth.current = true;
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verificar se token ainda é válido
          await authService.verify();
          // Token válido
          setLoading(false);
        } catch (error: any) {
          // Tratar erro 429 (Too Many Requests) - não limpar token, apenas aguardar
          if (error.response?.status === 429) {
            console.warn('Muitas requisições. Aguardando...');
            // Manter dados mas marcar como não autenticado temporariamente
            setUser(null);
            setToken(null);
            setLoading(false);
          } else if (!error.response) {
            // Erro de rede - manter dados mas não autenticado
            setUser(null);
            setToken(null);
            setLoading(false);
          } else {
            // Token inválido ou outro erro - limpar tudo
            logout();
          }
        }
      } else {
        setLoading(false);
      }
      
      checkingAuth.current = false;
    };

    checkAuth();
  }, [logout]);

  const login = async (email: string, senha: string) => {
    try {
      const response = await authService.login(email, senha);
      const { usuario, token: newToken } = response.data.data;

      setUser(usuario);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
    } catch (error: any) {
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  const updateUser = (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        hasRole,
        loading,
        setUser: updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

