'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { PiBroomLight } from 'react-icons/pi'
import { TiMessages } from 'react-icons/ti'
import ReactMarkdown from 'react-markdown'
import useAudioRecorder from '../../../utils/hooks/useAudioRecorder'
import AudioVisualizer from '../audio-visualizer/AudioVisualizer'
import { greetings } from '../../../utils/data/greetings'
import { CiMicrophoneOn } from 'react-icons/ci'

const ThinkingDots = () => {
  return (
    <span className="flex items-center gap-2 text-gray-400 font-medium">
      <span className="relative inline-block perspective">
        <span className="inline-block text-lg">⏳</span>
      </span>
      <span>Thinking</span>
      <span className="dot">.</span>
      <span className="dot delay-150">.</span>
      <span className="dot delay-300">.</span>

      <style jsx>{`
        .dot {
          animation: blink 1.5s infinite;
        }

        .delay-150 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%,
          80%,
          100% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
        }

        .perspective {
          perspective: 600px;
        }
      `}</style>
    </span>
  )
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [error, setError] = useState(false)
  const chatContainerRef = useRef(null)
  const [userId, setUserId] = useState('')
  const {
    startRecording,
    stopRecording,
    isRecording,
    audioContext,
    sourceNode,
  } = useAudioRecorder({})

  useEffect(() => {
    let storedId = localStorage.getItem('chat_user_id')
    if (!storedId) {
      const randomPart = Math.random().toString(36).substring(2, 8)
      storedId = `${Date.now()}_${randomPart}`
      localStorage.setItem('chat_user_id', storedId)
    }
    setUserId(storedId)
  }, [])

  useEffect(() => {
    const storedChat = localStorage.getItem('chat_history')
    if (storedChat) {
      setChat(JSON.parse(storedChat))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(chat))
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chat])

  useEffect(() => {
    if (isOpen && chat.length > 0) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight
        }
      }, 0)
    }
  }, [isOpen, chat.length])

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

  const toggleChat = () => {
    if (isOpen) {
      sendChatToTelegram()
    } else {
      if (chat.length === 0) {
        const greeting = greetings[Math.floor(Math.random() * greetings.length)]
        const now = new Date()
        setChat([
          {
            role: 'assistant',
            text: greeting,
            timestamp: now,
          },
        ])
      }
    }
    setIsOpen((prev) => !prev)
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    const now = new Date()
    const currentMessage = message
    setMessage('')
    setError(false)

    const key = `chat_${Date.now()}`

    const userMsg = { role: 'user', text: currentMessage, timestamp: now }
    const loadingMsg = {
      role: 'assistant',
      isThinking: true,
      timestamp: now,
    }

    setChat((prev) => [...prev, userMsg, loadingMsg])

    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight
      }
    }, 50)

    try {
      const response = await fetch('/api/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage, key, userId }),
      })

      const data = await response.json()

      setChat((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: data.reply || '🤖 Got your message!',
          timestamp: new Date(),
        }
        return updated
      })
    } catch (err) {
      console.error('Send failed:', err)
      setError(true)
      setChat((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: 'Error receiving response.',
          timestamp: new Date(),
        }
        return updated
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setChat([])
    localStorage.removeItem('chat_history')
  }

  const sendChatToTelegram = async () => {
    try {
      await fetch('/api/send-chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    } catch (err) {
      console.error('Telegram send failed:', err.message)
    }
  }

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.text) {
        setMessage(data.text)
      } else {
        console.warn('No transcription result')
      }
    } catch (err) {
      console.error('Failed to send audio:', err)
    }
  }

  const handleMicClick = async () => {
    if (!isRecording) {
      await startRecording()
    } else {
      const audioBlob = await stopRecording()
      if (audioBlob) {
        // const url = URL.createObjectURL(audioBlob)
        // const audio = new Audio(url)
        // audio.play()
        await sendAudioToServer(audioBlob)
      }
    }
  }

  return (
    <>
      <button
        onClick={toggleChat}
        className={`fixed bottom-32 right-6 z-60 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-600 p-4 text-white shadow-xl hover:brightness-110 transition ${
          isOpen ? 'animate-none' : 'animate-pulseCustom'
        }`}
      >
        <div className={`relative ${!isOpen ? 'animate-shakeCustom' : ''}`}>
          {isOpen ? <FiX size={24} /> : <TiMessages size={24} />}
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-24 z-50 w-[90%] sm:w-[320px] rounded-xl border border-neutral-700 p-4 shadow-xl text-white bg-gradient-to-r from-[#0d1224] to-[#0a0d37]">
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="flex  flex-row items-center gap-3 w-[80%] mb-4 rounded-xl border border-neutral-700 pl-[10px] pr-[10px] py-1 shadow-xl">
              <Image
                src="/assistant.svg"
                alt="bot avatar"
                width={38}
                height={38}
                className="rounded-full"
              />
              {!isRecording && (
                <p className="text-m text-gray-400">I&apos;m here to help!</p>
              )}
              {isRecording && (
                <div className="w-full h-[30px] mr-[10px] flex flex-row items-center justify-center">
                  <AudioVisualizer
                    audioContext={audioContext}
                    sourceNode={sourceNode}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-row items-center gap-3 mb-4 rounded-xl border border-neutral-700 px-4 py-3 shadow-xl">
              <button
                onClick={clearChat}
                className="text-gray-400 hover:text-pink-400 transition"
              >
                <PiBroomLight size={24} />
              </button>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex flex-col h-64 overflow-y-auto pr-3 text-sm mb-2 space-y-3 custom-scroll"
          >
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-2 rounded-md overflow-hidden break-words ${
                    msg.role === 'user'
                      ? 'bg-pink-600 text-white'
                      : 'bg-[#221A4A] text-gray-200'
                  }`}
                >
                  {msg.isThinking ? (
                    <ThinkingDots />
                  ) : (
                    <div className="prose prose-invert text-sm font-extralight">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {msg.role === 'user' ? 'Guest' : 'Portfolio Assistant'} ·{' '}
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))}
            {error && (
              <p className="text-red-400 text-xs">
                Something went wrong. Try again.
              </p>
            )}
          </div>

          <div className="relative w-full">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              rows={1}
              className="w-full min-h-[40px] bg-[#221A4A] rounded-md border border-neutral-700 px-3 py-2 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 custom-scroll"
            />
            {message.trim().length === 0 && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute right-4 top-[7px] transition ${
                  isRecording
                    ? 'text-white animate-pulse-mic'
                    : 'text-gray-400 hover:text-pink-400'
                }`}
              >
                <CiMicrophoneOn size={24} className="text-inherit" />
              </button>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="mt-3 w-full rounded-md bg-gradient-to-r from-pink-500 to-violet-600 py-2 px-4 text-white font-semibold hover:brightness-110 transition"
          >
            Send
          </button>
        </div>
      )}

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #8b5cf6);
          border-radius: 10px;
        }

        @keyframes pulse-mic {
          0% {
            color: white;
          }
          50% {
            color: #ec4899;
          }
          100% {
            color: white;
          }
        }

        .animate-pulse-mic {
          animation: pulse-mic 2s infinite;
        }
      `}</style>
    </>
  )
}

export default ChatWidget

// 'use client'

// import Image from 'next/image'
// import { useEffect, useRef, useState } from 'react'
// import { FiX } from 'react-icons/fi'
// import { PiBroomLight } from 'react-icons/pi'
// import { TiMessages } from 'react-icons/ti'
// import ReactMarkdown from 'react-markdown'
// import { greetings } from '../../../utils/data/greetings'

// const ThinkingDots = () => {
//   return (
//     <span className="flex items-center gap-2 text-gray-400 font-medium">
//       <span className="relative inline-block perspective">
//         <span className="inline-block text-lg">⏳</span>
//       </span>
//       <span>Thinking</span>
//       <span className="dot">.</span>
//       <span className="dot delay-150">.</span>
//       <span className="dot delay-300">.</span>

//       <style jsx>{`
//         .dot {
//           animation: blink 1.5s infinite;
//         }

