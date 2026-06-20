import React, { useState } from 'react';
import { useTenant } from '../hooks/useTenant';
import { supabase } from '../lib/supabase';
import { MessageSquare } from 'lucide-react';

const ContactForm: React.FC = () => {
  const { tenant } = useTenant();
  const config = (tenant as any)?.config || {};
  const contact = config.contact || {};
  const isDark = tenant?.template_id === 'medical-dark' || tenant?.template_id === 'services-tech';
  const isTech = tenant?.template_id === 'services-tech';
  const isFashion = tenant?.business_type === 'fashion';
  const isFashionLuxury = tenant?.template_id === 'fashion-luxury';
  
  const accentColor = isTech ? 'text-cyan-400' : isDark ? 'text-amber-500' : 'text-emerald-600';
  const accentBg = isTech ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20' : isDark ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30';
  const accentText = isTech ? 'text-cyan-400' : isDark ? 'text-amber-500' : 'text-emerald-600';
  const labelText = isFashion ? 'Asesoría de Moda' : isTech ? 'Soporte Técnico' : 'Atención WhatsApp';
  const accentIcon = isTech ? 'bg-white/5 text-cyan-400' : isDark ? 'bg-white/5 text-amber-500' : 'bg-emerald-50 text-emerald-600';

  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const saveLead = async (leadData: any) => {
    setStatus('loading');
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...leadData,
          company_id: tenant?.id,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      setStatus('success');
      return true;
    } catch (err) {
      console.error('Error al guardar lead:', err);
      setStatus('error');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.querySelector('input[placeholder="Juan Pérez"]') as HTMLInputElement;
    const phoneInput = form.querySelector('input[placeholder="+57 300 123 4567"]') as HTMLInputElement;
    const citySelect = form.querySelector('#contact-city') as HTMLSelectElement;
    const reasonTextArea = form.querySelector('textarea') as HTMLTextAreaElement;

    const name = nameInput?.value || '';
    const phone = phoneInput?.value || '';
    const city = citySelect?.value || 'Bogotá';
    const reason = reasonTextArea?.value || '';

    const saved = await saveLead({
        name,
        phone,
        email: 'N/A',
        message: `Interesado en sede: ${city}. Mensaje: ${reason}`,
        source: 'Formulario de Contacto Principal'
    });

    if (saved) {
        const message = `Hola, mi nombre es ${name}, mi teléfono es ${phone}. Estoy interesado en la sede de ${city}. Motivo: ${reason}`;
        const url = `https://wa.me/${contact.phone || '573000000000'}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        form.reset();
    }
  };

  const formConfig = config.forms || {};
  const formType = formConfig.type || (isFashionLuxury ? 'newsletter' : 'contact');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formConfig.showTerms !== false && !acceptedTerms) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }
    
    await saveLead({
        email: email,
        name: 'Newsletter Subscriber',
        phone: 'N/A',
        message: formConfig.message || `Suscripción desde formulario Newsletter (${tenant?.name})`,
        source: 'Website Newsletter'
    });
    
    if (status === 'success') {
        setEmail('');
    }
  };

  if (formType === 'newsletter') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12 text-center">
          {status === 'success' ? (
            <div className="py-10 animate-scale-in">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h4 className="text-2xl font-serif text-slate-900 mb-2">¡Completado!</h4>
              <p className="text-slate-500 text-sm">Pronto recibirás nuestras novedades en tu correo.</p>
              <button onClick={() => setStatus('idle')} className="mt-8 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors underline underline-offset-4">Suscribir otro correo</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isFashion ? 'text-slate-400' : accentText}`}>
                  {formConfig.subtitle || 'Newsletter'}
                </h2>
                <h3 className={`text-3xl md:text-4xl leading-tight ${isFashion ? 'font-serif text-slate-900' : 'font-black text-slate-900'}`}>
                  {formConfig.title || (isFashion ? 'Únete al Círculo Privado' : 'Suscríbete para Novedades')}
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  {isFashion ? 'Descubre antes que nadie las nuevas colecciones y eventos exclusivos.' : 'Recibe las mejores ofertas y avisos importantes directamente en tu correo.'}
                </p>
              </div>
              
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-5">
                <div className="relative group">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900/10 rounded-2xl p-4 text-sm font-bold outline-none transition-all text-center"
                  />
                </div>
                
                {formConfig.showTerms !== false && (
                  <div className="flex items-center justify-center gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                    />
                    <label htmlFor="terms" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider cursor-pointer select-none">
                      Acepto términos y condiciones
                    </label>
                  </div>
                )}

                <button 
                  disabled={status === 'loading'}
                  type="submit" 
                  className={`w-full text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''} ${isFashion ? 'bg-slate-900 hover:bg-black' : accentBg}`}
                >
                  {status === 'loading' ? 'ESPERA...' : (formConfig.buttonText || 'SUSCRIBIRME AHORA')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
                
                {status === 'error' && (
                  <p className="text-red-500 text-[10px] text-center font-black uppercase">Ocurrió un error. Inténtalo de nuevo.</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (formType === 'whatsapp') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className={`text-sm font-black uppercase tracking-widest ${accentText}`}>
              {formConfig.subtitle || 'Contacto Inmediato'}
            </h2>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {isFashion ? 'Nuestra' : isTech ? 'Nuestra' : 'Tratamientos'} <br className="hidden md:block" /> {isFashion ? 'Selección' : isTech ? 'Metodología' : 'Avanzados'}
            </h2>
            <p className="text-slate-500 font-bold leading-relaxed">
                {isFashion ? 'Diseños exclusivos que definen tu estilo y elevan tu presencia en cada ocasión.' :
                 isTech ? 'Soluciones innovadoras diseñadas para escalar su negocio y optimizar sus procesos.' :
                 'Ciencia aplicada a la medicina alternativa para recuperar su salud de forma natural.'}
            </p>
          </div>
          <button 
            onClick={() => {
              const msg = `Hola, vengo de la web de ${tenant?.name}. Necesito información.`;
              window.open(`https://wa.me/${contact.phone || '573000000000'}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            className="inline-flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare size={24} />
            {formConfig.buttonText || 'HABLAR POR WHATSAPP'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${accentText}`}>
              {formConfig.subtitle || (isTech ? 'Impulse su Transformación' : isFashion ? 'Contáctanos' : 'Hablemos de su Salud')}
            </h2>
            <h3 className={`text-4xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formConfig.title || (isTech ? 'Transforme sus ideas en software de alto impacto' : isFashion ? 'Estamos aquí para ayudarte' : 'Agende su primera cita de renovación')}
            </h3>
            <p className="text-lg text-slate-500 max-w-lg">
              {isTech 
                ? 'Complete el formulario y uno de nuestros ingenieros senior se contactará con usted para analizar sus requerimientos técnicos y proponerle la mejor solución de software.'
                : isFashion ? 'Complete el formulario y uno de nuestros asesores expertos se contactará con usted para brindarle una asesoría personalizada.'
          : 'Complete el formulario y uno de nuestros asesores especializados se contactará con usted para brindarle la información que necesita.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentIcon}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <div>
                <h5 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{isTech ? 'Línea de Proyectos' : isFashion ? 'Atención al Cliente' : 'Atención Telefónica'}</h5>
                <p className="text-slate-500 text-sm">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                <p className={`font-bold ${accentText}`}>{contact.phone || '+57 300 000 0000'}</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentIcon}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h5 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Contacto Comercial</h5>
                <p className="text-slate-500 text-sm">Consultas privadas y licitaciones</p>
                <p className={`font-bold ${accentText}`}>{contact.email || `proyectos@${tenant?.slug || 'software'}.com`}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-50'} p-8 md:p-10 rounded-[2.5rem] shadow-2xl border`}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className={`text-sm font-bold ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nombre Completo</label>
                <input
                  required
                  type="text"
                  placeholder="Juan Pérez"
                  className={`w-full px-5 py-4 border-transparent focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white' : 'bg-slate-50'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-bold ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Teléfono / WhatsApp</label>
                <input
                  required
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className={`w-full px-5 py-4 border-transparent focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white' : 'bg-slate-50'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sede de Interés</label>
              <select className={`w-full px-5 py-4 border-transparent focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all appearance-none ${isDark ? 'bg-white/5 text-white' : 'bg-slate-50'}`} id="contact-city">
                <option>Bogotá</option>
                <option>Villavicencio</option>
                <option>Pereira</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isTech ? 'Requerimientos del Proyecto' : 'Motivo de consulta'}
              </label>
              <textarea
                rows={4}
                placeholder={isTech 
                  ? 'Cuéntenos sobre sus desafíos técnicos, el tipo de solución que busca o el alcance del proyecto...' 
                  : isFashion ? 'Nuestros asesores están listos para ayudarle a elegir el look perfecto para usted.' :
                 isTech ? 'Nuestros expertos están listos para diseñar una solución a su medida.' :
                 'Nuestros especialistas están listos para diseñar un plan de tratamiento único para usted.'}
                className={`w-full px-5 py-4 border-transparent focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white' : 'bg-slate-50'}`}
              ></textarea>
            </div>

            <button type="submit" className={`w-full text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${accentBg}`}>
              {formConfig.buttonText || (isTech ? 'Solicitar Consultoría Técnica' : 'Enviar Solicitud')}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            {formConfig.showTerms !== false && (
              <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-tighter">
                Al enviar este formulario acepta nuestra política de tratamiento de datos personales de acuerdo con la Ley 1581 de 2012.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
