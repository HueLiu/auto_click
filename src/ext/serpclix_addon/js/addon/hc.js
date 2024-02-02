const serpclix_hcbox_vueapp = new Vue({
  el: "#serpclix_hcbox_app",
  render: hc_vueapp_compiled_template_render,
  staticRenderFns: hc_vueapp_compiled_template_static_render_funcs,
  data: { src: null },
  created: function () {
    browser.storage.local
      .get("auth_token")
      .then((e) => {
        e.auth_token &&
          setTimeout(() => {
            this.src = SERPCLIX_URLS.hc + e.auth_token;
          }, 1e3 * (5 + 5 * Math.random()));
      })
      .catch((e) => {});
  },
  methods: {},
});
