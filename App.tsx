
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { ELITE_SERVICES } from './constants/services';
import Services from './components/Services';
import TrustSection from './components/TrustSection';
import SpecializedTreatments from './components/SpecializedTreatments';
import Locations from './components/Locations';
import ContactForm from './components/ContactForm';
import ServicesPage from './components/ServicesPage';
import ServiceLanding from './components/ServiceLanding';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import BookingModal from './components/BookingModal';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import SaaSLanding from './components/SaaSLanding';
import FashionHero from './components/FashionHero';
import FashionCollections from './components/FashionCollections';
import SpecialOffers from './components/SpecialOffers';
import WebsiteContent from './components/WebsiteContent';
import { useTenant } from './hooks/useTenant';
import { supabase } from './lib/supabase'; // Importación necesaria para el auto-login

const App: React.FC = () => {
  const { tenant, isMainDomain, isLoading: isTenantLoading, isError: isTenantError } = useTenant();
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'service-detail' | 'admin' | 'landing'>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [landingSlug, setLandingSlug] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Función para navegar de forma limpia
  const navigate = (path: string, view: typeof currentView, slug: string | null = null) => {
    window.history.pushState({}, '', path);
    setCurrentView(view);
    if (slug) setLandingSlug(slug);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;


      // 1. Detectar si hay un token de Supabase (Siempre viene en el hash)
      if (hash.includes('access_token=')) {

        setCurrentView('admin');
        return;
      }

      // 2. Rutas basadas en el Pathname
      if (path === '/admin' || path === '/login') {
        setCurrentView('admin');
      } else if (path.startsWith('/landing/')) {
        const slug = path.replace('/landing/', '');
        setLandingSlug(slug);
        setCurrentView('landing');
      } else if (hash.startsWith('#treatment/')) {
        const id = hash.replace('#treatment/', '');
        setSelectedServiceId(id);
        setCurrentView('service-detail');
      } else if (path === '/' || path === '/home' || !path) {
        // ONLY reset to home if the hash is explicitly #home or empty AND 
        // it wasn't a Supabase auth redirect (which contains access_token)
        if (hash === '#home' || (!hash && !window.location.href.includes('access_token'))) {
          setCurrentView((prev) => {
            if (prev === 'admin' || prev === 'landing' || prev === 'service-detail') return 'home';
            return prev;
          });
        }
      }
    };

    // Escuchar cambios en el historial (botón atrás/adelante)
    window.addEventListener('popstate', handleNavigation);
    handleNavigation(); // Inicializar al cargar

    // AUTO-LOGIN: Detectar sesión y entrar al admin SOLO si estamos en rutas de administración o el home principal
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
            const path = window.location.pathname;
            // Si estamos en el home principal o intentando entrar al login, entramos directo al admin
            if (path === '/' || path === '/admin' || path === '/login') {
                setCurrentView('admin');
            }
        }
    });

    return () => {
        window.removeEventListener('popstate', handleNavigation);
        subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // --- SEO DINÁMICO (Modo SaaS de Verdad) ---
  useEffect(() => {
    if (tenant) {
      // 1. Título dinámico por empresa
      document.title = `${tenant.name.toUpperCase()} | Plataforma Oficial`;

      // 2. Inyectar Meta Tag de Google si el cliente tiene un código guardado
      if (tenant.seo_verification_code) {
        let metaTag = document.querySelector('meta[name="google-site-verification"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', 'google-site-verification');
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', tenant.seo_verification_code);
      }
    } else {
      document.title = "AndoPages | SaaS Inteligente";
    }
  }, [tenant]);

  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    setCurrentView('service-detail');
  };

  const handleGoToServices = () => {
    setCurrentView('services');
    setSelectedServiceId(null);
  };

  const handleBackToHome = () => {
    navigate('/', 'home');
    setSelectedServiceId(null);
  };

  if (isTenantLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isTenantError && !isMainDomain) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
           <h1 className="text-2xl font-black text-slate-900 mb-4">¡Ups!</h1>
           <p className="text-slate-600 font-semibold mb-6">No pudimos encontrar la página que buscas. Verifica el dominio o contacta a soporte.</p>
           <a href="/" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3 rounded-2xl">Ir al Inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden ${tenant?.template_id === 'medical-dark' ? 'bg-slate-950 text-white' :
        tenant?.template_id === 'fashion-vintage' ? 'bg-[#fcf8f2]' :
          tenant?.template_id === 'services-tech' ? 'bg-[#0a0c10] text-slate-100' : 'bg-white'
        }`}
      style={{ '--primary-color': tenant?.primary_color || '#10b981' } as React.CSSProperties}
    >
      {(currentView !== 'admin' && currentView !== 'landing' && !(isMainDomain && currentView === 'home')) && (
        <Header
          onHomeClick={handleBackToHome}
          onServicesClick={handleGoToServices}
          onTreatmentsClick={handleGoToServices}
          onBookingClick={() => setIsBookingOpen(true)}
        />
      )}

      <main className="flex-grow">
        {currentView === 'admin' ? (
          <AdminDashboard />
        ) : currentView === 'landing' && landingSlug ? (
          <LandingPage slug={landingSlug} />
        ) : currentView === 'service-detail' && selectedServiceId ? (
          <ServiceLanding
            serviceId={selectedServiceId}
            onBack={() => setCurrentView('services')}
          />
        ) : currentView === 'services' ? (
          <ServicesPage
            onServiceSelect={handleServiceSelect}
            onBack={handleBackToHome}
          />
        ) : isMainDomain ? (
          <SaaSLanding onLoginClick={() => navigate('/admin', 'admin')} />
        ) : (
          <WebsiteContent
            onServiceSelect={handleServiceSelect}
            onGoToServices={handleGoToServices}
          />
        )}
      </main>

      {currentView !== 'admin' && currentView !== 'landing' && !(isMainDomain && currentView === 'home') && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default App;
