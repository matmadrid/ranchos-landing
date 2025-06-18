// src/app/invite/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <div className="w-full max-w-2xl mb-8">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl w-full">
        {/* Tags */}
        <div className="flex gap-3 justify-center mb-8">
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Beta
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Invitación
          </span>
        </div>

        {/* Title with Gmail style */}
        <h1 className="text-2xl md:text-3xl font-normal text-gray-800 text-center mb-8 leading-relaxed">
          Una invitación más para RanchOS. Ingresa tu código para comenzar.
        </h1>

        {/* Input */}
        <div className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            placeholder="RANCH-XXXX-XXXX"
            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
            maxLength={15}
          />

          {/* Button */}
          <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg font-medium rounded-full hover:from-blue-700 hover:to-green-700 transition-all">
            Validar código
          </button>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Si conoces a alguien usando RanchOS, pídele un código.
        </p>
      </div>
    </div>
  );
}