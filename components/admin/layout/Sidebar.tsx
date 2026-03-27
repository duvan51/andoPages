
import React from 'react';
import {
    LayoutDashboard,
    Package,
    Image as ImageIcon,
    BarChart3,
    MapPin,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    Globe,
    ShieldCheck
} from 'lucide-react';

export type AdminTab = 'products' | 'offers' | 'packages' | 'landings' | 'media' | 'analytics' | 'widgets' | 'locations' | 'companies' | 'website';

interface SidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    onLogout: () => void;
    companyName?: string;
    isSuperAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, companyName = "PROMEDID", isSuperAdmin = false }) => {
    const menuItems = [
        { id: 'website', label: 'Editor Web', icon: LayoutDashboard },
        { id: 'products', label: 'Productos y Servicios', icon: Package },
        { id: 'landings', label: 'Páginas Landing', icon: Globe },
        { id: 'media', label: 'Biblioteca Media', icon: ImageIcon },
        { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
        isSuperAdmin && { id: 'companies', label: 'Gestión de Empresas', icon: ShieldCheck },
        { id: 'locations', label: 'Sedes y Ubicaciones', icon: MapPin },
        { id: 'packages', label: 'Paquetes Especiales', icon: FileText },
    ].filter(Boolean) as { id: AdminTab, label: string, icon: any }[];

    return (
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
            {/* Header / Logo */}
            <div className="p-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                        P
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">{companyName}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Admin Panel</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Gestión Central</p>

                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as AdminTab)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${activeTab === item.id
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-600/5'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={18} className={activeTab === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
                            <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                        {activeTab === item.id && <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>}
                    </button>
                ))}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-slate-50">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut size={18} className="text-slate-400 group-hover:text-red-500" />
                    <span className="text-sm font-semibold">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
