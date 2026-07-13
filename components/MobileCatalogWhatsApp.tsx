import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { formatPriceCOP } from '../utils/format';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  ArrowLeft, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Package
} from 'lucide-react';

interface Variant {
  size: string;
  color: string;
  stock: number;
  sku?: string;
  image_url?: string;
}

interface Product {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  price: string | number;
  imageUrl?: string;
  variants?: Variant[];
  category?: string;
  active: boolean;
  sku?: string;
}

interface CartItem {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}

const getColorHex = (colorName?: string) => {
  if (!colorName) return '#cbd5e1';
  const name = colorName.toLowerCase().trim();
  const colors: Record<string, string> = {
    'negro': '#000000',
    'black': '#000000',
    'blanco': '#ffffff',
    'white': '#ffffff',
    'rojo': '#ef4444',
    'red': '#ef4444',
    'azul': '#3b82f6',
    'blue': '#3b82f6',
    'verde': '#10b981',
    'green': '#10b981',
    'amarillo': '#eab308',
    'yellow': '#eab308',
    'gris': '#6b7280',
    'gray': '#6b7280',
    'grey': '#6b7280',
    'rosa': '#ec4899',
    'pink': '#ec4899',
    'morado': '#8b5cf6',
    'purple': '#8b5cf6',
    'naranja': '#f97316',
    'orange': '#f97316',
    'marrón': '#78350f',
    'marron': '#78350f',
    'cafe': '#78350f',
    'café': '#78350f',
    'brown': '#78350f',
    'beige': '#f5f5dc',
  };
  return colors[name] || '#cbd5e1';
};

