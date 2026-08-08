import React, { useEffect } from 'react'
import { X, Download } from 'lucide-react'

const ProfilePhotoModal = ({ isOpen, onClose, photoUrl, title = "Profile Photo" }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!photoUrl) return;
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-base-100/90 border border-base-300 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center p-6 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-base-300 pb-3">
          <h3 className="text-lg font-semibold text-base-content">{title}</h3>
          <div className="flex items-center gap-2">
            {photoUrl && photoUrl !== '/avatar.png' && (
              <button 
                onClick={handleDownload}
                className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
                title="Download Photo"
              >
                <Download size={18} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Photo Container */}
        <div className="w-full flex justify-center items-center py-4 max-h-[70vh] overflow-hidden">
          <img
            src={photoUrl || "/avatar.png"}
            alt={title}
            className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg border border-base-300"
          />
        </div>
      </div>
    </div>
  )
}

export default ProfilePhotoModal
