function orders_vueapp_compiled_template_render() {
  with (this) {
    return _c(
      "div",
      {
        on: {
          mousemove: function (e) {
            return keep_xyz("mm", e);
          },
        },
      },
      [
        _c("div", { attrs: { id: "topline" } }, [
          _c("p", { staticClass: "pull-left muted" }, [
            _c("span", {
              domProps: {
                textContent: _s(
                  "v" + (addon_version || "0.0.0") + "#" + (pepper || "")
                ),
              },
            }),
          ]),
          _v(" "),
          _c(
            "a",
            {
              staticClass: "hover-visible button red",
              attrs: { href: "#" },
              on: {
                click: function (e) {
                  return e.preventDefault(), e.stopPropagation(), log_me_out();
                },
              },
            },
            [_v("Log out")]
          ),
          _v(" "),
          _c(
            "a",
            {
              staticClass: "button green bell",
              class: { disabled: !notifications_enabled },
              attrs: {
                href: "#",
                title:
                  "notifications: " +
                  (notifications_enabled ? "ENABLED" : "DISABLED"),
              },
              on: {
                click: function (e) {
                  return (
                    e.preventDefault(),
                    e.stopPropagation(),
                    notifications_toggle()
                  );
                },
              },
            },
            [_v(" ")]
          ),
          _v(" "),
          _c(
            "a",
            {
              staticClass: "button yellow sun",
              class: { disabled: !theme_enabled },
              attrs: { title: "Dark theme", href: "#" },
              on: {
                click: function (e) {
                  return (
                    e.preventDefault(), e.stopPropagation(), theme_toggle()
                  );
                },
              },
            },
            [_v(" ")]
          ),
          _v(" "),
          _c("p", [
            _v("User: "),
            _c("span", { domProps: { textContent: _s(username) } }),
          ]),
          _v(" "),
          ipinfo.country_name
            ? _c("p", [
                _v("Country: "),
                _c("span", {
                  domProps: { textContent: _s(ipinfo.country_name) },
                }),
              ])
            : _e(),
          _v(" "),
          ipinfo.ip_quality
            ? _c("p", [
                _v("IP Quality: "),
                _c("span", {
                  domProps: { textContent: _s(ipinfo.ip_quality) },
                }),
              ])
            : _e(),
        ]),
        _v(" "),
        message_text
          ? _c("div", {
              staticClass: "messagebox preline",
              class: message_class,
              domProps: { textContent: _s(message_text) },
            })
          : _e(),
        _v(" "),
        loading
          ? _c("div", { staticClass: "messagebox" }, [_v("loading …")])
          : tab_countdown_total > 0
          ? _c("div", [
              _c("div", { staticClass: "messagebox running huge absolute" }, [
                _v("\n            Click is in progress! WAIT "),
                _c("b", { domProps: { textContent: _s(tab_countdown_total) } }),
                _v(" seconds.\n        "),
              ]),
              _v(" "),
              _c("div", { staticClass: "shadowbox" }),
            ])
          : cooldown_countdown > 0
          ? _c("div", { staticClass: "messagebox warning huge" }, [
              _v("\n        Please, WAIT "),
              _c("b", { domProps: { textContent: _s(cooldown_countdown) } }),
              _v(" seconds.\n    "),
            ])
          : loading || null === orders || 0 !== orders.length
          ? _e()
          : _c("div", [
              _m(0),
              _v(" "),
              orderslist_refresh_countdown > 0
                ? _c("div", { staticClass: "messagebox muted" }, [
                    _v("\n            Refreshing in: "),
                    _c("b", {
                      domProps: {
                        textContent: _s(orderslist_refresh_countdown),
                      },
                    }),
                  ])
                : _e(),
            ]),
        _v(" "),
        orders && orders.length
          ? _c(
              "ul",
              {
                class: {
                  disabled:
                    cooldown_countdown > 0 ||
                    tab_countdown_total > 0 ||
                    !orders ||
                    0 === orders.length ||
                    loading,
                  running: state && state.order && state.order.id,
                },
                attrs: { id: "orders" },
              },
              _l(orders, function (e) {
                return _c(
                  "li",
                  {
                    class: [
                      state && state.order && state.order.id === e.id
                        ? "running"
                        : "idle",
                      (e.search_type && e.search_type[0]) || "google",
                    ],
                    on: {
                      click: function (t) {
                        return t.preventDefault(), order_clicked(e, t);
                      },
                      mouseenter: function (e) {
                        return e.preventDefault(), keep_xyz("h", e);
                      },
                      mouseleave: function (e) {
                        return e.preventDefault(), keep_xyz("x", e);
                      },
                      mousedown: function (e) {
                        return e.preventDefault(), keep_xyz("d", e);
                      },
                      mouseup: function (e) {
                        return e.preventDefault(), keep_xyz("u", e);
                      },
                    },
                  },
                  [
                    _c("div", { staticClass: "c1" }, [
                      _c(
                        "p",
                        {
                          directives: [
                            {
                              name: "show",
                              rawName: "v-show",
                              value: e.id || e.oso_id,
                              expression: "order.id || order.oso_id",
                            },
                          ],
                          staticClass: "keyword",
                        },
                        [
                          _c("span", { staticClass: "b" }, [_v("Order:")]),
                          _v("\n                    #"),
                          _c("span", {
                            staticClass: "keyword",
                            domProps: { textContent: _s(e.oso_id || e.id) },
                          }),
                          _v("\n                    ("),
                          _c("span", {
                            staticClass: "keyword",
                            domProps: {
                              textContent: _s(
                                (e.search_type && e.search_type[1]) || "search"
                              ),
                            },
                          }),
                          _v(")\n                "),
                        ]
                      ),
                      _v(" "),
                      _c(
                        "p",
                        {
                          directives: [
                            {
                              name: "show",
                              rawName: "v-show",
                              value: e.tier_name,
                              expression: "order.tier_name",
                            },
                          ],
                          staticClass: "keyword",
                        },
                        [
                          _c("span", { staticClass: "b" }, [_v("Country:")]),
                          _v(" "),
                          _c("span", {
                            staticClass: "keyword",
                            domProps: { textContent: _s(e.tier_name) },
                          }),
                        ]
                      ),
                      _v(" "),
                      e.label
                        ? _c("p", {
                            staticClass: "i small",
                            domProps: { textContent: _s(e.label) },
                          })
                        : _e(),
                    ]),
                    _v(" "),
                    !state.order ||
                    state.order.id !== e.id ||
                    ("search" != state.step && "closed" != state.step)
                      ? _e()
                      : _c("div", { staticClass: "c2" }, [
                          _c("p", [
                            _c(
                              "a",
                              {
                                staticClass: "button red text-center",
                                attrs: { href: "#" },
                                on: {
                                  click: function (t) {
                                    return (
                                      t.stopPropagation(),
                                      t.preventDefault(),
                                      block_order(e, t)
                                    );
                                  },
                                },
                              },
                              [
                                _v("Order Not Found:"),
                                _c("br"),
                                _v("Remove From My List"),
                              ]
                            ),
                          ]),
                        ]),
                  ]
                );
              }),
              0
            )
          : _e(),
      ]
    );
  }
}
var orders_vueapp_compiled_template_static_render_funcs = [
  function () {
    with (this) {
      return _c("div", { staticClass: "messagebox warning huge" }, [
        _v("\n            Sorry, no orders available at this time."),
        _c("br"),
        _v("Please check back later.\n        "),
      ]);
    }
  },
];
