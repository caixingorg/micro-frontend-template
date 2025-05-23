/**
 * 存储工具类
 */
export class Storage {
  private prefix: string;
  private storage: globalThis.Storage;

  constructor(prefix = 'app', type: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.prefix = prefix;
    this.storage = type === 'localStorage' ? localStorage : sessionStorage;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * 设置存储项
   */
  set<T = any>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now(),
      });
      this.storage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error(`[Storage] Failed to set ${key}:`, error);
    }
  }

  /**
   * 获取存储项
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = this.storage.getItem(this.getKey(key));
      if (!item) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error(`[Storage] Failed to get ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * 删除存储项
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`[Storage] Failed to remove ${key}:`, error);
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      const prefixedKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
      
      prefixedKeys.forEach(key => {
        this.storage.removeItem(key);
      });
    } catch (error) {
      console.error('[Storage] Failed to clear:', error);
    }
  }

  /**
   * 检查存储项是否存在
   */
  has(key: string): boolean {
    return this.storage.getItem(this.getKey(key)) !== null;
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    try {
      const keys = Object.keys(this.storage);
      return keys
        .filter(key => key.startsWith(`${this.prefix}:`))
        .map(key => key.replace(`${this.prefix}:`, ''));
    } catch (error) {
      console.error('[Storage] Failed to get keys:', error);
      return [];
    }
  }

  /**
   * 获取存储大小（字节）
   */
  size(): number {
    try {
      let total = 0;
      const keys = Object.keys(this.storage);
      const prefixedKeys = keys.filter(key => key.startsWith(`${this.prefix}:`));
      
      prefixedKeys.forEach(key => {
        const value = this.storage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      });
      
      return total;
    } catch (error) {
      console.error('[Storage] Failed to calculate size:', error);
      return 0;
    }
  }

  /**
   * 设置带过期时间的存储项
   */
  setWithExpiry<T = any>(key: string, value: T, expiryMs: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expiry: Date.now() + expiryMs,
      };
      this.storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error(`[Storage] Failed to set ${key} with expiry:`, error);
    }
  }

  /**
   * 获取带过期时间的存储项
   */
  getWithExpiry<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = this.storage.getItem(this.getKey(key));
      if (!item) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);
      
      // 检查是否过期
      if (parsed.expiry && Date.now() > parsed.expiry) {
        this.remove(key);
        return defaultValue;
      }

      return parsed.value;
    } catch (error) {
      console.error(`[Storage] Failed to get ${key} with expiry:`, error);
      return defaultValue;
    }
  }
}

// 创建默认存储实例
export const localStorage = new Storage('enterprise', 'localStorage');
export const sessionStorage = new Storage('enterprise', 'sessionStorage');

/**
 * Cookie工具类
 */
export class CookieStorage {
  /**
   * 设置Cookie
   */
  static set(
    name: string,
    value: string,
    options: {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      const expires = options.expires instanceof Date 
        ? options.expires 
        : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * 获取Cookie
   */
  static get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * 删除Cookie
   */
  static remove(name: string, path = '/', domain?: string): void {
    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  /**
   * 检查Cookie是否存在
   */
  static has(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * 获取所有Cookie
   */
  static getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      });
    }

    return cookies;
  }
}
