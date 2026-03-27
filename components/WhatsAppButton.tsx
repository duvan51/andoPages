import React, { useState } from 'react';
import LocationSelectorModal from './LocationSelectorModal';

const WhatsAppButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-[100] group"
      >
        <div className="absolute -inset-2 bg-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative flex items-center gap-3 bg-white text-emerald-600 px-6 py-4 rounded-full shadow-2xl border border-emerald-50 hover:bg-emerald-50 transition-all active:scale-95">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.125 1.379 4.77 1.38 5.42 0 9.831-4.412 9.833-9.834.001-2.628-1.023-5.1-2.885-6.963-1.862-1.861-4.334-2.885-6.963-2.886-5.422 0-9.835 4.413-9.837 9.835-.001 1.734.457 3.422 1.32 4.904l-.991 3.621 3.71-.973zm11.367-7.335c-.31-.155-1.837-.906-2.121-1.01-.283-.103-.49-.155-.693.155-.203.311-.789 1.01-.967 1.216-.178.207-.356.233-.666.078-.31-.155-1.308-.482-2.492-1.538-.92-.821-1.541-1.835-1.721-2.145-.18-.311-.019-.479.136-.633.139-.139.31-.362.466-.543.155-.181.207-.311.311-.518.103-.207.052-.389-.026-.544-.078-.155-.693-1.671-.949-2.292-.25-.6-.523-.518-.72-.529-.18-.01-.389-.012-.596-.012-.207 0-.544.078-.828.389-.283.311-1.082 1.059-1.082 2.583 0 1.524 1.109 2.997 1.264 3.204.155.207 2.181 3.329 5.283 4.667.738.318 1.314.507 1.762.649.742.236 1.417.203 1.95.123.593-.088 1.837-.751 2.095-1.476.258-.725.258-1.346.181-1.476-.078-.13-.284-.207-.594-.362z" />
            </svg>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Escríbanos</p>
            <p className="text-sm font-black text-slate-900 leading-none">WhatsApp Médicos</p>
          </div>
        </div>
      </button>

      <LocationSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default WhatsAppButton;
