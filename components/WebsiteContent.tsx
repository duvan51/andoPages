
import React from 'react';
import Hero from './Hero';
import Services from './Services';
import SpecialOffers from './SpecialOffers';
import TrustSection from './TrustSection';
import SpecializedTreatments from './SpecializedTreatments';
import Locations from './Locations';
import FashionHero from './FashionHero';
import FashionCollections from './FashionCollections';
import FashionCollage from './FashionCollage';
import ContactForm from './ContactForm';
import { useTenant } from '../hooks/useTenant';

interface WebsiteContentProps {
    onServiceSelect?: (id: string) => void;
    onGoToServices?: () => void;
    isPreview?: boolean;
}

const WebsiteContent: React.FC<WebsiteContentProps> = ({
    onServiceSelect = () => { },
    onGoToServices = () => { },
    isPreview = false
}) => {
    const { tenant } = useTenant();

    return (
        <div className={`transition-all duration-500 ${tenant?.template_id === 'medical-dark' ? 'bg-slate-950 text-white' :
            tenant?.template_id === 'fashion-vintage' ? 'bg-[#fcf8f2]' :
                tenant?.template_id === 'services-tech' ? 'bg-[#0a0c10] text-white' : 'bg-white'
            }`}
        >
            {/* HERO SECTION */}
            <section id="home">
                {tenant?.business_type === 'fashion' ? (
                    <FashionHero onShopClick={() => {
                        if (isPreview) return;
                        document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
                    }} />
                ) : (
                    <Hero onServiceSelect={onServiceSelect} onTreatmentsClick={onGoToServices} />
                )}
            </section>

            {/* MAIN CONTENT BASED ON TEMPLATE */}
            {(tenant?.template_id === 'medical-modern' || tenant?.template_id === 'medical-dark') && (
                <>
                    <section id="servicios">
                        <Services onServiceSelect={onServiceSelect} onShowAll={onGoToServices} />
                    </section>
                    <SpecialOffers onServiceSelect={onServiceSelect} />
                    <TrustSection />
                    <section id="tratamientos">
                        <SpecializedTreatments onServiceSelect={onServiceSelect} onShowAll={onGoToServices} />
                    </section>

                </>
            )}

            {(tenant?.template_id === 'fashion-luxury' || tenant?.template_id === 'fashion-streetwear' || tenant?.template_id === 'fashion-vintage') && (
                <>
                    <section id="inventory">
                        <FashionCollections onSelect={onServiceSelect} />
                    </section>
                    <FashionCollage />
                    <SpecialOffers onServiceSelect={onServiceSelect} />
                </>
            )}

            {(tenant?.template_id === 'services-clean' || tenant?.template_id === 'services-tech') && (
                <>
                    <section id="servicios">
                        <Services onServiceSelect={onServiceSelect} onShowAll={onGoToServices} />
                    </section>
                    <TrustSection />
                </>
            )}

            {tenant?.business_type === 'fitness' && (
                <>
                    <section id="servicios">
                        <Services onServiceSelect={onServiceSelect} onShowAll={onGoToServices} />
                    </section>
                    <section id="tratamientos">
                        <SpecializedTreatments onServiceSelect={onServiceSelect} onShowAll={onGoToServices} />
                    </section>
                </>
            )}

            {tenant?.config?.showLocations !== false && (
                <section id="sedes">
                    <Locations />
                </section>
            )}

            {/* CONTACT SECTION - COMÚN A TODOS */}
            <section id="contacto" className={`py-24 ${tenant?.template_id === 'medical-dark' || tenant?.template_id === 'services-tech' ? 'bg-slate-900 border-t border-white/5' : 'bg-white'}`}>
                <ContactForm />
            </section>
        </div>
    );
};

export default WebsiteContent;
