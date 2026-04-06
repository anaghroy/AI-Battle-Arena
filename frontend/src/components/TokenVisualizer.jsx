import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useTokenStream from '../hooks/useTokenStream';

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
};

const TokenVisualizer = ({ msgId, text, isNew = false }) => {
  const { displayedText, isComplete } = useTokenStream(msgId, text, isNew ? 15 : 0);

  return (
    <>
      <style>
        {`
          .streaming-active {
            position: relative;
            animation: textGlow 1.5s infinite alternate;
          }
          
          @keyframes textGlow {
            0% { text-shadow: 0 0 2px rgba(65, 190, 75, 0.1); }
            100% { text-shadow: 0 0 8px rgba(65, 190, 75, 0.4); }
          }
        `}
      </style>
      <div 
        className={`token-visualizer-wrapper ${!isComplete ? 'streaming-active' : ''}`}
        style={{
          transition: "border-left 0.3s ease, padding-left 0.3s ease",
          borderLeft: !isComplete ? "2px solid rgba(65, 190, 75, 0.6)" : "2px solid transparent",
          paddingLeft: !isComplete ? "12px" : "0px",
          width: '100%'
        }}
      >
        <ReactMarkdown 
          components={MarkdownComponents} 
          remarkPlugins={[remarkGfm]}
        >
          {isComplete ? text : displayedText + ' ▋'}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default TokenVisualizer;
