'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function WaitlistWidget() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">¡Únete a la beta gratuita!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Acceso exclusivo por invitación a RanchOS
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">Beta gratuita</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">Solo por invitación</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">Acceso anticipado</span>
          </div>
        </div>

        <Link href="/waitlist">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            Reservar mi lugar →
          </Button>
        </Link>

      </div>
    </div>
  );
}
