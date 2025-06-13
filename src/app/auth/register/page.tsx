// src/app/auth/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  Shield,
  Chrome,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LogoSatellite } from '@/components/ui/logo-static';
import useRanchOSStore from '@/store';
import { useToast } from '@/hooks/useToast';
import { CompleteProfileMessage } from '@/components/auth/CompleteProfileMessage';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { setCurrentUser, setProfile, currentUser, ranches, setIsOnboardingComplete, currentRanch, cattle } = useRanchOSStore();
  const { success, error } = useToast();
  
  // Detectar si es usuario temporal completando perfil
  const isTemporaryUser = currentUser?.id?.startsWith('demo-');
  const isCompletingProfile = message === 'complete-profile' && isTemporaryUser;
  
  // Obtener datos del rancho temporal
  const temporaryRanchData = currentRanch || ranches[0];
  const temporaryAnimalsCount = cattle?.length || 0;
  const temporaryProduction = 0;
  
  // Definir emojis flotantes con posiciones determinísticas
  const floatingEmojis = [
    { emoji: '🐄', x: '10%', y: '15%' },
    { emoji: '🌾', x: '80%', y: '20%' },
    { emoji: '📊', x: '25%', y: '70%' },
    { emoji: '🚜', x: '70%', y: '80%' },
    { emoji: '🌱', x: '90%', y: '50%' },
    { emoji: '🛰️', x: '15%', y: '40%' },
    { emoji: '📈', x: '50%', y: '10%' },
    { emoji: '🌿', x: '40%', y: '90%' }
  ];
  
  // Pre-llenar datos si viene del onboarding
  useEffect(() => {
    if (currentUser?.id?.startsWith('demo-')) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email?.includes('demo') ? '' : currentUser.email || prev.email
      }));
    }
  }, [currentUser]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'One number', met: /\d/.test(formData.password) },
    { text: 'One special character', met: /[@$!%*?&]/.test(formData.password) }
  ];

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {
      ...errors,
      name: !formData.name ? 'Name is required' : formData.name.length < 2 ? 'Name is too short' : '',
      email: !formData.email ? 'Email is required' : !validateEmail(formData.email) ? 'Invalid email' : ''
    };

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email;
  };

  const validateStep2 = () => {
    const newErrors = {
      ...errors,
      password: !formData.password ? 'Password is required' : 
                passwordRequirements.filter(req => !req.met).length > 0 ? 'Password does not meet requirements' : '',
      confirmPassword: !formData.confirmPassword ? 'Please confirm your password' : 
                       formData.password !== formData.confirmPassword ? 'Passwords do not match' : '',
      terms: !agreedToTerms ? 'You must agree to the terms' : ''
    };

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword && !newErrors.terms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Si es un usuario temporal, convertirlo a permanente
      const isTemporaryUser = currentUser?.id?.startsWith('demo-');
      
      const permanentUser = {
        id: isTemporaryUser ? `user-${Date.now()}` : 'user-' + Date.now(),
        email: formData.email,
        name: formData.name,
        phone: currentUser?.phone || '',
        location: currentUser?.location || '',
        createdAt: currentUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentUser(permanentUser);
      
      // También crear/actualizar un perfil
      setProfile({
        name: formData.name,
        email: formData.email,
        ranch: ranches[0]?.name || '',
        location: ranches[0]?.location || '',
        countryCode: useRanchOSStore.getState().currentCountry
      });
      
      // Marcar onboarding como completo ahora que se registró
      setIsOnboardingComplete(true);
      
      // Limpiar marca de usuario temporal
      localStorage.removeItem('isTemporaryUser');

      success("Welcome to RanchOS! 🎉", "Your account has been created successfully");

      // Redirigir según el parámetro o al dashboard por defecto
      router.push(redirectTo);
    }, 1500);
  };

  const handleSocialRegister = (provider: string) => {
    error(`${provider} registration`, "Social registration coming soon!");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animated Background */}
      <motion.div 
        className="hidden lg:block lg:flex-1 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 relative overflow-hidden"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        style={{
          backgroundSize: '400% 400%',
        }}
      >
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <motion.h2 
              className="text-5xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isCompletingProfile ? "Convierte tu progreso en permanente" : "Únete a miles de ganaderos modernos"}
            </motion.h2>
            <motion.p 
              className="text-xl opacity-90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isCompletingProfile ? "Mantén todos tus datos y desbloquea funciones avanzadas" : "Transforma tu rancho con tecnología de punta"}
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { number: '50+', label: 'Animals tracked' },
                { number: '98%', label: 'Satisfaction rate' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold">{stat.number}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo and Header */}
          {/* Mensaje contextual para usuarios temporales */}
          {isCompletingProfile && (
            <div className="mb-6">
              <CompleteProfileMessage
                ranchName={temporaryRanchData?.name}
                animalCount={temporaryAnimalsCount}
                productionData={{
                  totalProduction: temporaryProduction,
                  trend: 'up'
                }}
              />
            </div>
          )}

          
          <div className="text-center">
            <motion.div 
              className="flex justify-center mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <LogoSatellite size="xl" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {isCompletingProfile ? 'Completa tu cuenta' : 'Crea tu cuenta'}
            </motion.h1>
            <motion.p 
              className="mt-2 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isCompletingProfile ? 'Último paso para asegurar tu información' : 'Únete gratis a la plataforma ganadera más moderna'}
            </motion.p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2].map((step) => (
              <motion.div
                key={step}
                className={`h-2 w-16 rounded-full ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: step <= currentStep ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Registration Form */}
          <motion.form 
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentStep === 1 ? (
              <motion.div className="space-y-6" variants={itemVariants}>
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="rancher@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Social Register Options */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or register with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialRegister('Google')}
                      className="hover:bg-gray-50"
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialRegister('Apple')}
                      className="hover:bg-gray-50"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Apple
                    </Button>
                  </div>
                </div>

                {/* Continue Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div className="space-y-6" variants={itemVariants}>
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="space-y-1 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center text-sm ${
                          req.met ? 'text-green-600' : 'text-gray-400'
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CheckCircle2 className={`h-4 w-4 mr-2 ${
                          req.met ? 'text-green-600' : 'text-gray-300'
                        }`} />
                        {req.text}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setAgreedToTerms(checked)
                        }
                      }}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.terms && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.terms}
                    </motion.p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <>
                        {isCompletingProfile ? 'Completar registro' : 'Crear cuenta gratis'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.form>

          {/* Sign in link */}
          <motion.p 
            className="text-center text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isCompletingProfile ? '¿Prefieres seguir explorando?' : '¿Ya tienes cuenta?'}{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}