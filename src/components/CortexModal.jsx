import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  X as CloseIcon
} from 'lucide-react';

const CortexModal = ({ 
  isOpen, 
  type = 'info', 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  icon: CustomIcon
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      bg: 'bg-green-500',
      text: 'text-green-500',
      icon: <CheckCircle className=""/>,
      btn: 'bg-green-500 hover:bg-green-600 text-white'
    },
    error: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      icon: <XCircle className=""/>,
      btn: 'bg-red-500 hover:bg-red-600 text-white'
    },
    confirm: {
      bg: 'bg-black',
      text: 'text-black',
      icon: <AlertTriangle className=""/>,
      btn: 'bg-black hover:bg-gray-800 text-white'
    },
    info: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      icon: <Info className=""/>,
      btn: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="">
      {/* Backdrop */}
      <div 
        className=""
        onClick={onCancel}
      ></div>
      
      {/* Modal Card */}
      <div className="">
        <div className="">
            <button 
                onClick={onCancel} 
                className=""
            >
                <CloseIcon size={18}/>
            </button>
        </div>
 
        <div className="">
          <div className="">
            {CustomIcon || config.icon}
          </div>
          
          <h3 className="">
            {title}
          </h3>
          
          <p className="">
            {description}
          </p>
          
          <div className="">
            {type === 'confirm' && (
              <button 
                onClick={onCancel}
                className=""
              >
                {cancelText}
              </button>
            )}
            <button 
              onClick={() => {
                if(onConfirm) onConfirm();
                if(type !== 'confirm') onCancel(); // Auto-close for notifications
              }}
              className=""
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CortexModal;
