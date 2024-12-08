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

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  modelName: 'gpt-3.5-turbo',
};

export function SettingsSheet() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

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

  const handleSave = () => {
    // 保存设置到 localStorage，API Key 进行加密
    const settingsToSave = {
      ...settings,
      apiKey: settings.apiKey ? encrypt(settings.apiKey) : '',
    };
    localStorage.setItem('bearchat-settings', JSON.stringify(settingsToSave));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-zinc-100">
          <Settings className="h-5 w-5 text-zinc-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">设置</SheetTitle>
          <SheetDescription className="text-left">配置 API 设置</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              type="text"
              value={settings.baseUrl}
              onChange={e => setSettings({ ...settings, baseUrl: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              type="text"
              value={settings.modelName}
              onChange={e => setSettings({ ...settings, modelName: e.target.value })}
              className="col-span-3"
            />
          </div>
          <Button onClick={handleSave} className="mt-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800">
            保存设置
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
