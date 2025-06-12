'use client';
import { motion } from 'framer-motion';

export default function TestMotion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
          ¡Dashboard Premium Funcionando! 🚀
        </h1>
        <p className="text-xl text-gray-600">
          Si ves este texto con gradiente verde-azul, ¡los colores están configurados!
        </p>
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-primary animate-float" />
          <div className="w-32 h-32 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl shadow-secondary animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
