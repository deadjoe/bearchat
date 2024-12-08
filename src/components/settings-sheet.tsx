import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

// 简单的加密函数
const encrypt = (text: string): string => {
  return btoa(text);
};

// 简单的解密函数
const decrypt = (text: string): string => {
  try {
    return atob(text);
  } catch {
    return '';
  }
};

interface Settings {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

interface SettingsError {
  apiKey: boolean;
  baseUrl: boolean;
  modelName: boolean;
}

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  modelName: 'gpt-3.5-turbo',
};

export function SettingsSheet() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [errors, setErrors] = useState<Partial<Settings>>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 加载保存的设置
    const savedSettings = localStorage.getItem('bearchat-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...parsed,
          apiKey: parsed.apiKey ? decrypt(parsed.apiKey) : '',
        });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const validateSettings = (): boolean => {
    const newErrors: Partial<Settings> = {};

    if (!settings.apiKey.trim()) {
      newErrors.apiKey = 'API Key 不能为空';
    }

    try {
      new URL(settings.baseUrl);
    } catch {
      newErrors.baseUrl = '请输入有效的 URL';
    }

    if (!settings.modelName.trim()) {
      newErrors.modelName = 'Model Name 不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateSettings()) {
      const settingsToSave = {
        ...settings,
        apiKey: settings.apiKey ? encrypt(settings.apiKey) : '',
      };
      localStorage.setItem('bearchat-settings', JSON.stringify(settingsToSave));
      setIsOpen(false); // 保存成功后关闭面板
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="">
          <Settings className="h-5 w-5 text-zinc-400 hover:text-zinc-200" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[400px] bg-zinc-900 text-zinc-100 border-t border-zinc-800"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-zinc-100">设置</SheetTitle>
          <SheetDescription className="text-left text-zinc-400">配置 API 设置</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="apiKey" className="text-zinc-300">
                API Key
              </Label>
              {errors.apiKey && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={e => {
                setSettings({ ...settings, apiKey: e.target.value });
                setErrors({ ...errors, apiKey: undefined });
              }}
              className={`bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-zinc-500 ${
                errors.apiKey ? 'border-red-500' : ''
              }`}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="baseUrl" className="text-zinc-300">
                Base URL
              </Label>
              {errors.baseUrl && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
            <Input
              id="baseUrl"
              type="text"
              value={settings.baseUrl}
              onChange={e => {
                setSettings({ ...settings, baseUrl: e.target.value });
                setErrors({ ...errors, baseUrl: undefined });
              }}
              className={`bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-zinc-500 ${
                errors.baseUrl ? 'border-red-500' : ''
              }`}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="modelName" className="text-zinc-300">
                Model Name
              </Label>
              {errors.modelName && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
            <Input
              id="modelName"
              type="text"
              value={settings.modelName}
              onChange={e => {
                setSettings({ ...settings, modelName: e.target.value });
                setErrors({ ...errors, modelName: undefined });
              }}
              className={`bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-zinc-500 ${
                errors.modelName ? 'border-red-500' : ''
              }`}
            />
          </div>
          <Button
            onClick={handleSave}
            className="mt-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            保存设置
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
