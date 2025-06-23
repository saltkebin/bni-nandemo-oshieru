'use client';

import { useState, useRef, useEffect } from 'react';
import { BNISelectOption, ChatMessage, DifyStreamEvent } from '@/lib/types';
import SelectForm from './SelectForm';

export default function ChatInterface() {
  const [currentSelect, setCurrentSelect] = useState<BNISelectOption>('BNI全般');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // メッセージリストの自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // select変更時の処理
  const handleSelectChange = (newSelect: BNISelectOption) => {
    if (newSelect !== currentSelect && messages.length > 0) {
      // 新しいスレッドを開始
      setCurrentSelect(newSelect);
      setMessages([]);
      setConversationId('');
      setError(null);
    } else {
      setCurrentSelect(newSelect);
    }
  };

  // 初期画面に戻る
  const resetToInitial = () => {
    setShowChat(false);
    setMessages([]);
    setConversationId('');
    setError(null);
    setIsLoading(false);
    setInputMessage('');
  };

  // チャット開始
  const startChat = () => {
    console.log('startChat called - showing opener message only');
    setShowChat(true);
    // オープナーメッセージのみを表示（APIコールは行わない）
    const openerMessage: ChatMessage = {
      id: 'opener',
      type: 'assistant',
      message: `こんにちは！BNI何でも教える君です。\n\n${currentSelect}に関するご質問にお答えします。\nBNIのルールや規定、チャプター運営について何でもお気軽にお聞きください。`,
      timestamp: new Date(),
      isOpener: true
    };
    setMessages([openerMessage]);
    // 確実にローディング状態をリセット
    setIsLoading(false);
    setError(null);
  };

  // メッセージ送信
  const sendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message,
      timestamp: new Date()
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      message: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dify/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          select: currentSelect,
          conversation_id: conversationId,
          user: `user-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      console.log('🔄 Starting to read streaming response...');
      let decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ Stream reading completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        console.log('📊 Received lines:', lines);

        for (const line of lines) {
          console.log('📝 Processing line:', line);
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6);
              console.log('🔍 Parsing JSON:', jsonData);
              const eventData: DifyStreamEvent = JSON.parse(jsonData);
              console.log('📋 Event data:', eventData);
              
              switch (eventData.event) {
                case 'message':
                  console.log('💬 Message event:', eventData.answer);
                  if (eventData.answer) {
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantMessage.id
                          ? { ...msg, message: msg.message + eventData.answer, isLoading: false }
                          : msg
                      )
                    );
                  }
                  break;
                  
                case 'workflow_started':
                  console.log('🚀 Workflow started:', eventData.conversation_id);
                  if (eventData.conversation_id) {
                    setConversationId(eventData.conversation_id);
                  }
                  break;
                  
                case 'workflow_finished':
                  console.log('✅ Workflow finished');
                  setIsLoading(false);
                  break;
                  
                case 'error':
                  console.error('❌ Error event:', eventData.error);
                  throw new Error(eventData.error || 'Unknown error');
                  
                default:
                  console.log('🔄 Other event:', eventData.event, eventData);
              }
            } catch (e) {
              console.error('❌ Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Conversation not found エラーの場合、conversation_idをリセット
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('Conversation Not Exists')) {
        console.log('🔄 Resetting conversation_id due to conversation not found error');
        setConversationId('');
        setError('会話セッションが無効になりました。新しい会話を開始します。');
      } else {
        setError(errorMessage || 'メッセージの送信中にエラーが発生しました');
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id
            ? { ...msg, message: 'エラーが発生しました。もう一度お試しください。', isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Enterキーでの送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-bni-primary mb-2">
              BNI何でも教える君
            </h1>
            <p className="text-gray-600">
              BNIに関するご質問にお答えします
            </p>
          </div>
          
          <SelectForm
            selectedOption={currentSelect}
            onSelect={handleSelectChange}
          />
          
          <div className="mt-6 text-center">
            <button
              onClick={startChat}
              className="px-6 py-3 bg-bni-primary text-white rounded-lg hover:bg-bni-secondary transition-colors"
            >
              チャットを開始
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetToInitial}
              className="flex items-center space-x-2 px-3 py-2 text-bni-primary hover:bg-green-50 rounded-lg transition-colors"
              title="初期画面に戻る"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              <span className="text-sm font-medium">ホーム</span>
            </button>
            <h1 className="text-xl font-semibold text-bni-primary">
              BNI何でも教える君
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            現在のカテゴリ: <span className="font-medium">{currentSelect}</span>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 mx-4 mt-4 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-bni-primary text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {message.message}
                  {message.isLoading && (
                    <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1">▋</span>
                  )}
                </p>
                {message.isOpener && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => sendMessage('はじめる')}
                      className="px-6 py-3 bg-bni-primary text-white rounded-lg hover:bg-bni-secondary transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      はじめる
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力してください..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-bni-primary focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-3 bg-bni-primary text-white rounded-lg hover:bg-bni-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              送信
            </button>
          </div>
          
          {/* カテゴリ変更ボタン */}
          <div className="mt-2 text-center">
            <button
              onClick={() => setShowChat(false)}
              className="text-sm text-gray-500 hover:text-bni-primary"
            >
              カテゴリを変更する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}