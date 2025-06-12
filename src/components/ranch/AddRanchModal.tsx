'use client';

import React from 'react';
import { X } from 'lucide-react';
import AddRanchForm from './AddRanchForm';

interface AddRanchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRanchModal({ isOpen, onClose }: AddRanchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Agregar Nuevo Rancho
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <AddRanchForm 
              onClose={onClose}
              onSuccess={() => {
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}