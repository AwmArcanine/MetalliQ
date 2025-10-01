import React from 'react';
import Button from './Button';
import { ExclamationTriangleIcon } from '../../constants';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  variant?: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="confirmation-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md relative border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex items-start">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isDanger ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    <ExclamationTriangleIcon className={`h-6 w-6 ${isDanger ? 'text-red-600' : 'text-yellow-600'}`} aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 id="confirmation-modal-title" className="text-lg font-bold text-gray-900">
                        {title}
                    </h3>
                    <div className="mt-2">
                        <div className="text-sm text-gray-600">
                            {message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-xl">
           <Button
                onClick={onConfirm}
                className={`${isDanger 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 hover:shadow-lg hover:shadow-red-500/30' 
                    : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 hover:shadow-lg hover:shadow-yellow-500/30'
                } border-transparent text-white w-full sm:ml-3 sm:w-auto`}
            >
                {confirmText}
            </Button>
            <Button
                variant="ghost"
                onClick={onClose}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
                Cancel
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;