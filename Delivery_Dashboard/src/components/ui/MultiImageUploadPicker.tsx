import React, { useRef, useState } from 'react';
import { Upload, Trash2, Plus, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { compressImageToBase64 } from './ImageUploadPicker';

interface MultiImageUploadPickerProps {
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  maxImages?: number;
}

export const MultiImageUploadPicker: React.FC<MultiImageUploadPickerProps> = ({
  values = [],
  onChange,
  label = 'Ảnh phụ / Chi tiết',
  maxImages = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputText, setUrlInputText] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const newBase64s: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const b64 = await compressImageToBase64(file);
          newBase64s.push(b64);
        } catch (err) {
          console.error('Lỗi đọc ảnh phụ:', err);
        }
      }
    }

    const updated = [...values, ...newBase64s].slice(0, maxImages);
    onChange(updated);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddUrl = () => {
    if (!urlInputText.trim()) return;
    const urls = urlInputText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = [...values, ...urls].slice(0, maxImages);
    onChange(updated);
    setUrlInputText('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 text-xs">
          {label} ({values.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? 'Ẩn nhập URL' : 'Dán URL'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Grid Thumbnails */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {values.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100"
          >
            <img src={url} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs hover:bg-rose-700"
              title="Xóa ảnh này"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {values.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      {showUrlInput && (
        <div className="pt-1 flex gap-2">
          <textarea
            rows={1}
            value={urlInputText}
            onChange={(e) => setUrlInputText(e.target.value)}
            placeholder="Dán link ảnh (mỗi dòng 1 URL)"
            className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 cursor-pointer"
          >
            Thêm
          </button>
        </div>
      )}
    </div>
  );
};
