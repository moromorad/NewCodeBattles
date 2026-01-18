import { useState, useEffect } from 'react'
import { useSocket } from './hooks/useSocket'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

interface TestMessage {
  id: string
  from: string
  message: string
  timestamp: Date
}

function App() {
  const { socket, connected } = useSocket()
  const [messages, setMessages] = useState<TestMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [clientName, setClientName] = useState(`Computer-${Math.floor(Math.random() * 1000)}`)

  useEffect(() => {
    if (!socket) return

    // Listen for test messages from other clients
    const handleTestMessage = (data: { from: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          from: data.from,
          message: data.message,
          timestamp: new Date(),
        },
      ])
    }

    socket.on('test_message', handleTestMessage)

    return () => {
      socket.off('test_message', handleTestMessage)
    }
  }, [socket])

  const sendTestMessage = () => {
    if (socket?.connected && inputMessage.trim()) {
      socket.emit('test_message', {
        from: clientName,
        message: inputMessage,
      })
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendTestMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Ngrok Connection Test</h1>
        
        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-lg font-semibold">
              {connected ? 'Connected ✓' : 'Disconnected ✗'}
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            <p>Server URL: <code className="text-gray-300">{SOCKET_URL}</code></p>
            <p>Client Name: <code className="text-gray-300">{clientName}</code></p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <h2 className="font-semibold mb-2">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Open this page on multiple computers/devices</li>
            <li>Each computer will have a unique name (e.g., Computer-123)</li>
            <li>Type a message and press Enter - it will appear on all connected computers</li>
            <li>If messages appear on other screens, your ngrok connection is working!</li>
          </ol>
        </div>

        {/* Messages Display */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Messages from All Computers:</h2>
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No messages yet. Send a test message to see it here!
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-gray-700 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-400">{msg.from}</span>
                    <span className="text-xs text-gray-400">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-200">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a test message and press Enter..."
            disabled={!connected}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendTestMessage}
            disabled={!connected || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>

        {/* Connection Test Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              if (socket?.connected) {
                socket.emit('test_message', {
                  from: clientName,
                  message: '🔔 Test ping from ' + clientName,
                })
              }
            }}
            disabled={!connected}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send Test Ping
          </button>
        </div>
      </div>
    </div>
  )
}

export default App