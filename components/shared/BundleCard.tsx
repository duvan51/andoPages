import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag, Clock, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatPriceCOP } from '../../utils/format';
import { getWhatsAppLeadUrl } from '../../utils/whatsapp';

export interface BundleProps {
    id: string;
    title: string;
    description: string;
    bundle_price: string;
    original_total?: string;
    imageUrl?: string;
    product_id?: string;
    expiry_date?: string;
}

interface BundleCardProps {
    offer: BundleProps;
    isFashion: boolean;
    onServiceSelect?: (id: string) => void;
}

export const BundleModal: React.FC<{ offer: BundleProps; isFashion: boolean; isOpen: boolean; onClose: () => void; onServiceSelect?: (id: string) => void }> = ({ offer, isFashion, isOpen, onClose, onServiceSelect }) => {
    if (!isOpen) return null;

    const whatsappUrl = getWhatsAppLeadUrl({ customMessage: `Hola, me interesa adquirir la oferta especial: ${offer.title}` });

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl animate-scale-in flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-20 bg-slate-100/80 hover:bg-slate-200 text-slate-800 p-3 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-sm"
                >
                    <X size={20} />
                </button>

                {offer.imageUrl && (
                    <div className="md:w-1/2 relative shrink-0 min-h-[300px] md:min-h-full flex items-center justify-center border-r border-slate-100 overflow-hidden bg-white">
                        {/* Blurred background */}
                        <div className="absolute inset-0 z-[1] bg-slate-800">
                            <img src={offer.imageUrl} className="w-full h-full object-cover opacity-70 blur-xl scale-125 saturate-150" alt="" />
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        
                        {/* Foreground Image */}
                        <img src={offer.imageUrl} className="w-full h-full object-cover md:object-contain relative z-[2] drop-shadow-2xl md:p-8" alt={offer.title} />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent md:hidden z-[3]"></div>
                        {offer.expiry_date && (
                            <div className="absolute bottom-6 left-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-amber-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg z-20">
                                <Clock size={14} />
                                <span>Válido hasta: {new Date(offer.expiry_date).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar bg-white relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className={isFashion ? 'text-slate-900' : 'text-emerald-600'} size={20} />
                        <span className={`text-xs font-black uppercase tracking-[0.2em] ${isFashion ? 'text-slate-500' : 'text-emerald-600'}`}>
                            Oferta Especial
                        </span>
                    </div>

                    <h2 className={`text-3xl md:text-4xl font-black mb-6 leading-tight ${isFashion ? 'font-serif text-slate-900' : 'text-slate-900'}`}>
                        {offer.title}
                    </h2>

                    <div className="prose prose-slate prose-sm mb-8">
                        <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                            {offer.description}
                        </p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Inversión Final</p>
                        <div className="flex items-baseline gap-4 mb-8">
                            <span className={`text-4xl md:text-5xl font-black ${isFashion ? 'text-slate-900' : 'text-emerald-600'}`}>
                                {formatPriceCOP(offer.bundle_price)}
                            </span>
                            {offer.original_total && (
                                <span className="text-xl font-bold text-slate-300 line-through">
                                    {formatPriceCOP(offer.original_total)}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`w-full flex justify-center items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] ${isFashion
                                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20'
                                    }`}
                            >
                                Adquirir ahora <ArrowRight size={20} />
                            </a>

                            {offer.product_id && onServiceSelect && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onServiceSelect(offer.product_id!);
                                    }}
                                    className="w-full flex justify-center items-center px-8 py-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    Saber más del producto
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const BundleCard: React.FC<BundleCardProps> = ({ offer, isFashion, onServiceSelect }) => {
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);

    return (
        <>
            <div
                onClick={() => setIsAppModalOpen(true)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
            >
                {offer.imageUrl && (
                    <div className="w-full aspect-square relative shrink-0 overflow-hidden bg-slate-50 border-b border-slate-50">
                        <img
                            src={offer.imageUrl}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={offer.title}
                        />
                        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm text-emerald-600 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                            <ArrowRight size={20} />
                        </div>
                        {offer.expiry_date && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-900 bg-amber-400 px-3 py-1.5 rounded-full shadow-md z-10">
                                <Clock size={10} />
                                <span>{new Date(offer.expiry_date).getDate()}/{new Date(offer.expiry_date).getMonth() + 1}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-5 md:p-6 flex flex-col flex-grow relative bg-white z-10">
                    <h3 className={`text-lg font-black mb-2 leading-tight line-clamp-2 ${isFashion ? 'font-serif' : ''}`}>{offer.title}</h3>
                    
                    <div className="mt-auto pt-4 flex flex-col">
                        {offer.original_total && (
                            <span className="text-xs font-bold text-slate-300 line-through mb-0.5">
                                {formatPriceCOP(offer.original_total)}
                            </span>
                        )}
                        <span className={`text-2xl font-black ${isFashion ? 'text-slate-900' : 'text-emerald-600'}`}>
                            {formatPriceCOP(offer.bundle_price)}
                        </span>
                    </div>
                </div>
            </div>

            <BundleModal 
                offer={offer} 
                isFashion={isFashion} 
                isOpen={isAppModalOpen} 
                onClose={() => setIsAppModalOpen(false)} 
                onServiceSelect={onServiceSelect}
            />
        </>
    );
};

export default BundleCard;
