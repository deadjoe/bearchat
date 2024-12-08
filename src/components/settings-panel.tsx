import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelect } from '@/components/language-select';
import {
  SPEECH_LANGUAGES,
  TRANSLATION_LANGUAGES,
  SPEECH_TO_TRANSLATION_LANG,
} from '@/constants/languages';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  speechLang: string;
  onSpeechLangChange: (value: string) => void;
  targetLang: string;
  onTargetLangChange: (value: string) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  speechLang,
  onSpeechLangChange,
  targetLang,
  onTargetLangChange,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const handleSpeechLangChange = (value: string) => {
    onSpeechLangChange(value);
    // 自动更新翻译语言代码
    const translationLang =
      SPEECH_TO_TRANSLATION_LANG[value as keyof typeof SPEECH_TO_TRANSLATION_LANG];
    if (translationLang === targetLang) {
      // 如果目标语言与源语言相同，自动切换到英语
      onTargetLangChange(translationLang === 'en' ? 'zh' : 'en');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">设置</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* 语音识别语言选择 */}
          <LanguageSelect
            label="语音识别语言"
            value={speechLang}
            onValueChange={handleSpeechLangChange}
            languages={SPEECH_LANGUAGES}
          />

          {/* 目标翻译语言选择 */}
          <LanguageSelect
            label="翻译目标语言"
            value={targetLang}
            onValueChange={onTargetLangChange}
            languages={TRANSLATION_LANGUAGES}
          />
        </div>
      </div>
    </div>
  );
}
