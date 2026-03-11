
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

const App: React.FC = () => {
  const { tenant, isMainDomain, isLoading: isTenantLoading, isError: isTenantError } = useTenant();
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'service-detail' | 'admin' | 'landing'>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [landingSlug, setLandingSlug] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    // Detect #admin in URL
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // If we see an access token from Supabase anywhere in the hash
      if (hash.includes('access_token=') || hash === '#admin' || hash.startsWith('#admin&')) {
        setCurrentView('admin');
      } else if (hash.startsWith('#landing/')) {
        const slug = hash.replace('#landing/', '');
        setLandingSlug(slug);
        setCurrentView('landing');
      } else if (currentView === 'admin' || currentView === 'landing') {
        // ONLY reset to home if the hash is explicitly #home or empty AND 
        // it wasn't a Supabase auth redirect (which contains access_token)
        if (hash === '#home' || (!hash && !window.location.href.includes('access_token'))) {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    setCurrentView('service-detail');
  };

  const handleGoToServices = () => {
    setCurrentView('services');
    setSelectedServiceId(null);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
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
           <a href="https://desarrollandoando.fun" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3 rounded-2xl">Ir al Inicio</a>
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
          <SaaSLanding onLoginClick={() => {
            window.location.hash = 'admin';
            setCurrentView('admin');
          }} />
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
