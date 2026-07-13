import React from 'react';

interface MarkdownRendererProps {
  content?: string;
  className?: string;
}

// Limpia las marcas de formato para previsualizaciones recortadas (line-clamp)
export function stripMarkdown(text: string = ''): string {
  if (!text) return '';
  return text
    // Elimina marcas de encabezados (#)
    .replace(/^#+\s+/gm, '')
    // Elimina negrita (*texto* o **texto**)
    .replace(/\*+/g, '')
    // Elimina cursiva (_texto_)
    .replace(/_+/g, '')
    // Elimina tachado (~texto~)
    .replace(/~+/g, '')
    // Elimina viñetas
    .replace(/^[-*•]\s+/gm, '')
    // Reemplaza múltiples saltos de línea por un espacio
    .replace(/\n+/g, ' ')
    .trim();
}

export default function MarkdownRenderer({ 
  content = '', 
  className = 'text-slate-600 text-xs leading-relaxed' 
}: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');

  // Función recursiva/por fases para convertir estilos en línea (Negrita, Cursiva, Tachado)
  const parseInline = (text: string): React.ReactNode[] => {
    let parts: Array<{ type: 'text' | 'bold' | 'italic' | 'strike'; text: string }> = [
      { type: 'text', text }
    ];

    // 1. Negrita standard (**texto**)
    let tempParts: typeof parts = [];
    for (const p of parts) {
      if (p.type === 'text') {
        const regex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(p.text)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push({ type: 'text', text: p.text.substring(lastIndex, match.index) });
          }
          tempParts.push({ type: 'bold', text: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.text.length) {
          tempParts.push({ type: 'text', text: p.text.substring(lastIndex) });
        }
      } else {
        tempParts.push(p);
      }
    }
    parts = tempParts;

    // 2. Negrita WhatsApp (*texto*)
    tempParts = [];
    for (const p of parts) {
      if (p.type === 'text') {
        const regex = /\*(.*?)\*/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(p.text)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push({ type: 'text', text: p.text.substring(lastIndex, match.index) });
          }
          tempParts.push({ type: 'bold', text: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.text.length) {
          tempParts.push({ type: 'text', text: p.text.substring(lastIndex) });
        }
      } else {
        tempParts.push(p);
      }
    }
    parts = tempParts;

    // 3. Cursiva WhatsApp / standard (_texto_)
    tempParts = [];
    for (const p of parts) {
      if (p.type === 'text') {
        const regex = /_(.*?)_/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(p.text)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push({ type: 'text', text: p.text.substring(lastIndex, match.index) });
          }
          tempParts.push({ type: 'italic', text: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.text.length) {
          tempParts.push({ type: 'text', text: p.text.substring(lastIndex) });
        }
      } else {
        tempParts.push(p);
      }
    }
    parts = tempParts;

    // 4. Tachado WhatsApp (~texto~)
    tempParts = [];
    for (const p of parts) {
      if (p.type === 'text') {
        const regex = /~(.*?)~/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(p.text)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push({ type: 'text', text: p.text.substring(lastIndex, match.index) });
          }
          tempParts.push({ type: 'strike', text: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.text.length) {
          tempParts.push({ type: 'text', text: p.text.substring(lastIndex) });
        }
      } else {
        tempParts.push(p);
      }
    }
    parts = tempParts;

    return parts.map((part, index) => {
      switch (part.type) {
        case 'bold':
          return <strong key={index} className="font-extrabold text-slate-900">{part.text}</strong>;
        case 'italic':
          return <em key={index} className="italic text-slate-750">{part.text}</em>;
        case 'strike':
          return <span key={index} className="line-through text-slate-400">{part.text}</span>;
        default:
          return part.text;
      }
    });
  };

  return (
    <div className={className}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 1. Título H1 (# Título)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={index} className="font-black text-slate-900 text-lg mt-4 mb-2 uppercase leading-snug">
              {parseInline(trimmed.substring(2))}
            </h1>
          );
        }

        // 2. Título H2 (## Título)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="font-black text-slate-800 text-base mt-3.5 mb-1.5 uppercase leading-snug">
              {parseInline(trimmed.substring(3))}
            </h2>
          );
        }

        // 3. Título H3 (### Título)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="font-bold text-slate-700 text-sm mt-3 mb-1 uppercase tracking-wide leading-snug">
              {parseInline(trimmed.substring(4))}
            </h3>
          );
        }

        // 4. Viñetas (* Item, - Item, • Item)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const contentText = trimmed.substring(2);
          return (
            <div key={index} className="flex items-start gap-1.5 pl-1 my-1.5">
              <span className="text-emerald-500 font-extrabold text-xs select-none">•</span>
              <span className="flex-1 text-slate-600">{parseInline(contentText)}</span>
            </div>
          );
        }

        // Línea vacía
        if (trimmed === '') {
          return <div key={index} className="h-2.5" />;
        }

        // Línea regular
        return (
          <p key={index} className="my-1 min-h-[1em]">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
}
