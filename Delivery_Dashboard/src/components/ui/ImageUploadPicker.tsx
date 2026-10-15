import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface ImageUploadPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  hint?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

// Hàm nén ảnh sang Data URL Base64 tối ưu để lưu trực tiếp vào CSDL Postgres
export const compressImageToBase64 = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  value,
  onChange,
  label = 'Hình ảnh',
  helperText,
  hint,
  aspectRatio = 'video',
}) => {
  const displayHelper = hint || helperText || 'Hỗ trợ JPG, PNG, WEBP. Ảnh được tối ưu và lưu trực tiếp vào CSDL.';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)!');
      return;
    }
    setIsProcessing(true);
    try {
      const base64 = await compressImageToBase64(file);
      onChange(base64);
    } catch (err) {
      console.error('Lỗi đọc ảnh:', err);
      alert('Không thể đọc file ảnh. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const hasImage = Boolean(value && value.trim());
  const isBase64 = value?.startsWith('data:image/');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 text-xs">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? 'Ẩn ô dán link URL' : 'Hoặc dán URL mạng'}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview Box or Drop Area */}
      {hasImage ? (
        <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 relative">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã nạp ảnh thành công</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {isBase64 ? 'Ảnh lưu CSDL (Base64 Data)' : value}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md shadow-2xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Đổi ảnh từ thư mục
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Xoá ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 py-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Bấm vào đây để chọn ảnh từ thư mục máy tính
            </p>
            <p className="text-[11px] text-slate-500">
              hoặc kéo thả file ảnh trực tiếp vào khung này
            </p>
          </div>
        </div>
      )}

      {/* Optional URL Input Fallback */}
      {showUrlInput && (
        <div className="pt-1.5">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>
      )}

      {displayHelper && !hasImage && (
        <p className="text-[11px] text-slate-400 italic">
          💡 {displayHelper}
        </p>
      )}
    </div>
  );
};
