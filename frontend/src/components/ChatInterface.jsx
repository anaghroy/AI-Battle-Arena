import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Paperclip, Mic, Image as ImageIcon, FileText, Send, SquareTerminal, CircleStop, Trophy, Video, Volume2, VolumeX } from 'lucide-react';
import useBattleStore from '../store/battleStore';
import { stopSpeaking, playIndividual } from '../utils/tts';

const AudioPlayer = ({ textToSpeak, personality }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      stopSpeaking();
      setIsPlaying(true);
      playIndividual(textToSpeak, personality).then(() => {
        setIsPlaying(false);
      });
    }
  };

  if (!textToSpeak) return null;

  return (
    <button 
      onClick={togglePlay}
      type="button"
      style={{
        background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', 
        padding: '6px', color: isPlaying ? '#41BE4B' : 'var(--text-secondary)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      title={isPlaying ? "Stop" : "Listen"}
    >
      {isPlaying ? <Volume2 size={16} color="#41BE4B" /> : <VolumeX size={16} />}
    </button>
  );
};

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const { messages, isLoading, activeMode, setActiveMode, sendMessage } = useBattleStore();
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (activeMode === 'text') {
      if (!input.trim()) return;
      sendMessage(input);
      setInput('');
    } else if (activeMode === 'image' || activeMode === 'video') {
      if (!input.trim()) return;
      sendMessage(input);
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
      }
    }
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
    setFile(null);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Ensure activeMode is set to voice when automatically sending
        setActiveMode('voice');
        sendMessage(audioBlob);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setActiveMode('voice');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const isInitialState = messages.length === 0;

  const MarkdownComponents = {
    code({inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: '16px 0', border: '1px solid var(--border-color)', borderRadius: '8px', overflowX: 'auto', background: '#1e1e1e' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  };

  return (
    <>
      <div className={`chat-container ${isInitialState ? 'centered-layout' : ''}`}>
        
        {/* Chat Area (Empty State or Messages) */}
        {isInitialState ? (
          <div className="empty-state">
            <h2>What would you like to <span style={{backgroundColor: "#41BE4B", color: "#262B24"}}>do?</span></h2>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg) => {
              if (msg.type === 'ai-battle') {
                return (
                  <div key={msg.id} className="battle-message-wrapper">
                    <div className="battle-panel">
                      <div className="assistant-card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div className="assistant-title"><span className="circle-icon"></span> Assistant A</div>
                          {['voice', 'text', 'pdf'].includes(msg.mode) && <AudioPlayer textToSpeak={typeof msg.data.solutionA === 'string' ? msg.data.solutionA : (msg.data.solutionA?.description || msg.data.solutionA?.text)} personality="serious" />}
                        </div>
                        <div className="card-content markdown-body">
                          {msg.mode === 'image' && msg.data.solutionA?.imageUrl && (
                            <div className="image-result" style={{ marginBottom: '12px' }}>
                              <img src={msg.data.solutionA.imageUrl} alt="Result A" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px'}} />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => downloadImage(msg.data.solutionA.imageUrl, 'solution_A.jpg')} style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Download JPG</button>
                                <button onClick={() => downloadImage(msg.data.solutionA.imageUrl, 'solution_A.png')} style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Download PNG</button>
                              </div>
                            </div>
                          )}
                          {msg.mode === 'video' && msg.data.solutionA?.videoUrl && (
                            <div className="video-result model-video" style={{ marginBottom: '12px' }}>
                              <video src={msg.data.solutionA.videoUrl} controls style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px'}} />
                            </div>
                          )}
                          <ReactMarkdown components={MarkdownComponents}>{msg.data.solutionA?.description || msg.data.solutionA?.text || ''}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="assistant-card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div className="assistant-title"><span className="circle-icon"></span> Assistant B</div>
                          {['voice', 'text', 'pdf'].includes(msg.mode) && <AudioPlayer textToSpeak={typeof msg.data.solutionB === 'string' ? msg.data.solutionB : (msg.data.solutionB?.description || msg.data.solutionB?.text)} personality="energetic" />}
                        </div>
                        <div className="card-content markdown-body">
                          {msg.mode === 'image' && msg.data.solutionB?.imageUrl && (
                            <div className="image-result" style={{ marginBottom: '12px' }}>
                              <img src={msg.data.solutionB.imageUrl} alt="Result B" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px'}} />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => downloadImage(msg.data.solutionB.imageUrl, 'solution_B.jpg')} style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Download JPG</button>
                                <button onClick={() => downloadImage(msg.data.solutionB.imageUrl, 'solution_B.png')} style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Download PNG</button>
                              </div>
                            </div>
                          )}
                          {msg.mode === 'video' && msg.data.solutionB?.videoUrl && (
                            <div className="video-result model-video" style={{ marginBottom: '12px' }}>
                              <video src={msg.data.solutionB.videoUrl} controls style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px'}} />
                            </div>
                          )}
                          <ReactMarkdown components={MarkdownComponents}>{msg.data.solutionB?.description || msg.data.solutionB?.text || ''}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    {msg.data.verdict && (
                      <div className="verdict-panel">
                        <div className="verdict-header">
                          <div className="winner-badge">
                            <Trophy size={16} /> Winner: Assistant {msg.data.verdict.winner}
                          </div>
                          <div className="scores-container">
                            <div className="score-badge">Assistant A: <span>{msg.data.verdict.scores.A}/10</span></div>
                            <div className="score-badge">Assistant B: <span>{msg.data.verdict.scores.B}/10</span></div>
                          </div>
                        </div>
                        <div className="verdict-reasoning">
                          <strong>Reasoning:</strong> {msg.data.verdict.reasoning}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`message ${msg.type}-message`}>
                   {msg.type === 'ai' && (
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                       {msg.agent ? `Assistant ${msg.agent}` : 'AI'}
                     </div>
                   )}
                   <div className="message-content">
                     {msg.type === 'user' && msg.mode === 'pdf' ? (
                       <div className="file-preview-card">
                         <FileText size={20} className="file-icon" style={{ color: '#ef4444' }} />
                         <span className="file-name">{msg.text.replace('Analyzing PDF: ', '')}</span>
                       </div>
                     ) : msg.type === 'user' && msg.mode === 'voice' ? (
                       <div className="file-preview-card">
                         <Mic size={20} className="file-icon" style={{ color: '#3b82f6' }} />
                         <span className="file-name">{msg.text.replace('Generating voice for: ', '')}</span>
                       </div>
                     ) : msg.type === 'user' && msg.mode === 'video' ? (
                       <div className="file-preview-card">
                         <Video size={20} className="file-icon" style={{ color: '#a855f7' }} />
                         <span className="file-name">{msg.text.replace('Generating video for: ', '')}</span>
                       </div>
                     ) : msg.mode === 'image' && msg.type === 'ai' ? (
                       <img src={msg.text} alt="AI Generated" style={{maxWidth: '100%', borderRadius: '8px'}} />
                     ) : (
                       msg.type === 'ai' ? <ReactMarkdown className="markdown-body" components={MarkdownComponents}>{msg.text}</ReactMarkdown> : msg.text
                     )}
                   </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-content">Generating...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Block */}
        <div className="chat-input-wrapper">
          <form className="chat-input-box" onSubmit={handleSubmit}>
            {file && !isRecording && (
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
              disabled={isRecording || ((activeMode === 'voice' || activeMode === 'pdf') ? !!file : false)}
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
                  <Paperclip size={18} /> <span style={{marginLeft: '0.5rem'}}>Add files</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    switchMode('voice');
                    startVoiceRecording();
                  }} 
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
                  onClick={() => switchMode('video')} 
                  title="Video Generation Mode"
                  className={activeMode === 'video' ? 'active-mode-btn' : ''}
                >
                  <Video size={18} />
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
                  isRecording ||
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

      {/* Voice Recording Popup */}
      {isRecording && (
        <div className="voice-recorder-overlay">
          <div className="voice-recorder-popup">
            <div className="listening-indicator">
              <div className="pulse-ring"></div>
              <Mic size={48} className="mic-icon" />
            </div>
            <h3>Listening...</h3>
            <p>Speak now, click stop when you're done.</p>
            <button className="stop-btn" onClick={stopVoiceRecording}>
              <CircleStop size={24} /> Stop Recording
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;
