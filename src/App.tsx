import React, { useState, useRef, useEffect } from 'react';
import { Mic, VolumeX, Volume2, FlipVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSheet } from '@/components/settings-sheet';
import { OrientationLock } from '@/components/orientation-lock';
import { useOrientation } from '@/hooks/useOrientation';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTranslation } from '@/hooks/useTranslation';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';

interface LanguageButtonProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const BearChat = () => {
  const isPortrait = useOrientation();
  const [inputLanguage, setInputLanguage] = useState('zh');
  const [targetLanguage, setTargetLanguage] = useState('ja');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 初始化默认设置
  const defaultSettings = {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo',
    apiKey: '',
  };

  const [translationSettings, setTranslationSettings] = useState(defaultSettings);

  // 加载设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('bearchat-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const settings = {
          baseUrl: parsed.baseUrl || defaultSettings.baseUrl,
          modelName: parsed.modelName || defaultSettings.modelName,
          apiKey: parsed.apiKey ? decrypt(parsed.apiKey) : '',
        };

        // 验证设置
        if (!settings.baseUrl || !settings.modelName) {
          throw new Error('Invalid settings');
        }
        try {
          new URL(settings.baseUrl);
        } catch {
          throw new Error('Invalid base URL');
        }

        setTranslationSettings(settings);
      }
    } catch (error) {
      console.error('Failed to load settings, using defaults:', error);
      setTranslationSettings(defaultSettings);
    }
  }, []);

  const { playStartTone, playEndTone } = useAudioFeedback();

  const inputRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // 语音识别
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    language: inputLanguage === 'zh' ? 'zh-CN' : 'en-US',
    onResult: text => {
      setInputText(text);
    },
    onError: err => {
      setError(`语音识别错误: ${err}`);
    },
  });

  // 翻译
  const { translatedText, isTranslating } = useTranslation({
    text: inputText,
    fromLang: inputLanguage,
    toLang: targetLanguage,
    settings: translationSettings,
    onError: err => {
      setError(`翻译错误: ${err}`);
    },
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      playEndTone();
    } else {
      startListening();
      playStartTone();
    }
  };

  const LanguageButton = ({
    value,
    selected,
    onClick,
    children,
    className = '',
  }: LanguageButtonProps) => (
    <Button
      variant={selected ? 'default' : 'outline'}
      onClick={onClick}
      className={`
        w-20 
        ${selected ? 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100 border-zinc-300'} 
        ${className}
      `}
    >
      {children}
    </Button>
  );

  const TargetLanguageButtons = ({ isFlipped }: { isFlipped: boolean }) => {
    const buttons = [
      { value: 'ja', label: '日本語' },
      { value: 'ko', label: '한국어' },
      { value: 'th', label: 'ไทย' },
      { value: 'vi', label: 'Tiếng Việt' },
    ];

    return (
      <div
        className={`w-28 bg-zinc-100 p-4 flex flex-col gap-3 ${isFlipped ? 'flex-col-reverse' : 'flex-col'}`}
      >
        {buttons.map(button => (
          <LanguageButton
            key={button.value}
            value={button.value}
            selected={targetLanguage === button.value}
            onClick={() => setTargetLanguage(button.value)}
            className={isFlipped ? 'rotate-180' : ''}
          >
            {button.label}
          </LanguageButton>
        ))}
      </div>
    );
  };

  // 添加自动滚动效果
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  }, [inputText]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [translatedText]);

  return (
    <>
      {!isPortrait ? (
        <OrientationLock />
      ) : (
        <div className="h-full w-full flex flex-col relative bg-zinc-50">
          {/* Brand Header */}
          <div
            className={`w-full p-3 bg-zinc-900 text-zinc-50 flex justify-between items-center ${isFlipped ? 'rotate-180' : ''}`}
          >
            <h1 className="text-xl font-mono tracking-wider uppercase text-zinc-100 font-light">
              Bear<span className="ml-[2px] text-zinc-400">Chat</span>
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800"
            >
              <FlipVertical size={20} />
            </Button>
          </div>

          {/* Main Content Area - Exactly half height each */}
          <div className="flex-1 flex flex-col">
            {/* Target Language Area (Top Half) */}
            <div className="h-1/2 flex">
              {/* Target Language Buttons - Switches sides when flipped */}
              {isFlipped && <TargetLanguageButtons isFlipped={true} />}

              {/* Main Text Area */}
              <div className={`flex-1 bg-white p-6 ${isFlipped ? 'rotate-180' : ''}`}>
                <div className="relative h-[calc(100%-1.5rem)]">
                  <div
                    ref={outputRef}
                    className="absolute inset-0 text-base text-zinc-800 overflow-y-auto overflow-x-hidden"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {isTranslating ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">正在翻译...</span>
                        <div className="animate-pulse h-2 w-2 bg-zinc-400 rounded-full"></div>
                        <div
                          className="animate-pulse h-2 w-2 bg-zinc-400 rounded-full"
                          style={{ animationDelay: '200ms' }}
                        ></div>
                        <div
                          className="animate-pulse h-2 w-2 bg-zinc-400 rounded-full"
                          style={{ animationDelay: '400ms' }}
                        ></div>
                      </div>
                    ) : (
                      translatedText || (
                        <span className="text-zinc-400">
                          {targetLanguage === 'ja'
                            ? 'こんにちは、話してください'
                            : targetLanguage === 'ko'
                              ? '안녕하세요, 말씀해 주세요'
                              : targetLanguage === 'th'
                                ? 'สวัสดี โปรดพูด'
                                : targetLanguage === 'vi'
                                  ? 'Xin chào, hãy nói'
                                  : 'Hello, please speak'}
                        </span>
                      )
                    )}
                  </div>
                  {error && (
                    <div className="absolute bottom-0 left-0 right-0 mt-2 text-sm text-red-500 bg-white">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Target Language Buttons - Original position */}
              {!isFlipped && <TargetLanguageButtons isFlipped={false} />}
            </div>

            {/* Source Language Area (Bottom Half) */}
            <div className="h-1/2 flex border-t border-zinc-200">
              {/* Main Text Area */}
              <div className="flex-1 bg-white p-6">
                <div className="relative h-[calc(100%-1.5rem)]">
                  <div
                    ref={inputRef}
                    className="absolute inset-0 text-base text-zinc-800 overflow-y-auto overflow-x-hidden"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {isListening && (
                      <div className="absolute -left-8 top-0">
                        <div className="flex space-x-1">
                          <div className="animate-pulse h-2 w-2 bg-green-700 rounded-full"></div>
                          <div
                            className="animate-pulse h-2 w-2 bg-green-700 rounded-full"
                            style={{ animationDelay: '200ms' }}
                          ></div>
                          <div
                            className="animate-pulse h-2 w-2 bg-green-700 rounded-full"
                            style={{ animationDelay: '400ms' }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <span className={inputText ? 'text-zinc-800' : 'text-zinc-400'}>
                      {inputText ||
                        (inputLanguage === 'zh' ? '你好，请说话' : 'Hello, please speak')}
                    </span>
                  </div>
                  {error && (
                    <div className="absolute bottom-0 left-0 right-0 mt-2 text-sm text-red-500 bg-white">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Source Language Buttons - Always on right */}
              <div className="w-28 bg-zinc-100 p-4 flex flex-col">
                <div className="flex flex-col gap-3">
                  <LanguageButton
                    value="zh"
                    selected={inputLanguage === 'zh'}
                    onClick={() => setInputLanguage('zh')}
                  >
                    中文
                  </LanguageButton>
                  <LanguageButton
                    value="en"
                    selected={inputLanguage === 'en'}
                    onClick={() => setInputLanguage('en')}
                  >
                    English
                  </LanguageButton>
                </div>

                {/* 添加一个小的间距 */}
                <div className="h-4" />

                {/* Control Buttons */}
                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-20 ${
                      isListening
                        ? 'text-green-500 bg-green-700/20 hover:bg-green-700/30 hover:text-green-400'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    onClick={handleMicClick}
                  >
                    <Mic size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-20 ${
                      isSpeakerOn ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  >
                    {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-20 text-zinc-500 hover:text-zinc-900"
                  >
                    <SettingsSheet />
                  </Button>

                  {/* 添加弹性空间把按钮往上推 */}
                  <div className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BearChat;
