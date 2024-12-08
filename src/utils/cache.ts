interface CacheItem {
  translation: string;
  timestamp: number;
  model: string;
}

interface CacheOptions {
  expirationTime?: number; // 过期时间（毫秒）
  maxItems?: number; // 最大缓存条目数
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  expirationTime: 24 * 60 * 60 * 1000, // 24小时
  maxItems: 100, // 最多缓存100条翻译
};

export class TranslationCache {
  private readonly storageKey = 'bearchat-translations';
  private readonly options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private getCache(): Record<string, CacheItem> {
    try {
      const cache = localStorage.getItem(this.storageKey);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }

  private setCache(cache: Record<string, CacheItem>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save cache:', error);
      // 如果存储失败（比如localStorage已满），清除一半的缓存
      this.cleanup(true);
    }
  }

  private generateKey(text: string, fromLang: string, toLang: string): string {
    return `${text}_${fromLang}_${toLang}`.toLowerCase();
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.options.expirationTime;
  }

  // 清理过期和超出数量限制的缓存
  private cleanup(force: boolean = false): void {
    const cache = this.getCache();
    const entries = Object.entries(cache);

    // 如果强制清理，删除一半的缓存
    if (force) {
      const sortedEntries = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const newCache = Object.fromEntries(sortedEntries.slice(0, this.options.maxItems / 2));
      this.setCache(newCache);
      return;
    }

    // 清理过期缓存
    const validEntries = entries.filter(([_, item]) => !this.isExpired(item.timestamp));

    // 如果超出最大条目数，只保留最新的
    const sortedEntries = validEntries
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, this.options.maxItems);

    this.setCache(Object.fromEntries(sortedEntries));
  }

  // 获取缓存的翻译
  get(text: string, fromLang: string, toLang: string, model: string): string | null {
    const cache = this.getCache();
    const key = this.generateKey(text, fromLang, toLang);
    const item = cache[key];

    if (!item) {
      return null;
    }

    // 如果模型不同或缓存过期，返回null
    if (item.model !== model || this.isExpired(item.timestamp)) {
      return null;
    }

    return item.translation;
  }

  // 保存翻译到缓存
  set(text: string, fromLang: string, toLang: string, translation: string, model: string): void {
    const cache = this.getCache();
    const key = this.generateKey(text, fromLang, toLang);

    cache[key] = {
      translation,
      timestamp: Date.now(),
      model,
    };

    this.setCache(cache);
    this.cleanup();
  }

  // 清除所有缓存
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
