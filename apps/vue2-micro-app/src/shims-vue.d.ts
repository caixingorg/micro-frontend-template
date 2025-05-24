declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vuex' {
  export * from 'vuex/types/index';
}

declare module 'vue/types/vue' {
  interface Vue {
    $form: any;
    $store: any;
    $message: any;
  }
}