export default function MobileCatalogWhatsApp({ tenant }: { tenant: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Product Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const fetchProducts = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('company_id', tenant.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(data);
        const uniqueCats = Array.from(new Set(data.map((p: any) => p.category || 'General')));
        setCategories(uniqueCats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [tenant]);

  // Restablecer valores del detalle de variantes
  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setSelectedSize(selectedProduct.variants && selectedProduct.variants.length > 0 ? selectedProduct.variants[0].size : '');
      setSelectedColor(selectedProduct.variants && selectedProduct.variants.length > 0 ? selectedProduct.variants[0].color : '');
    }
  }, [selectedProduct]);

  // Actualizar color cuando cambia la talla seleccionada
  useEffect(() => {
    if (selectedProduct?.variants && selectedSize) {
      const firstAvailableColor = selectedProduct.variants.find(v => v.size === selectedSize)?.color || '';
      setSelectedColor(firstAvailableColor);
    }
  }, [selectedSize]);

  // Funciones de Carrito
  const addToCart = (product: Product, size?: string, color?: string) => {
    const existingIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      item.selectedSize === size && 
      item.selectedColor === color
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, selectedSize: size, selectedColor: color, quantity: 1 }]);
    }
    
    // Al agregar del grid directo o modal, cerramos el modal de detalles
    setSelectedProduct(null);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = cart.filter((_, idx) => idx !== index);
    setCart(updated);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const price = typeof item.product.price === 'string' ? parseFloat(item.product.price.replace(/[^\d]/g, '')) : item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  // Filtros Combinados
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategoryFilter || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Enviar pedido por WhatsApp
  const sendOrderToWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `*¡Hola! Me interesa realizar este pedido desde el catálogo:* \n\n`;
    
    cart.forEach(item => {
      const priceVal = typeof item.product.price === 'string' 
        ? parseFloat(item.product.price.replace(/[^\d]/g, '')) 
        : item.product.price;
      
      const variantDesc = (item.selectedSize || item.selectedColor) 
        ? `(${[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ')})` 
        : '';
        
      message += `• *${item.quantity}x* ${item.product.title} ${variantDesc} — _${formatPriceCOP(priceVal * item.quantity)}_\n`;
    });

    message += `\n*TOTAL NETO:* ${formatPriceCOP(totalPrice)}\n\n`;
    message += `Por favor, confírmame disponibilidad y métodos de pago. ¡Gracias!`;

    const cleanPhone = (tenant?.phone || '').replace(/[^\d]/g, '');
    const waPhone = cleanPhone.length === 10 && !cleanPhone.startsWith('57') ? '57' + cleanPhone : cleanPhone;
    
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#efeae2] flex flex-col font-sans relative shadow-2xl border-x border-slate-200">
      
      {/* 1. WhatsApp In-App Header */}
      <header className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-white hover:opacity-80">
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            {tenant?.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={tenant.name} 
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-lg">
                {tenant?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25d366] rounded-full border-2 border-[#075e54]"></div>
          </div>
          
          <div>
            <h1 className="text-sm font-bold truncate max-w-[180px]">{tenant?.name || 'Mi Tienda'}</h1>
            <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">En línea</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-[#25d366]/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#25d366]/30">
            <MessageCircle size={14} className="text-[#25d366]" />
            <span className="text-[10px] text-[#25d366] font-extrabold uppercase">WhatsApp In-App</span>
          </div>
        </div>
      </header>

      {/* 2. Buscador + Filtros */}
      <div className="bg-[#f0f2f5] p-3 flex flex-col gap-2 border-b border-slate-200 sticky top-[64px] z-30">
        <div className="flex gap-2 items-center">
          <div className="bg-white flex items-center gap-2 px-3 py-2.5 rounded-2xl flex-1 shadow-sm border border-slate-100">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
            {selectedCategoryFilter && (
              <div className="bg-[#128c7e]/10 text-[#128c7e] px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                <span>{selectedCategoryFilter}</span>
                <button onClick={() => setSelectedCategoryFilter(null)} className="hover:opacity-80">
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowCategoryFilterModal(true)}
            className={`p-3 rounded-2xl shadow-sm border transition-all ${
              selectedCategoryFilter 
                ? 'bg-[#128c7e] text-white border-[#128c7e]' 
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Categorías Horizontal scroll */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                !selectedCategoryFilter
                  ? 'bg-[#128c7e] text-white border-[#128c7e]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#128c7e] text-white border-[#128c7e]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Catálogo de Productos */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#128c7e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">No se encontraron productos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((p) => {
              const price = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d]/g, '')) : p.price;
              const hasVariants = p.variants && p.variants.length > 0;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    {p.imageUrl ? (
                      <img 
                        src={p.imageUrl} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <Package size={32} />
                      </div>
                    )}
                    {hasVariants && (
                      <span className="absolute top-2 left-2 bg-[#128c7e] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                        Variantes
                      </span>
                    )}
                  </div>
                  
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-slate-800 font-black text-xs uppercase truncate mb-1">{p.title}</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">{p.category || 'General'}</p>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 mt-2">
                      <span className="text-emerald-600 font-extrabold text-sm truncate">
                        {formatPriceCOP(price)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasVariants) {
                            setSelectedProduct(p);
                          } else {
                            addToCart(p);
                          }
                        }}
                        className="bg-[#25d366] text-white p-2 rounded-2xl hover:scale-105 transition-transform shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Carrito Flotante (Boton WhatsApp) */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="absolute bottom-6 right-6 bg-[#25d366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-35 animate-bounce"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-3.5 -right-3.5 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#25d366]">
              {totalItems}
            </span>
          </div>
        </button>
      )}

      {/* --- MODAL DETALLES DEL PRODUCTO --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-800 font-black text-sm uppercase truncate flex-1 pr-4">{selectedProduct.title}</h2>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="overflow-y-auto flex-1 p-5">
              
              {/* Carrusel de Imágenes */}
              {(() => {
                const images = [
                  selectedProduct.imageUrl,
                  ...(selectedProduct.variants?.map(v => v.image_url) || [])
                ].filter((url): url is string => !!url);
                const uniqueImages = Array.from(new Set(images));
                const currentImageUrl = uniqueImages[activeImageIndex];
                
                return (
                  <div className="mb-4">
                    <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100">
                      {currentImageUrl ? (
                        <img 
                          src={currentImageUrl} 
                          alt={selectedProduct.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Package size={48} />
                        </div>
                      )}
                      
                      {uniqueImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeImageIndex === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/55 text-white p-1.5 rounded-full disabled:opacity-30"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setActiveImageIndex(prev => Math.min(uniqueImages.length - 1, prev + 1))}
                            disabled={activeImageIndex === uniqueImages.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/55 text-white p-1.5 rounded-full disabled:opacity-30"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Miniaturas en carrusel horizontal */}
                    {uniqueImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto py-2 justify-center mt-1">
                        {uniqueImages.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-12 h-12 rounded-lg overflow-hidden border-2 relative transition-all ${
                              activeImageIndex === idx ? 'border-[#128c7e]' : 'border-transparent'
                            }`}
                          >
                            <img src={url} alt="miniatura" className="w-full h-full object-cover" />
                            {activeImageIndex !== idx && (
                              <div className="absolute inset-0 bg-black/40"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Precio y Categoria */}
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{selectedProduct.category || 'General'}</span>
                <span className="text-[#128c7e] font-black text-xl">{formatPriceCOP(selectedProduct.price)}</span>
              </div>

              {selectedProduct.description && (
                <div className="mb-4">
                  <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Descripción</h4>
                  <MarkdownRenderer content={selectedProduct.description} className="text-slate-600 text-xs leading-relaxed" />
                </div>
              )}

              {/* Variantes del Producto */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Selecciona Variantes</h4>
                  
                  {/* Lista de variantes disponibles */}
                  <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    {selectedProduct.variants.map((v, idx) => {
                      const isSelected = selectedSize === v.size && selectedColor === v.color;
                      const isOutOfStock = v.stock <= 0;
                      
                      return (
                        <button
                          key={idx}
                          disabled={isOutOfStock}
                          onClick={() => {
                            setSelectedSize(v.size);
                            setSelectedColor(v.color);
                            if (v.image_url) {
                              const imgs = [
                                selectedProduct.imageUrl,
                                ...(selectedProduct.variants?.map(vr => vr.image_url) || [])
                              ].filter((url): url is string => !!url);
                              const uniqueImgs = Array.from(new Set(imgs));
                              const imgIdx = uniqueImgs.indexOf(v.image_url);
                              if (imgIdx > -1) {
                                setActiveImageIndex(imgIdx);
                              }
                            }
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                            isOutOfStock 
                              ? 'opacity-40 border-slate-200 bg-slate-100 cursor-not-allowed'
                              : isSelected
                                ? 'bg-[#128c7e]/10 border-[#128c7e] text-[#128c7e]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-slate-200/40" 
                              style={{ backgroundColor: getColorHex(v.color) }}
                            />
                            <span className="font-bold">Talla {v.size} {v.color ? `· ${v.color}` : ''}</span>
                          </div>
                          
                          <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : 'text-slate-400'}`}>
                            {isOutOfStock ? 'Agotado' : `${v.stock} disp.`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer de Modal - Boton de Añadir */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  addToCart(selectedProduct, selectedSize, selectedColor);
                }}
                className="w-full bg-[#25d366] text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-all shadow-md"
              >
                <Plus size={18} />
                Añadir al Pedido
              </button>
            </div>
          </div>
        </div>

    )}

      {/* --- DRAWER DEL CARRITO DE COMPRAS --- */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col border-t border-slate-100 shadow-2xl animate-slide-up">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#128c7e]" />
                <h2 className="text-slate-800 font-black text-sm uppercase">Detalle de tu Pedido</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-5">
              {cart.map((item, idx) => {
                const itemPrice = typeof item.product.price === 'string' 
                  ? parseFloat(item.product.price.replace(/[^\d]/g, '')) 
                  : item.product.price;
                
                return (
                  <div key={idx} className="flex gap-3 py-3 border-b border-slate-100 last:border-b-0">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-800 font-bold text-xs uppercase truncate">{item.product.title}</h4>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        {[item.selectedSize && `Talla: ${item.selectedSize}`, item.selectedColor && `Color: ${item.selectedColor}`].filter(Boolean).join(' · ')}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-emerald-600 font-extrabold text-xs">
                          {formatPriceCOP(itemPrice * item.quantity)}
                        </span>
                        
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                          <button 
                            onClick={() => updateQuantity(idx, -1)}
                            className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-600"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-slate-800 text-xs font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(idx, 1)}
                            className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-600"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(idx)}
                      className="text-red-400 hover:text-red-600 self-center p-1.5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Total and Checkout */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-slate-500 text-xs font-black uppercase">Total Estimado</span>
                <span className="text-[#128c7e] font-black text-lg">{formatPriceCOP(totalPrice)}</span>
              </div>
              
              <button
                onClick={sendOrderToWhatsApp}
                className="w-full bg-[#25d366] text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-all shadow-md"
              >
                <MessageCircle size={18} />
                Enviar Pedido por WhatsApp
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL FILTRO DE CATEGORÍAS --- */}
      {showCategoryFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-5 border border-slate-100 shadow-2xl animate-fade-in">
            <h3 className="text-slate-800 font-black text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Filtrar por Categoría
            </h3>

            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCategoryFilter(null);
                  setShowCategoryFilterModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors ${
                  !selectedCategoryFilter 
                    ? 'bg-[#128c7e]/10 text-[#128c7e]' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Todas las Categorías
              </button>
              
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategoryFilter(cat);
                    setShowCategoryFilterModal(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors ${
                    selectedCategoryFilter === cat 
                      ? 'bg-[#128c7e]/10 text-[#128c7e]' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCategoryFilterModal(false)}
              className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs uppercase transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
