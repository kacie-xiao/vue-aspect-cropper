import { App } from "vue";
import vueAspectCropper from "./vueAspectCropper/vueAspectCropper.vue";
let comps = [vueAspectCropper];
const install = (Vue: App) => {
  comps.map((component: any) => {
    Vue.component(component.__name as string, component);
  });
};

let windowObj = window as any;
if (typeof windowObj !== "undefined" && windowObj.Vue) {
  const vm = windowObj.Vue.createApp({});
  install(vm);
}

export default install;
