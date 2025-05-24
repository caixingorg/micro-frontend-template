export const ENV = {
  development: {
    REACT_MICRO_APP: '//localhost:3001',
    VUE2_MICRO_APP: '//localhost:3002',
    VUE3_MICRO_APP: '//localhost:3003',
  },
  test: {
    REACT_MICRO_APP: '//test.react.example.com',
    VUE2_MICRO_APP: '//test.vue2.example.com',
    VUE3_MICRO_APP: '//test.vue3.example.com',
  },
  production: {
    REACT_MICRO_APP: '//react.example.com',
    VUE2_MICRO_APP: '//vue2.example.com',
    VUE3_MICRO_APP: '//vue3.example.com',
  },
} as const;

export const getCurrentEnv = () => {
  return process.env.NODE_ENV || 'development';
};

export const getEnvConfig = () => {
  return ENV[getCurrentEnv() as keyof typeof ENV];
};
