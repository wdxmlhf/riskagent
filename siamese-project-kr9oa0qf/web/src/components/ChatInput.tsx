import React, { useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = "Ask anything"
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={`relative bg-gray-700/95 backdrop-blur-sm border border-gray-600/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.005] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-end p-4 space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            className="w-full bg-transparent border-none resize-none outline-none text-gray-100 placeholder-gray-400 text-base leading-6 min-h-[24px] max-h-32 py-2 font-medium"
            rows={1}
            disabled={disabled}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-xl disabled:shadow-sm"
        >
          <span className="text-sm font-bold">发送</span>
        </button>
      </div>
    </div>
  );
}
