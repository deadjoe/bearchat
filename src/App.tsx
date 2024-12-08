import React, { useState } from 'react';
import { Mic, VolumeX, Volume2, FlipVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSheet } from '@/components/settings-sheet';
import { OrientationLock } from '@/components/orientation-lock';
import { useOrientation } from '@/hooks/useOrientation';

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

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
                <div className="text-2xl text-zinc-800">こんにちは、話してください</div>
              </div>

              {/* Target Language Buttons - Original position */}
              {!isFlipped && <TargetLanguageButtons isFlipped={false} />}
            </div>

            {/* Source Language Area (Bottom Half) */}
            <div className="h-1/2 flex border-t border-zinc-200">
              {/* Main Text Area */}
              <div className="flex-1 bg-white p-6">
                <div className="text-2xl text-zinc-800">
                  {inputLanguage === 'zh' ? '你好，请说话' : 'Hello, please speak'}
                </div>
              </div>

              {/* Source Language Buttons - Always on right */}
              <div className="w-28 bg-zinc-100 p-4 flex flex-col gap-3">
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

                {/* 添加一个小的间距 */}
                <div className="h-4" />

                {/* Control Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-20 ${isListening ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setIsListening(!isListening)}
                >
                  <Mic size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-20 ${isSpeakerOn ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                  {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </Button>
                <Button variant="ghost" size="icon" className="w-20 text-zinc-500 hover:text-zinc-900">
                  <SettingsSheet />
                </Button>

                {/* 添加弹性空间把按钮往上推 */}
                <div className="flex-1" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BearChat;
