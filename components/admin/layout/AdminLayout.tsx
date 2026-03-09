import React from 'react';
import Sidebar, { AdminTab } from './Sidebar';
import { ExternalLink, Eye } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    onLogout: () => void;
    companyName?: string;
    isSuperAdmin?: boolean;
    previewUrl?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    activeTab,
    setActiveTab,
    onLogout,
    companyName,
    isSuperAdmin,
    previewUrl
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                companyName={companyName}
                isSuperAdmin={isSuperAdmin}
            />

            <main className="flex-grow flex flex-col h-screen overflow-hidden">
                {/* Top Navbar Placeholder */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Panel de Control</h1>
                        <span className="text-slate-200">/</span>
                        <h2 className="text-sm font-black text-slate-800 uppercase">
                            {activeTab === 'products' && 'Productos y Servicios'}
                            {activeTab === 'landings' && 'Páginas Landing'}
                            {activeTab === 'media' && 'Biblioteca Media'}
                            {activeTab === 'analytics' && 'Analíticas'}
                            {activeTab === 'locations' && 'Sedes'}
                            {activeTab === 'packages' && 'Paquetes'}
                            {activeTab === 'companies' && 'Gestión de Empresas'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {previewUrl && (
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                            >
                                <Eye size={14} /> Vista Previa <ExternalLink size={12} />
                            </a>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-600 uppercase">Conectado a Supabase</span>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content area */}
                <div className="flex-grow overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
