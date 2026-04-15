
import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface SaaSHeaderProps {
    onLoginClick: () => void;
}

const SaaSHeader: React.FC<SaaSHeaderProps> = ({ onLoginClick }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Características', href: '#features' },
        { name: 'Cómo Funciona', href: '#how-it-works' },
        { name: 'Testimonios', href: '#testimonials' },
        { name: 'Planes', href: '#pricing' },
    ];

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'py-4' : 'py-6'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <nav className={`flex items-center justify-between transition-all duration-500 rounded-3xl ${
                    isScrolled 
                        ? 'glass-thick px-6 py-2 shadow-xl shadow-slate-200/50' 
                        : 'bg-transparent py-2'
                }`}>
                    {/* Logo */}
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl transition-all group-hover:bg-emerald-600 group-hover:rotate-6 shadow-lg shadow-slate-200">
                            A
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-slate-900">
                            Ando<span className="text-emerald-600">Pages</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a 
                                key={link.name} 
                                href={link.href}
                                className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button 
                            onClick={onLoginClick}
                            className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors px-4 py-2"
                        >
                            Acceso Admin
                        </button>
                        <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2 text-sm group">
                            Empezar Gratis
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-slate-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </nav>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-40 transition-all duration-500 md:hidden ${
                isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
            }`}>
                <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-2xl font-black text-slate-900 hover:text-emerald-600 transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="flex flex-col w-full gap-4 mt-8">
                        <button 
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                onLoginClick();
                            }}
                            className="w-full py-4 text-xl font-black text-slate-900 border-2 border-slate-100 rounded-2xl"
                        >
                            Acceso Admin
                        </button>
                        <button className="w-full py-4 text-xl font-black text-white bg-slate-900 rounded-2xl shadow-xl">
                            Empezar Gratis
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default SaaSHeader;
