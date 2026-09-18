export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Pulsing Outer Circle */}
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] opacity-20 animate-ping" style={{ width: '80px', height: '80px', margin: 'auto' }}></div>
        
        {/* Spinning Inner Circle */}
        <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-[var(--color-primary)] animate-spin flex items-center justify-center bg-white z-10 shadow-lg">
          {/* Logo inside */}
          <span className="text-sm font-black tracking-tighter text-black">
            be<span className="text-[var(--color-primary)]">Food</span>
          </span>
        </div>
        
        <p className="mt-6 text-sm font-bold text-gray-600 animate-pulse tracking-wide uppercase">Đang tải...</p>
      </div>
    </div>
  );
}
