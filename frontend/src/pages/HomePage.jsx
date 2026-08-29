import React from 'react'
import { useChatStore } from '../store/useChatStore.js'
import Sidebar from '../components/Sidebar.jsx'
import NoChatSelected from '../components/NoChatSelected.jsx'
import ChatContainer from '../components/ChatContainer.jsx'

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className='h-screen bg-base-200 overflow-hidden'>
      <div className='flex items-center justify-center pt-16 md:pt-20 px-0 md:px-4 h-full'>
        <div className='bg-base-100 md:rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100vh-4rem)] md:h-[calc(100vh-7rem)]'>
          <div className='flex h-full md:rounded-2xl overflow-hidden relative'>
            {/* Sidebar Container */}
            <div className={`w-full md:w-80 md:flex flex-col h-full shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
              <Sidebar />
            </div>

            {/* Main Chat / No Chat Container */}
            <div className={`flex-1 h-full flex flex-col min-w-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
