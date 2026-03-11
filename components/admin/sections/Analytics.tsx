
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import { MousePointer2, UserCheck, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

interface AnalyticsDashboardProps {
    companyId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ companyId }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [companyId]);

    const fetchEvents = async () => {
        setIsLoading(true);
        let query = supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(200);
        if (companyId) query = query.eq('company_id', companyId);

        const { data, error } = await query;
        if (!error && data) setEvents(data);
        setIsLoading(false);
    };

    const getStats = () => {
        const views = events.filter(e => e.event_type === 'page_view').length;
        const leads = events.filter(e => e.event_type === 'lead_conversion' || e.event_type === 'whatsapp_click').length;
        const rate = views > 0 ? ((leads / views) * 100).toFixed(1) : '0';
        return { views, leads, rate };
    };

    const stats = getStats();

    return (
        <div className="space-y-8">
            <SectionHeader
                title="Rendimiento y Analíticas"
                subtitle="Monitorea el tráfico y las conversiones de tus páginas en tiempo real"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10"><TrendingUp size={64} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visualizaciones Totales</p>
                    <h3 className="text-4xl font-black text-slate-900 leading-none">{stats.views}</h3>
                    <p className="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1">
                        Últimos 200 eventos
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10"><UserCheck size={64} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leads Generados</p>
                    <h3 className="text-4xl font-black text-slate-900 leading-none">{stats.leads}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-4 italic leading-tight">Clientes interesados que contactaron</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10"><MousePointer2 size={64} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasa de Conversión</p>
                    <h3 className="text-4xl font-black text-emerald-600 leading-none">{stats.rate}%</h3>
                    <p className="text-xs font-bold text-slate-500 mt-4 italic leading-tight">Efectividad de tus landing pages</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Actividad Reciente</h3>
                    <Calendar size={18} className="text-slate-300" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Evento</th>
                                <th className="px-8 py-4">Página / Origen</th>
                                <th className="px-8 py-4">Detalles</th>
                                <th className="px-8 py-4">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {events.map((e) => (
                                <tr key={e.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${e.event_type === 'page_view' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {e.event_type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-bold text-slate-600">{e.page_slug || 'Landing Home'}</td>
                                    <td className="px-8 py-4 text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{JSON.stringify(e.metadata)}</td>
                                    <td className="px-8 py-4 text-xs font-bold text-slate-400">{new Date(e.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {events.length === 0 && !isLoading && (
                        <div className="p-20 text-center">
                            <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-500 font-bold">No hay eventos registrados aún</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
