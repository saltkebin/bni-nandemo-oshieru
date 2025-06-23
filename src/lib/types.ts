// BNI選択オプション
export type BNISelectOption = 'BNI全般' | 'SILVISチャプター' | 'エデュケーション何でも教える君';

// チャットメッセージの型
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  isLoading?: boolean;
  isOpener?: boolean;
}

// Dify APIリクエストの型
export interface DifyApiRequest {
  query: string;
  select: BNISelectOption;
  conversation_id?: string;
  user?: string;
}

// Dify APIレスポンスイベントの型
export interface DifyStreamEvent {
  event: 'message' | 'workflow_started' | 'workflow_finished' | 'error';
  conversation_id?: string;
  answer?: string;
  message?: string;
  error?: string;
}

// チャット状態の型
export interface ChatState {
  messages: ChatMessage[];
  currentSelect: BNISelectOption;
  conversationId: string;
  isLoading: boolean;
  error: string | null;
}