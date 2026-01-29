import React from 'react';

export const CarouselArrow = ({ direction, show, onClick }: { direction: 'left' | 'right'; show: boolean; onClick?: () => void }) => {
  if (!show) return null;
  // Smaller, modern, glassy button with chevron icon
  const base =
    'absolute top-1/2 z-10 -translate-y-1/2 p-1 rounded-full bg-white/70 shadow-md hover:bg-blue-100/80 border border-blue-200 transition-all duration-200 cursor-pointer group backdrop-blur-sm';
  const pos = direction === 'left' ? 'left-2' : 'right-2';
  return (
    <button
      className={`${base} ${pos}`}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      onClick={onClick}
      tabIndex={0}
      style={{ width: 32, height: 32 }}
    >
      <span className="block group-hover:scale-110 transition-transform">
        {direction === 'left' ? (
          <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        ) : (
          <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
        )}
      </span>
    </button>
  );
};

export default CarouselArrow;
