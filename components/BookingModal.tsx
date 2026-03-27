
import React, { useState } from 'react';
import { getWhatsAppLeadUrl, Location } from '../utils/whatsapp';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceTitle?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, serviceTitle }) => {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: 'Bogotá' as Location,
        reason: serviceTitle || ''
    });

    if (!isOpen) return null;

    // Simple Calendar Logic
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: (firstDayOfMonth + 6) % 7 }, (_, i) => i); // Adjusted for Monday start

    const handleDateClick = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        if (date < new Date(today.setHours(0, 0, 0, 0))) return; // Disable past dates
        setSelectedDate(date);
        setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) return;

        const dateStr = selectedDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const whatsappUrl = getWhatsAppLeadUrl({
            location: formData.location,
            serviceTitle: formData.reason,
            customMessage: `Quiero agendar cita -- Fecha: ${dateStr} -- Cliente: ${formData.name} -- Tel: ${formData.phone}`
        });

        window.open(whatsappUrl, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Agendar Valoración</h2>
                            <p className="text-slate-500 text-sm">Paso {step} de 2</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {step === 1 ? (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</span>
                                Seleccione una fecha disponible
                            </h3>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="text-center font-bold text-slate-900 mb-6 uppercase tracking-widest text-sm">
                                    {today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </div>

                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
                                        <div key={d} className="text-center text-tiny font-bold text-slate-400 uppercase">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {blanks.map(i => <div key={`b-${i}`}></div>)}
                                    {days.map(day => {
                                        const date = new Date(currentYear, currentMonth, day);
                                        const isToday = day === today.getDate();
                                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                        const isSelected = selectedDate?.getDate() === day;

                                        return (
                                            <button
                                                key={day}
                                                disabled={isPast}
                                                onClick={() => handleDateClick(day)}
                                                className={`
                          aspect-square rounded-xl text-sm font-bold transition-all
                          ${isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:scale-110'}
                          ${isToday && !isSelected ? 'text-emerald-600 ring-2 ring-emerald-600 ring-offset-2' : ''}
                          ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-700 hover:bg-emerald-50'}
                        `}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <p className="text-tiny text-slate-400 text-center mt-6 uppercase tracking-tighter">
                                * Para urgencias o citas el mismo día, llámenos directamente.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">2</span>
                                Sus datos de contacto
                            </h3>

                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 mb-6">
                                <div className="text-emerald-600 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <p className="text-sm font-bold text-emerald-800">
                                    Fecha elegida: <span className="underline">{selectedDate?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="ml-auto text-xs font-bold text-emerald-600 hover:underline"
                                >
                                    Cambiar
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Nombre Completo</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Juan Pérez"
                                        className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+57 300 ..."
                                        className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Sede de Atención</label>
                                    <select
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value as Location })}
                                        className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm appearance-none"
                                    >
                                        <option value="Bogotá">Sede Bogotá</option>
                                        <option value="Villavicencio">Sede Villavicencio</option>
                                        <option value="Pereira">Sede Pereira</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Díganos el motivo (opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Ej: Sueroterapia Detox"
                                        className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                Confirmar por WhatsApp
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
