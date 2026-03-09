
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
  const { tenant, isMainDomain, isLoading: isTenantLoading } = useTenant();
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'service-detail' | 'admin' | 'landing'>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [landingSlug, setLandingSlug] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    // Detect #admin in URL
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash.startsWith('#landing/')) {
        const slug = hash.replace('#landing/', '');
        setLandingSlug(slug);
        setCurrentView('landing');
      } else if (currentView === 'admin' || currentView === 'landing') {
        if (!hash || hash === '#home') {
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
