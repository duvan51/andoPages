import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../hooks/useTenant';
import { formatPriceCOP } from '../../utils/format';
import { getWhatsAppLeadUrl } from '../../utils/whatsapp';

const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen, totalItems } = useCart();
  const { tenant } = useTenant();
  const isFashion = tenant?.business_type === 'fashion';

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    const itemsList = cart.map(item => {
      const variationStr = [item.selectedSize, item.selectedColor].filter(Boolean).join(' / ');
      return `- ${item.quantity}x ${item.title}${variationStr ? ` (${variationStr})` : ''} (${formatPriceCOP(item.price * item.quantity)})`;
    }).join('\n');
    const message = `Hola! Me gustaría realizar un pedido:\n\n${itemsList}\n\n*Total: ${formatPriceCOP(totalPrice)}*`;
    const whatsappUrl = getWhatsAppLeadUrl({ 
      customMessage: message,
      phoneNumber: tenant?.phone // Usamos el teléfono registrado de la empresa
    });
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[600] overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`absolute inset-y-0 right-0 max-w-full flex ${isFashion ? 'font-serif' : ''}`}>
        <div className="relative w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          
          {/* Header */}
          <div className={`px-6 py-8 border-b border-slate-100 flex items-center justify-between ${isFashion ? 'bg-slate-50' : ''}`}>
            <div className="flex items-center gap-3">
              <ShoppingBag size={24} className={isFashion ? 'text-slate-900' : 'text-emerald-600'} />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tu Carrito</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isFashion ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <ShoppingBag size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tu carrito está vacío</h3>
                  <p className="text-slate-400 text-sm">¡Agrega algo increíble para comenzar!</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className={`mt-4 px-8 py-3 rounded-xl font-bold text-sm transition-all ${isFashion ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  Explorar Tienda
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1 leading-tight mb-1">{item.title}</h4>
                          <div className="flex gap-2 mb-1">
                            {item.selectedSize && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black">{item.selectedSize}</span>}
                            {item.selectedColor && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black">{item.selectedColor}</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className={`font-black text-sm ${isFashion ? 'text-slate-900' : 'text-emerald-700'}`}>{formatPriceCOP(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Subtotal: {formatPriceCOP(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <span>Subtotal</span>
                  <span>{formatPriceCOP(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-xl">
                  <span>Total</span>
                  <span>{formatPriceCOP(totalPrice)}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic text-center pt-2">
                  * El envío se coordinará directamente por WhatsApp.
                </p>
              </div>
              
              <button 
                onClick={handleCheckout}
                className={`w-full group flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                  isFashion 
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10'
                }`}
              >
                Completar Pedido
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
