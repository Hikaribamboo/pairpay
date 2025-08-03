import React from "react";
import { X } from "lucide-react";

const ModalOverlay = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-xl w-full max-w-lg p-6 relative">
        <button
          aria-label="閉じる"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};
export default ModalOverlay;
