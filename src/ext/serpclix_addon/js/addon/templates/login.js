function login_vueapp_compiled_template_render() {
  with (this) {
    return _c("div", { staticClass: "container" }, [
      _c("h2", { staticClass: "header" }, [_v("Log in to SerpClix")]),
      _v(" "),
      message_text
        ? _c("div", {
            staticClass: "messagebox wide",
            class: message_class,
            domProps: { textContent: _s(message_text) },
          })
        : _e(),
      _v(" "),
      logged_in
        ? _e()
        : _c(
            "form",
            {
              on: {
                submit: function (e) {
                  return e.preventDefault(), submit();
                },
              },
            },
            [
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: username,
                    expression: "username",
                  },
                ],
                attrs: {
                  type: "text",
                  name: "username",
                  placeholder: "username",
                },
                domProps: { value: username },
                on: {
                  input: function (e) {
                    e.target.composing || (username = e.target.value);
                  },
                },
              }),
              _v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: password,
                    expression: "password",
                  },
                ],
                attrs: {
                  type: "password",
                  name: "password",
                  placeholder: "password",
                },
                domProps: { value: password },
                on: {
                  input: function (e) {
                    e.target.composing || (password = e.target.value);
                  },
                },
              }),
              _v(" "),
              _c("input", {
                staticClass: "btn",
                attrs: {
                  type: "submit",
                  value: "LOG IN",
                  disabled: !username || !password,
                },
                on: {
                  mouseenter: function (e) {
                    return (
                      e.stopPropagation(), e.preventDefault(), keep_xyz("h", e)
                    );
                  },
                  mouseleave: function (e) {
                    return (
                      e.stopPropagation(), e.preventDefault(), keep_xyz("x", e)
                    );
                  },
                  mousedown: function (e) {
                    return (
                      e.stopPropagation(), e.preventDefault(), keep_xyz("d", e)
                    );
                  },
                  mouseup: function (e) {
                    return (
                      e.stopPropagation(), e.preventDefault(), keep_xyz("u", e)
                    );
                  },
                  click: function (e) {
                    return e.preventDefault(), submit();
                  },
                },
              }),
            ]
          ),
    ]);
  }
}
var login_vueapp_compiled_template_static_render_funcs = [];
