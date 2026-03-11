import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ContactFormV2Props {
    source?: string;
    buttonStyle?: React.CSSProperties;
    onSuccess?: () => void;
    isMobilePreview?: boolean;
    buttonText?: string;
}

const ContactFormV2: React.FC<ContactFormV2Props> = ({ source = 'Landing Page', buttonStyle, onSuccess, isMobilePreview, buttonText }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Helper para clases responsivas en el editor
    const cn = (...classes: any[]) => {
        const processed = classes.filter(Boolean).join(' ');
        if (!isMobilePreview) return processed;
        return processed.split(' ')
            .filter(c => !c.startsWith('md:') && !c.startsWith('lg:') && !c.startsWith('xl:'))
            .join(' ');
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Solo números
        if (val.length <= 12) { // Límite razonable para WhatsApp incl. prefijo
            setFormData({ ...formData, phone: '+' + val });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const { error } = await supabase
                .from('leads') // Assuming there's a leads table or similar
                .insert([{
                    ...formData,
                    source,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            // Track conversion
            try {
                const sid = sessionStorage.getItem('promedid_sid') || 'unknown';
                await supabase.from('analytics_events').insert({
                    landing_id: window.location.hash.split('/')[1] || source,
                    event_type: 'click',
                    event_name: 'Lead Generated',
                    session_id: sid,
                    metadata: { source, email: formData.email }
                });
            } catch (trackErr) {
                console.warn('Analytics capture failed:', trackErr);
            }

            setStatus('success');
            setFormData({ name: '', phone: '', email: '', message: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error submitting form:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className={cn("p-6 md:p-8 rounded-[2rem] md:rounded-3xl text-center border-2 animate-scale-in")} style={{ backgroundColor: 'white', borderColor: 'var(--primary-color)' }}>
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">¡Solicitud Enviada!</h3>
                <p className="text-slate-600 font-medium italic">En breve un especialista se pondrá en contacto contigo.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input
                    required
                    type="text"
                    className={cn("w-full bg-slate-50 p-3.5 md:p-4 rounded-2xl border-2 border-transparent focus:bg-white outline-none transition-all")}
                    style={{ '--tw-border-opacity': '1', borderColor: 'transparent' } as any}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej: Juan Pérez"
                />
            </div>
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4")}>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input
                        required
                        type="tel"
                        className={cn("w-full bg-slate-50 p-3.5 md:p-4 rounded-2xl border-2 border-transparent focus:bg-white outline-none transition-all")}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="+57..."
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                        required
                        type="email"
                        className={cn("w-full bg-slate-50 p-3.5 md:p-4 rounded-2xl border-2 border-transparent focus:bg-white outline-none transition-all")}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@correo.com"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje (Opcional)</label>
                <textarea
                    rows={3}
                    className={cn("w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:bg-white outline-none transition-all resize-none")}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="¿Alguna duda o inquietud?"
                />
            </div>
            <button
                disabled={status === 'loading'}
                className={cn("w-full text-white py-5 rounded-2xl font-black transition-all shadow-xl active:scale-[0.98]")}
                style={{ ...buttonStyle, backgroundColor: 'var(--primary-color)' }}
            >
                {status === 'loading' ? 'Enviando...' : (buttonText || '🚀 Solicitar Valoración Gratuita')}
            </button>
            {status === 'error' && (
                <p className="text-red-500 text-xs text-center font-bold">Hubo un error. Inténtalo de nuevo o contáctanos por WhatsApp.</p>
            )}
        </form>
    );
};

export default ContactFormV2;
