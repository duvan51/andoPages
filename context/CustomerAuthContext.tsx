import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  points: number;
  tier: 'Bronce' | 'Plata' | 'Oro';
  company_id?: string;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_LOCAL_STORAGE_KEY = 'promedid_customer_session';

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const [customer, setCustomer] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const fetchProfile = async (userId: string, authUser?: any) => {
    try {
      // 1. Intentar consultar tabla customers
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        const prof: CustomerProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone || '',
          points: data.points ?? 50,
          tier: data.tier || 'Bronce',
          company_id: data.company_id || tenant?.id,
        };
        setCustomer(prof);
        localStorage.setItem(CUSTOMER_LOCAL_STORAGE_KEY, JSON.stringify(prof));
        return;
      }

      // 2. Si la tabla aún no existe o está vacía, construir desde user_metadata
      const meta = authUser?.user_metadata || {};
      const fallbackProf: CustomerProfile = {
        id: userId,
        email: authUser?.email || '',
        full_name: meta.full_name || authUser?.email?.split('@')[0] || 'Cliente VIP',
        phone: meta.phone || '',
        points: meta.points ?? 50,
        tier: meta.tier || 'Bronce',
        company_id: meta.company_id || tenant?.id,
      };
      setCustomer(fallbackProf);
      localStorage.setItem(CUSTOMER_LOCAL_STORAGE_KEY, JSON.stringify(fallbackProf));
    } catch (e) {
      console.log('Error obteniendo perfil de cliente:', e);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // Solo considerar cliente si no es el superadmin
        if (session?.user && session.user.email !== 'aponteramirezduvan@gmail.com') {
          await fetchProfile(session.user.id, session.user);
        }
      } catch (err) {
        console.error('Error al iniciar CustomerAuth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        if (session.user.email !== 'aponteramirezduvan@gmail.com') {
          await fetchProfile(session.user.id, session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setCustomer(null);
        localStorage.removeItem(CUSTOMER_LOCAL_STORAGE_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [tenant?.id]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Correo o contraseña incorrectos. Verifica tus datos.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Debes confirmar tu correo electrónico antes de ingresar.';
        }
        return { success: false, error: msg };
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user);
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const cleanName = fullName.trim();
      const targetCompanyId = tenant?.id || '733b1f9a-878d-4adc-9a77-1228a3c09df7';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            company_id: targetCompanyId,
            role: 'customer',
            points: 50,
            tier: 'Bronce',
          },
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('User already registered')) {
          msg = 'Este correo electrónico ya está registrado. Por favor inicia sesión.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'La contraseña debe tener al menos 6 caracteres.';
        }
        return { success: false, error: msg };
      }

      if (data.user) {
        // Intentar upsert directo en tabla customers
        try {
          await supabase.from('customers').upsert({
            id: data.user.id,
            company_id: targetCompanyId,
            full_name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            points: 50,
            tier: 'Bronce',
          });
        } catch {}

        await fetchProfile(data.user.id, data.user);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrarse' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setCustomer(null);
      localStorage.removeItem(CUSTOMER_LOCAL_STORAGE_KEY);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.log('Error cerrando sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id, session.user);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth debe ser utilizado dentro de un CustomerAuthProvider');
  }
  return context;
};
