import React, { useRef, useState } from 'react';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, Smile, Eye, EyeOff } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_EMOJIS = [
  '😊', '🌟', '🔥', '✨', '⚡', '💖', '👍', '🛍️', '📦', '🏷️',
  '💰', '🎁', '📍', '📞', '💬', '🚀', '✅', '❌', '⚠️', '🕒',
  '📅', '🌿', '🌸', '🐾', '🍕', '🥤', '👗', '👟', '💍', '👑'
];

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Describe brevemente...',
  className = ''
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Inserta marcas de formato (antes y después) o en la selección del cursor
  const insertFormat = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const selectedText = text.substring(start, end);

    const textToInsert = before + selectedText + after;
    const newValue = text.substring(0, start) + textToInsert + text.substring(end);

    onChange(newValue);

    // Reposiciona el cursor e introduce un pequeño retardo para enfocar
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 50);
  };

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const newValue = text.substring(0, start) + emoji + text.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 50);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            onClick={() => insertFormat('*', '*')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all font-bold"
            title="Negrita (WhatsApp)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('_', '_')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all italic"
            title="Cursiva (WhatsApp)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('~', '~')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all line-through"
            title="Tachado (WhatsApp)"
          >
            <Strikethrough size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('# ')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all font-black text-xs"
            title="Título Grande"
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('## ')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all font-bold text-xs"
            title="Título Mediano"
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('### ')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all text-xs"
            title="Título Chico"
          >
            <Heading3 size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('• ')}
            className="p-2 text-slate-500 hover:text-[#128c7e] hover:bg-slate-100 rounded-xl transition-all"
            title="Viñeta"
          >
            <List size={15} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 ${
                showEmojiPicker ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:text-[#128c7e] hover:bg-slate-100'
              }`}
              title="Insertar Emoji"
            >
              <Smile size={15} />
            </button>
            
            {showEmojiPicker && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowEmojiPicker(false)}
                />
                <div className="absolute left-0 mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 grid grid-cols-6 gap-1 w-52 max-h-48 overflow-y-auto animate-fade-in">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-lg text-center transition-transform hover:scale-110 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`p-2 text-xs font-black uppercase rounded-xl transition-all flex items-center gap-1 border ${
            showPreview 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {showPreview ? (
            <>
              <EyeOff size={13} />
              <span>Editar</span>
            </>
          ) : (
            <>
              <Eye size={13} />
              <span>Previsualizar</span>
            </>
          )}
        </button>
      </div>

      {/* Área del editor / Vista previa */}
      <div className="relative flex-1 min-h-[160px] bg-white">
        {showPreview ? (
          <div className="p-4 min-h-[160px] max-h-[300px] overflow-y-auto bg-slate-50/50 rounded-b-3xl">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-slate-400 text-xs italic">Escribe algo en el editor para previsualizarlo...</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[160px] max-h-[300px] p-4 text-sm font-bold text-slate-800 bg-transparent border-none outline-none resize-y placeholder:text-slate-400/80 focus:ring-0"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}
