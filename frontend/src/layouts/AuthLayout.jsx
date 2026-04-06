import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import logo from "../assets/images/sword-line.png"

const AuthLayout = ({ children, bgImage, secondaryText, linkText, linkTo, badgeText, quoteTitle, quoteDesc }) => {
  return (
    <div className="auth-layout">
      {/* Left Image Panel */}
      <div className="auth-layout__image-panel">
        <motion.img 
          src={bgImage} 
          alt="Generative AI Landscape" 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* App Logo/Header overlay top left */}
        <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <img src={logo} alt='logo' width={80} height={80} />
        </div>

        {/* Dynamic Overlay Text */}
        {(badgeText || quoteTitle) && (
          <motion.div 
            className="editor-choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {badgeText && <div className="badge"><div className="line"></div> {badgeText}</div>}
            {quoteTitle && <h2 className="quote-title">{quoteTitle}</h2>}
            {quoteDesc && <p className="quote-desc">{quoteDesc}</p>}
          </motion.div>
        )}
      </div>

      {/* Right Form Panel */}
      <div className="auth-layout__form-panel">
        
        {/* Top Right Navigation */}
        <div className="auth-top-nav">
          {secondaryText} <Link to={linkTo}>{linkText}</Link>
        </div>

        <motion.div 
          className="form-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {children}
        </motion.div>

        {/* Desktop Bottom Right Dots Indicator (Visual Only) */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '3rem', display: 'flex', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#333' }}></div>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#555' }}></div>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
