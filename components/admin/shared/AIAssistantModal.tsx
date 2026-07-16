import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  Plus, 
  Trash2, 
  DollarSign, 
  ArrowRight,
  Brain,
  MessageCircle,
  Undo,
  Settings
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { analyzeProductWithAI, getAIConfig, saveAIConfig, ChatMessage, GeminiProductResponse } from '../../../utils/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  categories: any[];
}

interface UIMessage {
  role: 'user' | 'model';
  text?: string;
  imageUrl?: string;
  isError?: boolean;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  categories
}) => {
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      role: 'model',
      text: '¡Hola! Soy tu Asistente de Catálogo IA. 🤖✨\n\nPuedes subir una foto de un producto, describirlo con tus palabras o ambas cosas. Analizaré la información y generaré un borrador completo con nombre comercial, precio, costo, SKU, variantes y descripción optimizada.'
    }
  ]);
  const [geminiHistory, setGeminiHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Borrador del producto generado por la IA
  const [draftProduct, setDraftProduct] = useState<GeminiProductResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Configuración de API Key local
  const [showSettings, setShowSettings] = useState(false);
  const [tempProvider, setTempProvider] = useState<'gemini' | 'openai'>('gemini');
  const [tempApiKey, setTempApiKey] = useState('');

  // Cargar configuración inicial al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const config = getAIConfig();
      setTempProvider(config.provider);
      setTempApiKey(config.apiKey);
    }
  }, [isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll en el chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Manejo de la selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convertir file a Base64 sin prefijo dataURL para Gemini
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Enviar mensaje al asistente
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const userText = inputText.trim();
    const currentPreview = imagePreview;
    const currentMimeType = selectedImage?.type;

    // Agregar el mensaje del usuario al chat de UI
    const newUserMessage: UIMessage = {
      role: 'user',
      text: userText || undefined,
      imageUrl: currentPreview || undefined
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Limpiar input y adjunto de la interfaz
    setInputText('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      let base64Data: string | undefined = undefined;
      if (selectedImage) {
        base64Data = await fileToBase64(selectedImage);
      }

      // Llamar al servicio de IA pasándole la conversación acumulada
      const aiResponse = await analyzeProductWithAI(
        userText,
        base64Data,
        currentMimeType,
        geminiHistory
      );

      // Actualizar el historial de Gemini
      const newHistoryEntries: ChatMessage[] = [];
      const userParts: any[] = [];
      if (userText) userParts.push({ text: userText });
      if (base64Data && currentMimeType) {
        userParts.push({
          inlineData: {
            mimeType: currentMimeType,
            data: base64Data
          }
        });
      }
      newHistoryEntries.push({ role: 'user', parts: userParts });
      newHistoryEntries.push({
        role: 'model',
        parts: [{ text: JSON.stringify(aiResponse) }]
      });

      setGeminiHistory(prev => [...prev, ...newHistoryEntries]);

      // Agregar respuesta del asistente al chat de UI
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: aiResponse.assistantMessage
        }
      ]);

      // Guardar el borrador en el panel derecho
      setDraftProduct(aiResponse);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `Lo siento, ocurrió un error al procesar tu solicitud: ${err.message}`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Subir imagen a Cloudinary (Unsigned upload preset)
  const uploadToCloudinary = async (fileOrBase64: string | File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', fileOrBase64);
      formData.append('upload_preset', 'promedid_preset');

      const res = await fetch(`https://api.cloudinary.com/v1_1/dlkky5xuo/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error('Cloudinary Upload Error:', err);
      throw err;
    }
  };

  // Confirmar y subir producto a la base de datos
  const handleConfirmAndUpload = async () => {
    if (!draftProduct) return;
    if (!draftProduct.title.trim()) {
      alert('El producto debe tener un nombre.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = '';

      // Si hay una imagen activa en la conversación que el usuario subió
      // La subimos a Cloudinary para tener un enlace permanente
      const lastImageMsg = [...messages].reverse().find(m => m.role === 'user' && m.imageUrl);
      if (lastImageMsg?.imageUrl) {
        // Subir a Cloudinary el base64 de la previsualización
        finalImageUrl = await uploadToCloudinary(lastImageMsg.imageUrl);
      }

      // Calcular stock total de las variantes
      let totalStock = 0;
      if (draftProduct.variants && draftProduct.variants.length > 0) {
        totalStock = draftProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      }

      const generatedId = `${companyId}-${draftProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

      // 1. Guardar producto principal
      const { data: savedProduct, error: productError } = await supabase
        .from('treatments')
        .insert({
          id: generatedId,
          company_id: companyId,
          title: draftProduct.title,
          description: draftProduct.description,
          category: draftProduct.category || categories[0]?.name || 'General',
          price: draftProduct.price || 0,
          cost_price: draftProduct.cost_price || 0,
          sku: draftProduct.sku || '',
          product_type: draftProduct.product_type || 'product',
          active: true,
          imageUrl: finalImageUrl || undefined,
          variants: draftProduct.variants || [],
          components: draftProduct.components || [],
          stock: totalStock
        })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Guardar beneficios del tratamiento
      if (draftProduct.benefits && draftProduct.benefits.length > 0) {
        const benefitsToInsert = draftProduct.benefits
          .filter(b => b.trim() !== '')
          .map(b => ({
            treatment_id: savedProduct.id,
            benefit: b,
            company_id: companyId
          }));

        if (benefitsToInsert.length > 0) {
          const { error: benefitsError } = await supabase
            .from('treatment_benefits')
            .insert(benefitsToInsert);

          if (benefitsError) console.error('Error insertando beneficios:', benefitsError);
        }
      }

      // 3. Éxito
      onSuccess();
      onClose();
      // Limpiar estados
      setMessages([
        {
          role: 'model',
          text: '¡Hola! Soy tu Asistente de Catálogo IA. 🤖✨\n\nPuedes subir una foto de un producto, describirlo con tus palabras o ambas cosas. Analizaré la información y generaré un borrador completo con nombre comercial, precio, costo, SKU, variantes y descripción optimizada.'
        }
      ]);
      setGeminiHistory([]);
      setDraftProduct(null);

    } catch (err: any) {
      alert('Error al guardar el producto: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Ayudantes de Prompts rápidos
  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-7xl rounded-[3rem] shadow-2xl animate-scale-in max-h-[95vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Asistente de Catálogo IA
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                  <Sparkles size={8} /> Multi-Modelo (Gemini / OpenAI)
                </span>
              </h2>
              <p className="text-slate-500 text-xs font-semibold">Carga, optimiza y crea variantes de tus productos de forma conversacional</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-full border transition-all shadow-sm flex items-center justify-center ${
                showSettings 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-700'
              }`}
              title="Configuración de API Key"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={onClose} 
              className="p-3 bg-white hover:bg-slate-100 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Settings Dropdown Panel */}
          {showSettings && (
            <div className="absolute top-22 right-10 bg-white border border-slate-150 rounded-3xl shadow-2xl p-6 z-[650] w-80 animate-fade-in">
              <h3 className="text-sm font-black text-slate-800 mb-3 uppercase tracking-wider">Configurar IA Personal</h3>
              <p className="text-[10px] text-slate-400 font-semibold mb-4 leading-relaxed">
                Guarda tu propia clave de API en este navegador para usar tu cuenta de Gemini u OpenAI.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proveedor de IA</label>
                  <select 
                    value={tempProvider} 
                    onChange={e => setTempProvider(e.target.value as 'gemini' | 'openai')}
                    className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value="gemini">Google Gemini (Recomendado)</option>
                    <option value="openai">OpenAI (GPT-4o-mini)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">API Key de {tempProvider === 'gemini' ? 'Gemini' : 'OpenAI'}</label>
                  <input 
                    type="password"
                    placeholder="Introduce tu clave API..."
                    value={tempApiKey}
                    onChange={e => setTempApiKey(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    saveAIConfig(tempProvider, tempApiKey);
                    setShowSettings(false);
                    alert('Configuración guardada correctamente.');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Body - Split Screen */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* LEFT SIDE: Chat Interface */}
          <div className="flex-1 md:w-[48%] border-r border-slate-100 flex flex-col bg-slate-50/20">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-3xl p-4 shadow-sm text-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : msg.isError
                          ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="User Upload" 
                        className="rounded-2xl max-w-full max-h-48 object-cover mb-2 border border-slate-100/10"
                      />
                    )}
                    <p className="whitespace-pre-line leading-relaxed font-medium">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-500 font-bold">Analizando producto con Gemini...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            {messages.length === 1 && (
              <div className="px-6 py-2 flex flex-wrap gap-2 bg-slate-50 border-t border-b border-slate-100">
                <button 
                  onClick={() => handleQuickPrompt('Agrega tenis Nike deportivos negros talla 40, precio 320000 y costo 150000')}
                  className="text-[10px] font-bold bg-white border border-slate-200 hover:border-emerald-500 text-slate-600 px-3 py-1.5 rounded-xl transition-all"
                >
                  👟 Tenis Deportivos
                </button>
                <button 
                  onClick={() => handleQuickPrompt('Servicio de masaje desintoxicante de 60 mins con aceites esenciales, precio 120000')}
                  className="text-[10px] font-bold bg-white border border-slate-200 hover:border-emerald-500 text-slate-600 px-3 py-1.5 rounded-xl transition-all"
                >
                  🛠️ Servicio de SPA
                </button>
              </div>
            )}

            {/* Message Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 space-y-3">
              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 rounded-2xl hover:text-emerald-600 transition-colors shadow-sm"
                  title="Subir foto del producto"
                >
                  <ImageIcon size={20} />
                </button>
                
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Describe el producto o haz una consulta..."
                  className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder-slate-400"
                />

                <button
                  type="submit"
                  disabled={isLoading || (!inputText.trim() && !selectedImage)}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: Active Product Draft Preview */}
          <div className="flex-grow md:w-[52%] flex flex-col bg-slate-50/10 overflow-y-auto custom-scrollbar p-10">
            {draftProduct ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      Borrador Generado
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">Detalles del Producto</h3>
                  </div>
                  <button 
                    onClick={() => setDraftProduct(null)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    <Undo size={14} />
                    Descartar Borrador
                  </button>
                </div>

                {/* Editable Fields Form */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                    <input 
                      value={draftProduct.title} 
                      onChange={e => setDraftProduct({ ...draftProduct, title: e.target.value })}
                      className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                    <input 
                      value={draftProduct.category} 
                      onChange={e => setDraftProduct({ ...draftProduct, category: e.target.value })}
                      className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio de Venta</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input 
                        type="number" 
                        value={draftProduct.price} 
                        onChange={e => setDraftProduct({ ...draftProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-100 rounded-xl pl-8 p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio Costo</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input 
                        type="number" 
                        value={draftProduct.cost_price || 0} 
                        onChange={e => setDraftProduct({ ...draftProduct, cost_price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-100 rounded-xl pl-8 p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU</label>
                    <input 
                      value={draftProduct.sku || ''} 
                      onChange={e => setDraftProduct({ ...draftProduct, sku: e.target.value })}
                      className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea 
                    value={draftProduct.description} 
                    onChange={e => setDraftProduct({ ...draftProduct, description: e.target.value })}
                    className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-medium text-slate-600 outline-none focus:border-emerald-500 h-24 resize-none" 
                  />
                </div>

                {/* Variants List Section */}
                {draftProduct.product_type === 'product' && (
                  <div className="space-y-2 border border-slate-100 p-5 rounded-3xl bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Variantes (Talla / Color / Stock)</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newVariants = [...(draftProduct.variants || []), { size: '', color: '', stock: 0 }];
                          setDraftProduct({ ...draftProduct, variants: newVariants });
                        }}
                        className="text-emerald-600 font-black text-[9px] uppercase hover:underline"
                      >
                        + Añadir Variante
                      </button>
                    </div>
                    {draftProduct.variants && draftProduct.variants.length > 0 ? (
                      <div className="space-y-2">
                        {draftProduct.variants.map((v, i) => (
                          <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-100">
                            <input 
                              placeholder="Talla" 
                              value={v.size} 
                              onChange={e => {
                                const newVariants = [...(draftProduct.variants || [])];
                                newVariants[i].size = e.target.value;
                                setDraftProduct({ ...draftProduct, variants: newVariants });
                              }}
                              className="w-1/3 bg-slate-50 border-none rounded-lg p-2 text-xs font-bold"
                            />
                            <input 
                              placeholder="Color" 
                              value={v.color} 
                              onChange={e => {
                                const newVariants = [...(draftProduct.variants || [])];
                                newVariants[i].color = e.target.value;
                                setDraftProduct({ ...draftProduct, variants: newVariants });
                              }}
                              className="w-1/3 bg-slate-50 border-none rounded-lg p-2 text-xs font-bold"
                            />
                            <input 
                              type="number" 
                              placeholder="Stock" 
                              value={v.stock} 
                              onChange={e => {
                                const newVariants = [...(draftProduct.variants || [])];
                                newVariants[i].stock = parseInt(e.target.value) || 0;
                                setDraftProduct({ ...draftProduct, variants: newVariants });
                              }}
                              className="w-1/4 bg-slate-50 border-none rounded-lg p-2 text-xs font-bold"
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newVariants = (draftProduct.variants || []).filter((_, idx) => idx !== i);
                                setDraftProduct({ ...draftProduct, variants: newVariants });
                              }}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold italic ml-1">Sin variantes definidas</p>
                    )}
                  </div>
                )}

                {/* Benefits / Characteristics List */}
                <div className="space-y-2 border border-slate-100 p-5 rounded-3xl bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Características / Beneficios</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newBenefits = [...(draftProduct.benefits || []), ''];
                        setDraftProduct({ ...draftProduct, benefits: newBenefits });
                      }}
                      className="text-emerald-600 font-black text-[9px] uppercase hover:underline"
                    >
                      + Añadir Característica
                    </button>
                  </div>
                  {draftProduct.benefits && draftProduct.benefits.length > 0 ? (
                    <div className="space-y-2">
                      {draftProduct.benefits.map((b, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input 
                            placeholder="Beneficio o característica..." 
                            value={b} 
                            onChange={e => {
                              const newBenefits = [...(draftProduct.benefits || [])];
                              newBenefits[i] = e.target.value;
                              setDraftProduct({ ...draftProduct, benefits: newBenefits });
                            }}
                            className="flex-1 bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold"
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newBenefits = (draftProduct.benefits || []).filter((_, idx) => idx !== i);
                              setDraftProduct({ ...draftProduct, benefits: newBenefits });
                            }}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold italic ml-1">Sin beneficios definidos</p>
                  )}
                </div>

                {/* Confirm and Upload Button */}
                <button
                  type="button"
                  onClick={handleConfirmAndUpload}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando producto...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirmar y Subir al Catálogo
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-400 shadow-sm animate-bounce-slow">
                  <Brain className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-base font-black text-slate-800">Esperando Producto...</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-2">
                  Escribe en el chat o sube una imagen de tu producto para iniciar la creación automática de catálogos mediante Inteligencia Artificial.
                </p>

                {/* Instructions helper */}
                <div className="mt-8 w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-left space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ejemplos de uso:</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-start text-xs text-slate-600 font-medium">
                      <ArrowRight size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Sube la foto de una prenda o calzado y pídele que deduzca sus atributos.</span>
                    </div>
                    <div className="flex gap-2 items-start text-xs text-slate-600 font-medium">
                      <ArrowRight size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Describe un servicio médico o estético con los beneficios y precio.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AIAssistantModal;
