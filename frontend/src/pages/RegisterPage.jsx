import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import AuthButton from '../components/AuthButton';
import useAuthStore from '../store/authStore';
import { User, AtSign, Lock } from 'lucide-react';

// We import the background image
import registerBg from '../assets/images/register-bg.jpg';

import SocialLogin from '../components/SocialLogin';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!name || !email || !password) {
      setAuthError('Please fill out all fields.');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/verify'); // Redirect to verification page
    } else {
      setAuthError('Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout
      bgImage={registerBg}
      badgeText="LIMITLESS POTENTIAL"
      quoteTitle="Turn every whisper of a thought into visual mastery."
      quoteDesc="Join the next evolution of digital creativity where prompt meets perfection."
      secondaryText="Already have an account?"
      linkText="Log in"
      linkTo="/login"
    >
      <div className="auth-header">
        <h1>Create Your Account to Unleash Your Dreams</h1>
        <p>Step into a workspace designed for high-fidelity generative intelligence.</p>
      </div>

      <form onSubmit={handleRegister}>
        <InputField 
          label="FULL NAME"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
          required
        />

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
          required
        />

        {authError && (
          <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        <AuthButton type="submit" isLoading={isLoading} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #333' }}>
          Start Creating <span style={{ marginLeft: '0.4rem', color: '#fff' }}>➔</span>
        </AuthButton>
      </form>

      <div className="auth-divider">
        <span>OR CONTINUE WITH</span>
      </div>

      <SocialLogin />

      <div className="auth-footer-simple" style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter-regular)' }}>
        By signing up, you agree to our <a href="#" style={{ color: 'var(--text-secondary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
      </div>

    </AuthLayout>
  );
};

export default RegisterPage;
