import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Sparkles, CheckCircle, Mail } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  
  // 'pending', 'success', 'error'
  const [status, setStatus] = useState(statusParam || 'pending');

  useEffect(() => {
    if (statusParam) {
      setStatus(statusParam);
    }
  }, [statusParam]);

  return (
    <div className="auth-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <motion.div 
        className="form-container" 
        style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', maxWidth: '500px', width: '90%', textAlign: 'center', border: '1px solid var(--border-color)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', color: 'var(--accent-primary)' }}>
          <Sparkles size={48} />
        </div>
        
        {status === 'pending' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Mail size={64} style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem' }} />
            </motion.div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-bold)', marginBottom: '1rem' }}>Check Your Email</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              We've sent a verification link to your email address. Please click the link to activate your account.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Didn't receive an email? <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Resend</a>
            </p>
          </>
        )}

        {status === 'verifying' && (
          <>
            <div className="animate-pulse">
              <Sparkles size={64} style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
            </div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-bold)', marginBottom: '1rem' }}>Verifying...</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle size={64} style={{ color: 'var(--success-color)', margin: '0 auto 1.5rem' }} />
            </motion.div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-bold)', marginBottom: '1rem' }}>Email Verified!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              Your email has been successfully verified. You can now access all features of Gen AI.
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="auth-button">
                CONTINUE TO LOGIN <span style={{ marginLeft: '0.4rem' }}>➔</span>
              </button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-bold)', marginBottom: '1rem', color: 'var(--error-color)' }}>Verification Failed</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              The verification link is invalid or has expired. Please request a new verification email.
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="auth-button">
                BACK TO LOGIN
              </button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
