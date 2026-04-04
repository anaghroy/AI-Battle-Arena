import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

const AuthButton = ({ children, isLoading, ...props }) => {
  return (
    <motion.button 
      className="auth-button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
    </motion.button>
  );
};

export default AuthButton;
