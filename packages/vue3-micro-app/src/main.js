import { createApp,h } from 'vue'
import App from './App.vue'
import router from './router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let app;

function render(props = {}) {
  const { container } = props;
  app = createApp({
    render: () => h(App),
    provide: {
      navigateToUrl: props.navigateToUrl
    }
  });
  app.use(router);
  app.mount(container ? container.querySelector('#vue3-sub-app') : '#vue3-sub-app');
}

renderWithQiankun({
  mount(props) {
    console.log('vue3 micro app mount');
    render(props);
  },
  bootstrap() {
    console.log('vue3 micro app bootstrap');
  },
  unmount(props) {
    console.log('vue3 micro app unmount');
    app.unmount();
  },
  update(props) {
    console.log('vue3 micro app update');
  }
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}