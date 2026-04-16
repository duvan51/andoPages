import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Componente de imagen optimizada con:
 * - Lazy loading automático (salvo prioridad)
 * - Efecto de difuminado al cargar (Blur-up)
 * - Soporte básico para transformaciones de Supabase
 * - Prevención de Layout Shift (CLS)
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  objectFit = 'cover',
  style,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src || '');

  useEffect(() => {
    if (!src) {
      setOptimizedSrc('');
      return;
    }

    // 1. Soporte para Cloudinary (Prioridad si se detecta)
    if (src.includes('res.cloudinary.com')) {
      try {
        // Formato: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id]
        // Insertamos transformaciones justo después de '/upload/'
        const parts = src.split('/upload/');
        if (parts.length === 2) {
          const transformations = [];
          transformations.push('f_auto'); // Formato automático (WebP/Avif)
          transformations.push('q_auto'); // Calidad automática
          
          if (width) {
            transformations.push(`w_${width * 2}`); // Retina-ready
          }

          setOptimizedSrc(`${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`);
          return;
        }
      } catch (e) {
        setOptimizedSrc(src);
      }
    }

    // 2. Soporte para Supabase
    if (src.includes('supabase.co/storage/v1/object/public/')) {
       try {
         const transformPath = src.replace('/object/public/', '/render/image/public/');
         const params = new URLSearchParams();
         
         if (width) params.append('width', (width * 2).toString());
         params.append('quality', '75');
         params.append('format', 'webp');
         
         setOptimizedSrc(`${transformPath}?${params.toString()}`);
       } catch (e) {
         setOptimizedSrc(src);
       }
    } else {
      setOptimizedSrc(src);
    }
  }, [src, width]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        ...style
      }}
    >
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full transition-all duration-700 ease-in-out ${
          objectFit === 'cover' ? 'object-cover' : 
          objectFit === 'contain' ? 'object-contain' : 
          objectFit === 'fill' ? 'object-fill' : 
          objectFit === 'none' ? 'object-none' : 'object-scale-down'
        } ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'
        }`}
        {...props}
      />
      
      {/* Placeholder de color mientras carga */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;
