export async function POST(request: Request) {
  try {
    const req = await request.json();
    console.log('🔥 API Request received:', req);

    const DIFY_APP_API_BASE_URL = process.env.DIFY_APP_API_BASE_URL;
    const DIFY_APP_API_KEY = process.env.DIFY_APP_API_KEY;

    console.log('🔧 Environment check:', {
      hasBaseUrl: !!DIFY_APP_API_BASE_URL,
      hasApiKey: !!DIFY_APP_API_KEY,
      baseUrl: DIFY_APP_API_BASE_URL
    });

    if (!DIFY_APP_API_BASE_URL || !DIFY_APP_API_KEY) {
      console.error('❌ Dify API configuration is missing');
      throw new Error('Dify API configuration is missing');
    }

    // Dify APIのリクエスト形式に合わせてデータを構築
    const requestData = {
      inputs: {
        select: req.select || 'BNI全般' // デフォルト値を設定
      },
      query: req.query || req.message || '',
      response_mode: 'streaming',
      conversation_id: req.conversation_id || '',
      user: req.user || `user-${Date.now()}`
    };

    console.log('📤 Sending request to Dify:', {
      url: `${DIFY_APP_API_BASE_URL}/chat-messages`,
      requestData: {
        ...requestData,
        // APIキーをログに出力しない
        inputs: requestData.inputs
      }
    });

    const response = await fetch(`${DIFY_APP_API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_APP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('📥 Dify API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Dify API error:', errorData);
      
      // 404エラーの場合、conversation_idをリセットして再試行
      if (response.status === 404 && errorData.code === 'not_found' && req.conversation_id) {
        console.log('🔄 Conversation not found, retrying without conversation_id...');
        
        const retryRequestData = {
          ...requestData,
          conversation_id: '' // conversation_idをリセット
        };
        
        const retryResponse = await fetch(`${DIFY_APP_API_BASE_URL}/chat-messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DIFY_APP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(retryRequestData)
        });
        
        console.log('📥 Retry response status:', retryResponse.status);
        
        if (retryResponse.ok && retryResponse.body) {
          return new Response(retryResponse.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          });
        }
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body from Dify API');
    }

    // ストリーミングレスポンスをそのまま返す
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error in chat-messages route:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// OPTIONSメソッドもサポート（CORS対応）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}