import { useState, useEffect, useCallback, useRef } from 'react';
import { TranslationService } from '@/services/translation';
import { TranslationCache } from '@/utils/cache';

interface UseTranslationProps {
  text: string;           // 要翻译的文本
  fromLang: string;       // 源语言
  toLang: string;         // 目标语言
  onResult?: (text: string) => void;  // 翻译结果回调
  onError?: (error: string) => void;  // 错误回调
}

interface UseTranslationReturn {
  translatedText: string;
  isTranslating: boolean;
  error: string | null;
}

// 防抖延迟时间（毫秒）
const DEBOUNCE_DELAY = 300;

export function useTranslation({
  text,
  fromLang,
  toLang,
  onResult,
  onError,
}: UseTranslationProps): UseTranslationReturn {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用 useRef 保存 service 和 cache 实例，确保它们在组件生命周期内保持不变
  const serviceRef = useRef<TranslationService | null>(null);
  const cacheRef = useRef<TranslationCache | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 初始化翻译服务和缓存
  useEffect(() => {
    try {
      serviceRef.current = new TranslationService();
      cacheRef.current = new TranslationCache();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '翻译服务初始化失败';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  // 执行翻译的核心函数
  const performTranslation = useCallback(async (textToTranslate: string) => {
    if (!textToTranslate.trim()) {
      setTranslatedText('');
      setIsTranslating(false);
      return;
    }

    if (!serviceRef.current || !cacheRef.current) {
      setError('翻译服务未初始化');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      // 检查缓存
      const cachedResult = cacheRef.current.get(
        textToTranslate,
        fromLang,
        toLang,
        serviceRef.current.getModelName()
      );

      if (cachedResult) {
        setTranslatedText(cachedResult);
        onResult?.(cachedResult);
        setIsTranslating(false);
        return;
      }

      // 调用翻译服务
      const result = await serviceRef.current.translate({
        text: textToTranslate,
        fromLang,
        toLang,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // 保存到缓存
      if (result.text) {
        cacheRef.current.set(
          textToTranslate,
          fromLang,
          toLang,
          result.text,
          serviceRef.current.getModelName()
        );
      }

      setTranslatedText(result.text);
      onResult?.(result.text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '翻译失败';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [fromLang, toLang, onResult, onError]);

  // 使用防抖处理翻译请求
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performTranslation(text);
    }, DEBOUNCE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, performTranslation]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    translatedText,
    isTranslating,
    error,
  };
}
