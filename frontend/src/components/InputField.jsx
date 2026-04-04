import React from 'react';
import { motion } from 'motion/react';

const InputField = ({ label, type = "text", placeholder, value, onChange, forgotPassword, icon: Icon, ...props }) => {
  return (
    <motion.div 
      className="input-group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="label-container">
        <label>{label}</label>
        {forgotPassword && (
          <a href="#" className="forgot-password">
            FORGOT PASSWORD?
          </a>
        )}
      </div>
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon">
            <Icon size={18} color="var(--text-secondary)" />
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          className={Icon ? 'has-icon' : ''}
          {...props}
        />
      </div>
    </motion.div>
  );
};

export default InputField;
