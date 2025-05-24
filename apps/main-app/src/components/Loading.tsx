import React from 'react';

interface LoadingProps {
  appName: string;
  tip?: string;
}

export const Loading: React.FC<LoadingProps> = ({ appName, tip }) => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
      }}
    >
      <div className="loading-spinner"></div>
      <div style={{ marginTop: '16px' }}>
        {tip || `正在加载 ${appName}`}
      </div>
      <style>
        {`
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
