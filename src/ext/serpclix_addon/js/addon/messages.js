const serpclix_messages_vueapp = new Vue({
  el: "#serpclix_messages_app",
  render: messages_vueapp_compiled_template_render,
  staticRenderFns: messages_vueapp_compiled_template_static_render_funcs,
  data: { messages: null, loading: !1, hidden_messages: [] },
  mounted: function () {
    browser.storage.local
      .get(["hidden_messages", "auth_token"])
      .then((e) => {
        (this.hidden_messages = e.hidden_messages || []),
          (this.auth_token = e.auth_token),
          setTimeout(() => {
            this.get_messages();
          }, 1e3 * (1 + 1 * Math.random()));
      })
      .catch((e) => {});
  },
  methods: {
    get_messages: function () {
      if (this.loading) {
        return;
      }
      (this.loading = !0), (this.messags = null);
      const e = browser.runtime.getManifest().version,
        s = SERPCLIX_URLS.messages + "?v=" + e,
        t = {
          method: "GET",
          cache: "no-cache",
          headers: {
            Authorization: "Token " + this.auth_token,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        };
      fetch(s, t)
        .then((e) =>
          e.json().then((e) => {
            this.show_messages(e);
          })
        )
        .catch((e) => {})
        .finally(() => {
          this.loading = !1;
        });
    },
    show_messages: function (e) {
      if (e && e.length) {
        this.messages = [];
        for (let s = 0; s < e.length; s++) {
          this.hidden_messages.includes(e[s].id) || this.messages.push(e[s]);
        }
      }
    },
    close: function (e, s) {
      this.hidden_messages.push(e),
        browser.storage.local
          .set({ hidden_messages: this.hidden_messages })
          .then(() => {
            this.get_messages();
          });
    },
  },
});
