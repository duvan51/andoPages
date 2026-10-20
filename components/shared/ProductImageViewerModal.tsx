import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Move, 
  ChevronLeft, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface ProductImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle?: string;
}

export const ProductImageViewerModal: React.FC<ProductImageViewerModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPan, setInitialPan] = useState({ x: 0, y: 0 });
  
  // Modo Lupa (Lente flotante)
  const [lupaMode, setLupaMode] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensNorm, setLensNorm] = useState({ x: 0, y: 0 }); // % dentro de la imagen
  const [isLensActive, setIsLensActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Soporte Pinch-to-zoom
  const touchDistanceRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sincronizar índice inicial y reiniciar zoom al abrir o cambiar imagen
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
      resetZoom();
      setIsLensActive(false);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    resetZoom();
    setIsLensActive(false);
  }, [currentIndex]);

  // Manejo de teclado (Esc para salir, Flechas para cambiar imagen)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        nextImage();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        prevImage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, zoom]);

  // Evitar scroll en el body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const currentImageUrl = images[currentIndex] || images[0];

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const nextZoom = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const toggleDoubleTapZoom = (clientX?: number, clientY?: number) => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2.5);
      if (clientX !== undefined && clientY !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = (clientX - (rect.left + rect.width / 2)) * -1.5;
        const offsetY = (clientY - (rect.top + rect.height / 2)) * -1.5;
        setPan({ x: offsetX, y: offsetY });
      }
    }
  };

  // --- MOUSE WHEEL ZOOM ---
  const handleWheel = (e: React.WheelEvent) => {
    if (lupaMode) return;
    e.preventDefault();
    const delta = e.deltaY * -0.003;
    setZoom((prev) => {
      const next = Math.min(4, Math.max(1, Number((prev + delta).toFixed(2))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // --- DRAG / PAN MOUSE ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (lupaMode) return;
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPan({ x: pan.x, y: pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Si estamos en modo Lupa
    if (lupaMode && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const relX = x - rect.left;
      const relY = y - rect.top;

      if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
        setIsLensActive(true);
        setLensPos({ x, y });
        setLensNorm({
          x: relX / rect.width,
          y: relY / rect.height
        });
      } else {
        setIsLensActive(false);
      }
      return;
    }

    // Modo Drag / Pan normal
    if (!isDragging || zoom <= 1) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setPan({
      x: initialPan.x + deltaX,
      y: initialPan.y + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- TOUCH SUPPORT (PINCH TO ZOOM & SWIPE & LUPA TÁCTIL) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouchDevice(true);

    if (e.touches.length === 2) {
      // Dos dedos: Pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
      initialPinchZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      if (lupaMode && imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        const relX = touch.clientX - rect.left;
        const relY = touch.clientY - rect.top;

        if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
          setIsLensActive(true);
          setLensPos({ x: touch.clientX, y: touch.clientY });
          setLensNorm({
            x: relX / rect.width,
            y: relY / rect.height
          });
        }
        return;
      }

      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        setInitialPan({ x: pan.x, y: pan.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      // Pinch to zoom
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchDistanceRef.current;
      const nextZoom = Math.min(4, Math.max(1, Number((initialPinchZoomRef.current * scale).toFixed(2))));
      setZoom(nextZoom);
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];

      if (lupaMode && imgRef.current) {
        e.preventDefault();
        const rect = imgRef.current.getBoundingClientRect();
        const relX = touch.clientX - rect.left;
        const relY = touch.clientY - rect.top;

        if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
          setIsLensActive(true);
          setLensPos({ x: touch.clientX, y: touch.clientY });
          setLensNorm({
            x: relX / rect.width,
            y: relY / rect.height
          });
        } else {
          setIsLensActive(false);
        }
        return;
      }

      if (isDragging && zoom > 1) {
        e.preventDefault();
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;
        setPan({
          x: initialPan.x + deltaX,
          y: initialPan.y + deltaY
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      setIsLensActive(false);

      // Swipe para cambiar de imagen (solo si zoom === 1 y no estamos en modo lupa)
      if (zoom === 1 && !lupaMode && touchStartPosRef.current && images.length > 1) {
        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStartPosRef.current.x;
        const diffY = touch.clientY - touchStartPosRef.current.y;

        // Deslizamiento horizontal significativo
        if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
          if (diffX < 0) {
            nextImage();
          } else {
            prevImage();
          }
        }
      }
      touchStartPosRef.current = null;
    }
  };

  // Medidas de la lente de lupa
  const lensSize = isTouchDevice ? 170 : 210;
  const lensRadius = lensSize / 2;
  const lupaZoomFactor = 2.8;

  const imgRect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
      onWheel={handleWheel}
    >
      {/* Fondo difuminado dinámico con los colores de la foto */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 pointer-events-none scale-125"
        style={{ backgroundImage: `url(${currentImageUrl})` }}
        aria-hidden="true"
      />

      {/* --- TOP BAR (HEADER) --- */}
      <header className="relative z-50 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-slate-950/60 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div className="flex flex-col min-w-0">
            {productTitle && (
              <h3 className="text-white font-extrabold text-sm md:text-base truncate max-w-[200px] md:max-w-md">
                {productTitle}
              </h3>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-semibold text-white">
                Foto {currentIndex + 1} de {images.length}
              </span>
              {zoom > 1 && !lupaMode && (
                <span className="text-emerald-400 font-bold hidden sm:inline">
                  Zoom {Math.round(zoom * 100)}%
                </span>
              )}
              {lupaMode && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Search size={12} /> Lupa Activa ({lupaZoomFactor}x)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar de Controles */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Botón Selector: Modo Lupa vs Modo Zoom & Drag */}
          <button
            onClick={() => {
              setLupaMode((prev) => !prev);
              resetZoom();
              setIsLensActive(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              lupaMode 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-emerald-500/20' 
                : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            }`}
            title="Activar o desactivar lupa de aumento"
          >
            <Search size={14} />
            <span className="hidden sm:inline">{lupaMode ? 'Lupa Activada' : 'Modo Lupa'}</span>
          </button>

          {/* Controles de Zoom tradicional (cuando NO está en lupa) */}
          {!lupaMode && (
            <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/10">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-1.5 text-white hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-white transition-colors"
                title="Alejar (-)"
              >
                <ZoomOut size={16} />
              </button>

              <button
                onClick={resetZoom}
                disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
                className="px-2 text-[11px] font-bold text-slate-300 hover:text-white disabled:opacity-50 transition-colors"
                title="Restablecer tamaño (1x)"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="p-1.5 text-white hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-white transition-colors"
                title="Acercar (+)"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          )}

          {/* Botón de Reset si se ha movido o hecho zoom */}
          {(zoom > 1 || pan.x !== 0 || pan.y !== 0) && !lupaMode && (
            <button
              onClick={resetZoom}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden sm:flex"
              title="Restablecer vista"
            >
              <RotateCcw size={16} />
            </button>
          )}

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="p-2 md:p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-full transition-all border border-white/10 shadow-lg ml-1"
            title="Cerrar (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* --- ÁREA PRINCIPAL DE LA IMAGEN --- */}
      <main 
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 md:p-6 cursor-default"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={(e) => {
          if (!lupaMode) {
            toggleDoubleTapZoom(e.clientX, e.clientY);
          }
        }}
      >
        {/* Contenedor de la Imagen con Zoom y Pan */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: !lupaMode ? `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` : 'none',
            cursor: lupaMode 
              ? 'crosshair' 
              : zoom > 1 
                ? (isDragging ? 'grabbing' : 'grab') 
                : 'zoom-in',
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
        >
          <img
            ref={imgRef}
            src={currentImageUrl}
            alt={productTitle || 'Producto'}
            draggable={false}
            className="max-h-[72vh] md:max-h-[78vh] max-w-[95vw] md:max-w-[85vw] object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl select-none pointer-events-auto"
          />
        </div>

        {/* --- LENTE DE LUPA FLOTANTE (PRECISION MAGNIFIER) --- */}
        {lupaMode && isLensActive && imgRect && (
          <div
            className="fixed pointer-events-none rounded-full border-2 border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.4)] overflow-hidden z-[10001] bg-slate-950 animate-scale-in"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `${lensPos.x - lensRadius}px`,
              top: `${lensPos.y - lensRadius - (isTouchDevice ? 75 : 0)}px`,
            }}
          >
            {/* Imagen ampliada dentro de la lente de la lupa */}
            <img
              src={currentImageUrl}
              alt="Lupa de alta definición"
              className="absolute max-w-none pointer-events-none"
              style={{
                width: `${imgRect.width * lupaZoomFactor}px`,
                height: `${imgRect.height * lupaZoomFactor}px`,
                left: `${-((lensNorm.x * imgRect.width) * lupaZoomFactor - lensRadius)}px`,
                top: `${-((lensNorm.y * imgRect.height) * lupaZoomFactor - lensRadius)}px`,
              }}
            />
            
            {/* Reflejos de cristal y punto de mira de la lupa */}
            <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-emerald-400/70 rounded-full pointer-events-none flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            </div>
            
            {/* Brillo diagonal de lente realista */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>
        )}

        {/* Flechas de Navegación fijas a los costados para desktop y tablets */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/10 shadow-xl z-40 group"
              title="Foto anterior (←)"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/10 shadow-xl z-40 group"
              title="Siguiente foto (→)"
            >
              <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </main>

      {/* --- FOOTER: MINIATURAS E INSTRUCCIONES --- */}
      <footer className="relative z-50 px-4 py-3 bg-slate-950/70 backdrop-blur-lg border-t border-white/10 flex flex-col items-center gap-2">
        {/* Tira de Miniaturas (si hay más de 1 imagen) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-900 ${
                  currentIndex === idx 
                    ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20' 
                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Miniatura ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Guía contextual amigable para el cliente */}
        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
          {lupaMode ? (
            <span>🔍 Desplaza el dedo o ratón sobre la prenda/producto para inspeccionar cada detalle</span>
          ) : (
            <span>💡 Haz doble clic, pellizca con dos dedos o usa la rueda para acercar y alejar</span>
          )}
        </div>
      </footer>
    </div>,
    document.body
  );
};

export default ProductImageViewerModal;
