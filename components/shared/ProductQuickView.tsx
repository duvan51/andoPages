import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Search } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../hooks/useTenant';
import { formatPriceCOP } from '../../utils/format';
import { getWhatsAppLeadUrl } from '../../utils/whatsapp';
import OptimizedImage from './OptimizedImage';
import MarkdownRenderer from './MarkdownRenderer';
import ProductImageViewerModal from './ProductImageViewerModal';

interface ProductQuickViewProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (id: string) => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose, onViewDetails }) => {
  const { addToCart } = useCart();
  const { tenant } = useTenant();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const isFashion = tenant?.business_type === 'fashion';
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  if (!isOpen || !product) return null;

  const variantImages = (product.variants || [])
    .map((v: any) => v.image_url)
    .filter((url: string | null): url is string => !!url);

  // Combine unique images: primary, variant images, then secondary images
  const images = Array.from(new Set([
    product.imageUrl,
    ...variantImages,
    ...(product.secondary_images || [])
  ])).filter(Boolean);

  const whatsappUrl = getWhatsAppLeadUrl({ serviceTitle: product.title });

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    if (variant.image_url) {
      const imgIndex = images.indexOf(variant.image_url);
      if (imgIndex !== -1) {
        setCurrentImageIndex(imgIndex);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price || 0,
      imageUrl: product.imageUrl,
      type: 'product',
      companyId: tenant?.id || '',
      selectedSize: selectedVariant?.size,
      selectedColor: selectedVariant?.color
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6 lg:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] md:h-[700px] animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-40 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Left: Image Carousel */}
        <div 
          onClick={() => setIsViewerOpen(true)}
          className="md:w-1/2 relative bg-slate-950 h-1/2 md:h-full group flex items-center justify-center cursor-pointer select-none"
        >
          {/* Fondo ambiental difuminado */}
          {images[currentImageIndex] && (
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
              aria-hidden="true"
            />
          )}

          <div className="w-full h-full relative flex items-center justify-center p-2">
            <OptimizedImage 
              src={images[currentImageIndex]} 
              alt={product.title} 
              objectFit="contain"
              className="w-full h-full transition-opacity duration-500 relative z-10"
            />
          </div>

          {/* Botón flotante para ver en grande con lupa */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsViewerOpen(true);
            }}
            className="absolute bottom-6 right-6 z-30 bg-slate-900/85 hover:bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            title="Ver imagen completa, acercar con zoom o usar la lupa"
          >
            <Search size={14} className="text-emerald-400" />
            <span>Ver completa / Lupa</span>
          </button>

          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <button 
                onClick={handlePrevImage}
                className="pointer-events-auto p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg hover:bg-white/20 text-white transition-all transform -translate-x-2 group-hover:translate-x-0 border border-white/10"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextImage}
                className="pointer-events-auto p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg hover:bg-white/20 text-white transition-all transform translate-x-2 group-hover:translate-x-0 border border-white/10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full z-20">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto bg-white h-1/2 md:h-full">
          <div className="mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {product.category || 'Colección'}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-6 leading-tight">
            {product.title}
          </h2>

          <div className="mb-8">
            <MarkdownRenderer content={product.description || 'Prenda exclusiva diseñada con los más altos estándares de calidad y estilo para la mujer moderna.'} className="text-slate-500 text-sm md:text-base leading-relaxed" />
          </div>

          <div className="mt-auto">
            <div className="mb-8 space-y-4">
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Opción</label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variants.map((variant: any, idx: number) => (
                      <button
                        key={idx}
                        disabled={variant.stock <= 0}
                        onClick={() => handleVariantSelect(variant)}
                        className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                          selectedVariant === variant 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                            : variant.stock <= 0 
                              ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-bold uppercase">
                          {variant.size} {variant.color && `/ ${variant.color}`}
                        </span>
                        <span className="text-[10px] font-black uppercase opacity-60">
                          {variant.stock <= 0 ? 'Agotado' : `${variant.stock} disponibles`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 flex items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-black text-slate-900">
                {formatPriceCOP(product.price)}
              </span>
              {product.original_price && (
                <span className="text-lg text-slate-300 line-through font-bold">
                  {formatPriceCOP(product.original_price)}
                </span>
              )}
            </div>

            <div className="grid gap-3">
              {isFashion && (
                <button 
                  onClick={handleAddToCart}
                  disabled={product.variants && product.variants.length > 0 && !selectedVariant}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  Agregar al carrito
                </button>
              )}

              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle size={18} />
                Comprar ahora
              </a>

              <button 
                onClick={() => {
                  onViewDetails(product.id);
                  onClose();
                }}
                className="w-full bg-transparent text-slate-400 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Ver todos los detalles <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visor Pantalla Completa con Zoom y Lupa */}
      {isViewerOpen && (
        <ProductImageViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          images={images}
          initialIndex={currentImageIndex}
          productTitle={product.title}
        />
      )}
    </div>,
    document.body
  );
};

export default ProductQuickView;
