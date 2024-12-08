import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  language: string;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useSpeechRecognition({
  language,
  onResult,
  onError,
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // 初始化语音识别
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('您的浏览器不支持语音识别功能');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    setRecognition(recognition);

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // 设置语音识别的语言
  useEffect(() => {
    if (recognition) {
      recognition.lang = language;
    }
  }, [language, recognition]);

  // 配置语音识别事件处理
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      if (event.results[event.results.length - 1].isFinal) {
        onResult?.(result);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = '语音识别出错';
      switch (event.error) {
        case 'network':
          errorMessage = '网络连接出错';
          break;
        case 'not-allowed':
          errorMessage = '请允许使用麦克风';
          break;
        case 'no-speech':
          errorMessage = '未检测到语音';
          break;
      }
      setError(errorMessage);
      onError?.(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [recognition, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      setError('启动语音识别失败');
      onError?.('启动语音识别失败');
    }
  }, [recognition, onError]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
  }, [recognition]);

  return {
    isListening,
    startListening,
    stopListening,
    error,
  };
}