//         .delay-150 {
//           animation-delay: 0.2s;
//         }

//         .delay-300 {
//           animation-delay: 0.4s;
//         }

//         @keyframes blink {
//           0%,
//           80%,
//           100% {
//             opacity: 0;
//           }
//           40% {
//             opacity: 1;
//           }
//         }

//         .perspective {
//           perspective: 600px;
//         }
//       `}</style>
//     </span>
//   )
// }

// const ChatWidget = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [message, setMessage] = useState('')
//   const [chat, setChat] = useState([])
//   const [error, setError] = useState(false)
//   const chatContainerRef = useRef(null)
//   const [userId, setUserId] = useState('')

//   useEffect(() => {
//     let storedId = localStorage.getItem('chat_user_id')
//     if (!storedId) {
//       const randomPart = Math.random().toString(36).substring(2, 8)
//       storedId = `${Date.now()}_${randomPart}`
//       localStorage.setItem('chat_user_id', storedId)
//     }
//     setUserId(storedId)
//   }, [])

//   useEffect(() => {
//     const storedChat = localStorage.getItem('chat_history')
//     if (storedChat) {
//       setChat(JSON.parse(storedChat))
//     }
//   }, [])

//   useEffect(() => {
//     localStorage.setItem('chat_history', JSON.stringify(chat))
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
//     }
//   }, [chat])

