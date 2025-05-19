import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useLipSync } from '../hooks/useLipSync';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Message } from '../types/chat';

interface ChatInterfaceProps {
  clientId: string;
  onLipSyncUpdate?: (lipShape: { a: number; i: number; u: number; e: number; o: number }) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ clientId, onLipSyncUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, lastMessage } = useWebSocket(`ws://localhost:8000/ws/${clientId}`);
  const { playAudio, playAudioStream, stopAudio, isPlaying, currentTime } = useAudioPlayback();
  const { generateLipSyncData, getCurrentLipShape } = useLipSync();
  const { isListening, transcript, startListening, stopListening, error: speechError } = useSpeechRecognition();

  // メッセージの自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 音声認識の結果を入力テキストに反映
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // リップシンクの更新
  useEffect(() => {
    if (isPlaying && onLipSyncUpdate) {
      const lipShape = getCurrentLipShape(currentTime);
      onLipSyncUpdate(lipShape);
    }
  }, [isPlaying, currentTime, getCurrentLipShape, onLipSyncUpdate]);

  // WebSocketメッセージの処理
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage);
      
      switch (message.type) {
        case 'llm_response_chunk':
          setMessages(prev => [...prev, {
            type: 'assistant',
            content: message.payload.text_chunk,
            timestamp: new Date().toISOString()
          }]);
          break;
        
        case 'llm_response_complete':
          // 応答完了時の処理（必要に応じて）
          break;
        
        case 'audio_chunk':
          // リアルタイム音声チャンクの処理
          const audioData = new Float32Array(
            new Uint8Array(
              atob(message.payload.audio)
                .split('')
                .map(c => c.charCodeAt(0))
            ).buffer
          );
          playAudioStream(audioData);
          break;
        
        case 'error_message':
          console.error('Error:', message.payload.message);
          break;
      }
    }
  }, [lastMessage, playAudioStream]);

  // テキスト送信処理
  const handleSendMessage = () => {
    if (inputText.trim()) {
      const message: Message = {
        type: 'user',
        content: inputText,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, message]);
      sendMessage({
        type: 'user_message',
        payload: {
          text: inputText,
          session_id: clientId
        }
      });
      
      setInputText('');
      if (isListening) {
        stopListening();
      }
    }
  };

  // 音声入力処理
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      {/* エラーメッセージ表示 */}
      {speechError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {speechError}
        </div>
      )}

      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isListening ? "音声認識中..." : "メッセージを入力..."}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleVoiceInput}
          className={`p-2 rounded-lg ${
            isListening ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
          title={isListening ? "音声入力を停止" : "音声入力を開始"}
        >
          🎤
        </button>
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          送信
        </button>
      </div>
    </div>
  );
}; 