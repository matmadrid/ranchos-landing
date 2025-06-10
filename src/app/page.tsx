// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigir automáticamente al onboarding
  // Más adelante puedes agregar lógica para verificar si el usuario ya completó el onboarding
  redirect('/auth/onboarding')
}