//   useEffect(() => {
//     if (isOpen && chat.length > 0) {
//       setTimeout(() => {
//         if (chatContainerRef.current) {
//           chatContainerRef.current.scrollTop =
//             chatContainerRef.current.scrollHeight
//         }
//       }, 0)
//     }
//   }, [isOpen, chat.length])

//   const formatTime = (timestamp) =>
//     new Date(timestamp).toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     })

//   const toggleChat = () => {
//     if (isOpen) {
//       sendChatToTelegram()
//     } else {
//       if (chat.length === 0) {
//         const greeting = greetings[Math.floor(Math.random() * greetings.length)]
//         const now = new Date()
//         setChat([
//           {
//             role: 'assistant',
//             text: greeting,
//             timestamp: now,
//           },
//         ])
//       }
//     }
//     setIsOpen((prev) => !prev)
//   }

//   const sendMessage = async () => {
//     if (!message.trim()) return

//     const now = new Date()
//     const currentMessage = message
//     setMessage('')
//     setError(false)

//     const key = `chat_${Date.now()}`

//     const userMsg = { role: 'user', text: currentMessage, timestamp: now }
//     const loadingMsg = {
//       role: 'assistant',
//       isThinking: true,
//       timestamp: now,
//     }

//     setChat((prev) => [...prev, userMsg, loadingMsg])

//     setTimeout(() => {
//       if (chatContainerRef.current) {
//         chatContainerRef.current.scrollTop =
//           chatContainerRef.current.scrollHeight
//       }
//     }, 50)

//     try {
//       const response = await fetch('/api/firebase', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: currentMessage, key, userId }),
//       })

//       const data = await response.json()

