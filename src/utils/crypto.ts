// 简单的加密函数
export const encrypt = (text: string): string => {
  return btoa(text);
};

// 简单的解密函数
export const decrypt = (text: string): string => {
  try {
    return atob(text);
  } catch {
    return '';
  }
};
