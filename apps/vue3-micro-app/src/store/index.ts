import { createPinia, defineStore } from 'pinia';

export const pinia = createPinia();

// 应用状态store
export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN',
  }),
  
  getters: {
    isLoading: (state) => state.loading,
    currentTheme: (state) => state.theme,
    currentLanguage: (state) => state.language,
  },
  
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme;
    },
    
    setLanguage(language: string) {
      this.language = language;
    },
  },
});

// 产品状态store
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Array<{
      id: string;
      name: string;
      price: number;
      category: string;
      stock: number;
    }>,
    selectedProduct: null as any,
  }),
  
  getters: {
    productCount: (state) => state.products.length,
    lowStockProducts: (state) => state.products.filter(p => p.stock < 10),
  },
  
  actions: {
    addProduct(product: any) {
      this.products.push(product);
    },
    
    updateProduct(id: string, updates: any) {
      const index = this.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.products[index] = { ...this.products[index], ...updates };
      }
    },
    
    deleteProduct(id: string) {
      const index = this.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.products.splice(index, 1);
      }
    },
    
    setSelectedProduct(product: any) {
      this.selectedProduct = product;
    },
  },
});
