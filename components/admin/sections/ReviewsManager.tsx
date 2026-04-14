import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Trash2, CheckCircle, XCircle, Star, MessageSquare, ExternalLink } from 'lucide-react';

interface ReviewsManagerProps {
  companyId?: string;
}

const ReviewsManager: React.FC<ReviewsManagerProps> = ({ companyId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  useEffect(() => {
    fetchReviews();
  }, [companyId]);

  const fetchReviews = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Since reviews are linked to treatments which are linked to companies
    // we need to join or filter by treatment_id belonging to the company
    
    // First get company's treatments
    const { data: treatments, error: treatmentsError } = await supabase
      .from('treatments')
      .select('id, title')
      .eq('company_id', companyId);

    if (treatmentsError) {
      console.error('Error fetching treatments:', treatmentsError);
      setLoading(false);
      return;
    }

    const treatmentIds = treatments?.map(t => t.id) || [];

    if (treatmentIds.length === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*, treatments(title)')
      .in('treatment_id', treatmentIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, active: !currentStatus } : r));
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta reseña permanentemente?')) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'active') return r.active;
    if (filter === 'pending') return !r.active;
    return true;
  });

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Gestión de Reseñas</h2>
          <p className="text-slate-500 font-medium italic">Administra los testimonios y calificaciones de tus clientes.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'active' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Activas
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Ocultas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
           <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
           <p className="text-slate-400 font-bold text-xl">No se encontraron reseñas para administrar.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className={`bg-white p-6 rounded-3xl border transition-all ${review.active ? 'border-slate-100 shadow-sm' : 'border-amber-100 bg-amber-50/20 grayscale-[0.5]'}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      {review.treatments?.title || 'Producto desconocido'}
                    </span>
                    {!review.active && (
                       <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500 text-white rounded-md">Oculto</span>
                    )}
                    <a 
                      href={`#treatment/${review.treatment_id}`}
                      className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      <ExternalLink size={12} />
                      Ver en el sitio
                    </a>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{review.user_name}</h4>
                  <p className="text-slate-600 leading-relaxed italic">"{review.comment}"</p>
                  <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tighter">
                    Recibido el {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => toggleStatus(review.id, review.active)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      review.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {review.active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    {review.active ? 'Ocultar' : 'Activar'}
                  </button>
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={18} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