//       setChat((prev) => {
//         const updated = [...prev]
//         updated[updated.length - 1] = {
//           role: 'assistant',
//           text: data.reply || '🤖 Got your message!',
//           timestamp: new Date(),
//         }
//         return updated
//       })
//     } catch (err) {
//       console.error('Send failed:', err)
//       setError(true)
//       setChat((prev) => {
//         const updated = [...prev]
//         updated[updated.length - 1] = {
//           role: 'assistant',
//           text: 'Error receiving response.',
//           timestamp: new Date(),
//         }
//         return updated
//       })
//     }
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   const clearChat = () => {
//     setChat([])
//     localStorage.removeItem('chat_history')
//   }

//   const sendChatToTelegram = async () => {
//     try {
//       await fetch('/api/send-chat-history', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId }),
//       })
//     } catch (err) {
//       console.error('Telegram send failed:', err.message)
//     }
//   }

//   return (
//     <>
//       <button
//         onClick={toggleChat}
//         className={`fixed bottom-32 right-6 z-60 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-600 p-4 text-white shadow-xl hover:brightness-110 transition ${
//           isOpen ? 'animate-none' : 'animate-pulseCustom'
//         }`}
//       >
//         <div className={`relative ${!isOpen ? 'animate-shakeCustom' : ''}`}>
//           {isOpen ? <FiX size={24} /> : <TiMessages size={24} />}
//         </div>
//       </button>

//       {isOpen && (
//         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-24 z-50 w-[90%] sm:w-[320px] rounded-xl border border-neutral-700 p-4 shadow-xl text-white bg-gradient-to-r from-[#0d1224] to-[#0a0d37]">
//           <div className="flex flex-row justify-between items-center gap-2">
//             <div className="flex  flex-row items-center gap-3 w-[80%] mb-4 rounded-xl border border-neutral-700 pl-[10px] pr-[10px] py-1 shadow-xl">
//               <Image
//                 src="/assistant.svg"
//                 alt="bot avatar"
//                 width={38}
//                 height={38}
//                 className="rounded-full"
//               />
//               <p className="text-m text-gray-400">I&apos;m here to help!</p>
//             </div>
//             <div className="flex flex-row items-center gap-3 mb-4 rounded-xl border border-neutral-700 px-4 py-3 shadow-xl">
//               <button
//                 onClick={clearChat}
//                 className="text-gray-400 hover:text-pink-400 transition"
//               >
//                 <PiBroomLight size={24} />
//               </button>
//             </div>
//           </div>

//           <div
//             ref={chatContainerRef}
//             className="flex flex-col h-64 overflow-y-auto pr-3 text-sm mb-2 space-y-3 custom-scroll"
//           >
//             {chat.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex flex-col ${
//                   msg.role === 'user' ? 'items-end' : 'items-start'
//                 }`}
//               >
//                 <div
//                   className={`max-w-[85%] p-2 rounded-md overflow-hidden break-words ${
//                     msg.role === 'user'
//                       ? 'bg-pink-600 text-white'
//                       : 'bg-[#221A4A] text-gray-200'
//                   }`}
//                 >
//                   {msg.isThinking ? (
//                     <ThinkingDots />
//                   ) : (
//                     <div className="prose prose-invert text-sm font-extralight">
//                       <ReactMarkdown
//                         components={{
//                           a: ({ node, ...props }) => (
//                             <a
//                               {...props}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             />
//                           ),
//                         }}
//                       >
//                         {msg.text}
//                       </ReactMarkdown>
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 mt-1">
//                   {msg.role === 'user' ? 'Guest' : 'Portfolio Assistant'} ·{' '}
//                   {formatTime(msg.timestamp)}
//                 </div>
//               </div>
//             ))}
//             {error && (
//               <p className="text-red-400 text-xs">
//                 Something went wrong. Try again.
//               </p>
//             )}
//           </div>

//           <textarea
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask something..."
//             rows={1}
//             className="w-full min-h-[40px] bg-[#221A4A] rounded-md border border-neutral-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 custom-scroll"
//           />
//           <button
//             onClick={sendMessage}
//             disabled={!message.trim()}
//             className="mt-3 w-full rounded-md bg-gradient-to-r from-pink-500 to-violet-600 py-2 px-4 text-white font-semibold hover:brightness-110 transition"
//           >
//             Send
//           </button>
//         </div>
//       )}

//       <style jsx>{`
//         .custom-scroll::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scroll::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scroll::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #ec4899, #8b5cf6);
//           border-radius: 10px;
//         }
//       `}</style>
//     </>
//   )
// }

// export default ChatWidget;