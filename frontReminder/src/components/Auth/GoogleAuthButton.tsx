import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks';

interface GoogleAuthButtonProps {
  mode: 'login' | 'register';
  className?: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode, className = '' }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('🎯 Google OAuth Success Response:', credentialResponse);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('📤 Sending token to backend:', credentialResponse.credential.substring(0, 50) + '...');
      // Enviar el token de Google al backend para autenticación/registro
      await loginWithGoogle(credentialResponse.credential);

      toast.success(mode === 'login'
        ? '¡Inicio de sesión exitoso con Google!'
        : '¡Cuenta creada exitosamente con Google!'
      );

      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      toast.error(
        error.response?.data?.message ||
        `Error al ${mode === 'login' ? 'iniciar sesión' : 'registrarse'} con Google`
      );
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google authentication failed');
    toast.error(`Error al ${mode === 'login' ? 'iniciar sesión' : 'registrarse'} con Google`);
  };

  return (
    <div className={`w-full ${className}`}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text={mode === 'login' ? 'signin_with' : 'signup_with'}
        locale="es"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleAuthButton;
