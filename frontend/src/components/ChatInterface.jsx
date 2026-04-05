import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Image as ImageIcon, FileText, Send, SquareTerminal } from 'lucide-react';
import useBattleStore from '../store/battleStore';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const { messages, isLoading, activeMode, setActiveMode, sendMessage } = useBattleStore();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeMode === 'text') {
      if (!input.trim()) return;
      sendMessage(input);
      setInput('');
    } else if (activeMode === 'image') {
      if (!input.trim()) return;
      sendMessage(input); // prompt
      setInput('');
    } else if (activeMode === 'pdf' || activeMode === 'voice') {
      if (!file) return;
      sendMessage(file);
      setFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.includes('audio')) {
        setActiveMode('voice');
      } else if (selectedFile.type.includes('pdf')) {
        setActiveMode('pdf');
      } else {
        // Defaulting anything else to image/pdf based on logic (can be refined)
      }
    }
  };

  // Switch modes manually
  const switchMode = (mode) => {
    setActiveMode(mode);
    setFile(null);
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <h2>What would you like to do?</h2>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}-message`}>
               {msg.type === 'ai' && (
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                   {msg.agent ? `Assistant ${msg.agent}` : 'AI'}
                 </div>
               )}
               <div className="message-content">
                 {msg.mode === 'image' && msg.type === 'ai' ? (
                   <img src={msg.text} alt="AI Generated" style={{maxWidth: '100%', borderRadius: '8px'}} />
                 ) : (
                   msg.text
                 )}
               </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai-message">
              <div className="message-content">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-wrapper">
        <form className="chat-input-box" onSubmit={handleSubmit}>
          {file && (
            <div style={{ padding: '4px 8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-block', width: 'fit-content' }}>
              Attached: {file.name}
            </div>
          )}
          
          <textarea
            placeholder={`Ask anything... (${activeMode} mode)`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={activeMode === 'voice' || activeMode === 'pdf' ? !!file : false}
          />
          
          <div className="input-actions">
            <div className="tools">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="audio/*,application/pdf,image/*"
              />
              <button type="button" onClick={handleFileClick} title="Add file">
                <Paperclip size={18} /> Add files
              </button>
              <button 
                type="button" 
                onClick={() => switchMode('voice')} 
                title="Voice Mode" 
                className={activeMode === 'voice' ? 'active-mode-btn' : ''}
              >
                <Mic size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => switchMode('image')} 
                title="Image Generation Mode"
                className={activeMode === 'image' ? 'active-mode-btn' : ''}
              >
                <ImageIcon size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => switchMode('pdf')} 
                title="PDF Analysis Mode"
                className={activeMode === 'pdf' ? 'active-mode-btn' : ''}
              >
                <FileText size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => switchMode('text')} 
                title="Text Mode"
                className={activeMode === 'text' ? 'active-mode-btn' : ''}
              >
                <SquareTerminal size={18} />
              </button>
            </div>
            
            <button 
              type="submit" 
              className="send-btn" 
              disabled={
                isLoading || 
                (activeMode === 'text' && !input.trim()) || 
                (activeMode === 'image' && !input.trim()) || 
                ((activeMode === 'voice' || activeMode === 'pdf') && !file)
              }
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
