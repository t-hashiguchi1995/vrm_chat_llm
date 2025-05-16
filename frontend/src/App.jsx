import React, { useState, useEffect } from 'react';

function App() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws');
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [
          ...prev,
          { sender: 'server', text: data.payload && data.payload.text ? data.payload.text : 'Unknown message' }
        ]);
      } catch (error) {
        console.error('Error parsing message', error);
      }
    };
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    setWs(socket);
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input.trim() !== '') {
      const message = {
        type: 'user_message',
        payload: { text: input }
      };
      ws.send(JSON.stringify(message));
      setMessages(prev => [...prev, { sender: 'user', text: input }]);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>VRMキャラクターチャットシステム</h1>
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender === 'user' ? 'あなた' : 'アバター'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: '80%', padding: '8px' }}
        />
        <button onClick={sendMessage} style={{ padding: '8px 16px', marginLeft: '10px' }}>送信</button>
      </div>
    </div>
  );
}

export default App;