import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { useMobileNavigation } from '../hooks/useMobileNavigation.js';
import Sidebar from '../components/Sidebar.jsx';
import NoChatSelected from '../components/NoChatSelected.jsx';
import ChatContainer from '../components/ChatContainer.jsx';

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle native Android & Browser back button navigation
  useMobileNavigation(isMobile);

  return (
    <div className='h-[100dvh] w-full bg-base-200 overflow-hidden flex flex-col'>
      {/* Mobile & Tablet Mode (< 1024px): Full-Screen Single Pane (WhatsApp Pattern) */}
      {isMobile ? (
        <div className='flex-1 w-full h-[100dvh] flex flex-col bg-base-100 overflow-hidden relative'>
          {!selectedUser ? (
            <Sidebar isMobile={true} />
          ) : (
            <div className='w-full h-full flex flex-col overflow-hidden'>
              <ChatContainer />
            </div>
          )}
        </div>
      ) : (
        /* Desktop Mode (>= 1024px): Dual Pane Side-by-Side Layout */
        <div className='flex-1 flex items-center justify-center pt-20 px-4 pb-4 h-full'>
          <div className='bg-base-100 rounded-2xl shadow-xl w-full max-w-7xl h-[calc(100vh-7rem)] flex overflow-hidden border border-base-300'>
            <div className='w-80 flex flex-col h-full shrink-0 border-r border-base-300'>
              <Sidebar isMobile={false} />
            </div>
            <div className='flex-1 h-full flex flex-col min-w-0'>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
