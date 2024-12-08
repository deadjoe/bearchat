import { encrypt, decrypt } from '@/utils/crypto';

interface TranslationConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

interface TranslationRequest {
  text: string;
  fromLang: string;
  toLang: string;
}

interface TranslationResponse {
  text: string;
  error?: string;
}

const RETRY_COUNT = 2;
const RETRY_DELAY = 1000;

export class TranslationService {
  private config: TranslationConfig;

  constructor() {
    // 从 localStorage 加载配置
    const savedSettings = localStorage.getItem('bearchat-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        this.config = {
          apiKey: parsed.apiKey ? decrypt(parsed.apiKey) : '',
          baseUrl: parsed.baseUrl || 'https://api.openai.com/v1',
          modelName: parsed.modelName || 'gpt-3.5-turbo',
        };
      } catch (e) {
        console.error('Failed to load translation settings:', e);
        throw new Error('翻译服务配置加载失败');
      }
    } else {
      throw new Error('请先配置 API 设置');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getSystemPrompt(fromLang: string, toLang: string): string {
    const langMap = {
      zh: '中文',
      en: '英语',
      ja: '日语',
      ko: '韩语',
      th: '泰语',
      vi: '越南语'
    };

    return `你是一个专业的翻译助手。请将以下${langMap[fromLang]}文本翻译成${langMap[toLang]}。
翻译要准确、自然、地道，保持原文的语气和风格。
只需要返回翻译结果，不要包含任何解释或其他内容。`;
  }

  private async translateWithRetry(
    request: TranslationRequest,
    retryCount = RETRY_COUNT
  ): Promise<TranslationResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.fromLang, request.toLang),
            },
            {
              role: 'user',
              content: request.text,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content.trim(),
      };
    } catch (error) {
      if (retryCount > 0) {
        await this.delay(RETRY_DELAY);
        return this.translateWithRetry(request, retryCount - 1);
      }
      
      return {
        text: '',
        error: error instanceof Error ? error.message : '翻译服务出错',
      };
    }
  }

  public async translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.config.apiKey) {
      return { text: '', error: '请先配置 API Key' };
    }

    if (!request.text.trim()) {
      return { text: '' };
    }

    return this.translateWithRetry(request);
  }

  public updateConfig(newConfig: Partial<TranslationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  public getModelName(): string {
    return this.config.modelName;
  }
}
