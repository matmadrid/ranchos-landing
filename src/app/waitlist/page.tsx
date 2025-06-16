'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Gracias! Te notificaremos cuando RanchOS esté listo.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Algo salió mal. Por favor intenta de nuevo.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
        
        <Card className="p-8 shadow-xl">
          {status === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">{message}</p>
              <Link href="/">
                <Button className="mt-6" variant="outline">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-6 py-2 bg-green-100 text-green-700 rounded-full text-base font-medium">Beta</span>
                <span className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-base font-medium">Invitación</span>
              </div>
              <p className="text-gray-600 mb-6">Únete a la beta gratuita exclusiva. Sé de los primeros en acceder a la plataforma de gestión ganadera más avanzada.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full"
                />
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Unirme a la lista de espera'
                  )}
                </Button>
              </form>
              
              {message && status === 'error' && (
                <p className="mt-4 text-base text-red-600">{message}</p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
