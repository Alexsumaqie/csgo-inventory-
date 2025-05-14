// components/NewsModal.tsx
import React from 'react';

interface NewsModalProps {
  url: string;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-[90vw] h-[90vh] shadow-xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-red-500 rounded-full px-3 py-1 text-sm hover:bg-red-600"
        >
          ✕ Close
        </button>

        {/* Iframe preview */}
        <iframe
          src={url}
          className="w-full h-full rounded-b-2xl"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

export default NewsModal;
