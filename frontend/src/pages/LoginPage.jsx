import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import AuthButton from '../components/AuthButton';
import useAuthStore from '../store/authStore';
import { AtSign, Lock } from 'lucide-react';

// We import the background image
import loginBg from '../assets/images/login-bg.jpg';

import SocialLogin from '../components/SocialLogin';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email || !password) {
      setAuthError('Please fill out all fields.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  return (
    <AuthLayout
      bgImage={loginBg}
      badgeText="LIMITLESS POTENTIAL"
      quoteTitle="Turn every whisper of a thought into visual mastery."
      quoteDesc="Join the next evolution of digital creativity where prompt meets perfection."
      secondaryText="Don't have an account?"
      linkText="Sign up"
      linkTo="/register"
    >
      <div className="auth-header">
        <h1>Welcome Back to Your Creative Space</h1>
        <p>Continue your journey into the infinite possibilities of generative art.</p>
      </div>

      <form onSubmit={handleLogin}>
        <InputField 
          label="EMAIL ADDRESS"
          type="email"
          placeholder="name@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={AtSign}
          required
        />
        
        <InputField 
          label="PASSWORD"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          forgotPassword={true}
          required
        />

        {authError && (
          <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        <AuthButton type="submit" isLoading={isLoading} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #333' }}>
          LOG IN <span style={{ marginLeft: '0.4rem', color: '#fff' }}>➔</span>
        </AuthButton>
      </form>

      <div className="auth-divider">
        <span>OR CONTINUE WITH</span>
      </div>

      <SocialLogin />

      <div className="auth-footer-simple" style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        © 2026 GEN AI LAB. ALL RIGHTS RESERVED.
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
