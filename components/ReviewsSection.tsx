import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsSectionProps {
  treatmentId: string;
  reviews: Review[];
  onReviewAdded: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ treatmentId, reviews, onReviewAdded }) => {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Mercado Libre style rating distribution
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
  }));

  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !comment) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('reviews').insert([
      {
        treatment_id: treatmentId,
        user_name: userName,
        rating: rating,
        comment: comment
      }
    ]);

    setIsSubmitting(false);
    if (!error) {
      setUserName('');
      setComment('');
      setRating(5);
      setShowForm(false);
      onReviewAdded();
    }
  };

  const renderStars = (count: number, size = "w-4 h-4") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`${size} ${s <= count ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 border-t border-slate-100">
      <div className="mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Opiniones sobre el producto</h2>
        
        <div className="grid md:grid-cols-3 gap-16">
          {/* Summary Column */}
          <div className="md:col-span-1">
            <div className="sticky top-28">
              <div className="text-center md:text-left mb-8">
                <div className="text-6xl font-black text-slate-900 mb-2">{averageRating}</div>
                <div className="mb-2">{renderStars(Math.round(Number(averageRating)), "w-6 h-6 justify-center md:justify-start")}</div>
                <div className="text-sm text-slate-500">Promedio entre {totalReviews} opiniones</div>
              </div>

              <div className="space-y-3 mb-10">
                {ratingDistribution.map((rate) => (
                  <div key={rate.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-20 md:w-24 shrink-0 text-slate-600 font-medium whitespace-nowrap">{rate.stars} estrellas</span>
                    <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${rate.percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-slate-400 text-right">{rate.count}</span>
                  </div>
                ))}
              </div>

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  Escribir una opinión
                </button>
              ) : (
                <button
                  onClick={() => setShowForm(false)}
                  className="w-full py-3 text-slate-500 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* List Column */}
          <div className="md:col-span-2 space-y-10">
            {showForm && (
              <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-12 animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Comparte tu experiencia</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Puntuación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            rating >= s ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tu nombre</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Ej. Ana García"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tu opinión</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-32"
                      placeholder="¿Qué te pareció el tratamiento?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Publicar mi opinión'}
                  </button>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300">
                <div className="text-4xl mb-4">🌟</div>
                <p className="text-slate-500 font-medium">Sé el primero en calificar este tratamiento.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-8 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {renderStars(review.rating, "w-4 h-4")}
                        <div className="text-sm font-bold text-slate-900 mt-2">{review.user_name}</div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                    <div className="flex gap-4 mt-4">
                      <button className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">¿Te resultó útil?</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
