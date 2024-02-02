browser.browserAction.onClicked.addListener(() => {
  serpclix_addon.open_orders_tab();
}),
  browser.notifications.onClicked.addListener((e) => {
    serpclix_addon.open_orders_tab();
  }),
  browser.runtime.onMessage.addListener((e) => {
    if (e == 'login') {
      browser.tabs.create({});
      return;
    }

    serpclix_addon.read_message(e)
  }),
  browser.tabs.onRemoved.addListener((e) => {
    serpclix_addon.tab_removed_handler(e);
  });
var serpclix_addon = {
  orders_tab_id: null,
  logged_in: !1,
  orders_url: browser.runtime.getURL("html/orders.html"),
  sounds: { bell: new Audio(browser.runtime.getURL("/sounds/bell.ogg")) },
  read_message: function (e) {
    let m = (
      !!e &&
      (e.logged_in
        ? this.log_in(e.username)
        : e.logged_out
        ? this.log_out()
        : e.show_me
        ? this.open_orders_tab()
        : e.notify && this.notify(e.notify || "", e.clear || !1, e.bell || !1),
      !0)
    );
    console.log(m);
    return m;
  },
  log_in: function (e) {
    (serpclix_addon.logged_in = !0),
      e && browser.browserAction.setTitle({ title: "Logged in as \n" + e }),
      browser.browserAction.setPopup({ popup: "" }),
      serpclix_addon.open_orders_tab(!0);
  },
  log_out: function () {
    serpclix_addon.logged_in = !1;
    try {
      browser.browserAction.setBadgeText &&
        browser.browserAction.setBadgeText({ text: "" });
    } catch (e) {}
    browser.browserAction.setTitle({ title: "SerpClix" }),
      browser.browserAction.setPopup({ popup: "html/login.html" }),
      browser.storage.local
        .set({ auth_token: null })
        .then(() => {
          setTimeout(() => {
            browser.tabs.remove(serpclix_addon.orders_tab_id);
          }, 1700);
        })
        .catch((e) => {});
  },
  tab_removed_handler: function (e) {
    if (this.orders_tab_id === e) {
      this.orders_tab_id = null;
      try {
        browser.browserAction.setBadgeText &&
          browser.browserAction.setBadgeText({ text: "" });
      } catch (e) {}
    }
  },
  close_orders_tab: function () {
    serpclix_addon.orders_tab_id ||
      browser.tabs
        .get(serpclix_addon.orders_tab_id)
        .then((e) => {
          e.close();
        })
        .catch((e) => {});
  },
  open_orders_tab: function (e) {
    serpclix_addon.orders_tab_id
      ? browser.tabs
          .get(serpclix_addon.orders_tab_id)
          .then((r) => {
            r.url.indexOf(this.orders_url) >= 0 ||
            r.url.indexOf("about:blank") >= 0
              ? (browser.tabs.update(serpclix_addon.orders_tab_id, {
                  active: !0,
                }),
                e &&
                  browser.tabs.reload(serpclix_addon.orders_tab_id, {
                    bypassCache: !0,
                  }))
              : ((serpclix_addon.orders_tab_id = null),
                serpclix_addon.open_orders_tab());
          })
          .catch(() => {
            (serpclix_addon.orders_tab_id = null),
              serpclix_addon.open_orders_tab();
          })
      : browser.tabs
          .create({ url: this.orders_url })
          .then((e) => {
            serpclix_addon.orders_tab_id = e.id;
          })
          .catch((e) => {});
  },
  notify_clear: function () {
    browser.notifications.getAll().then((e) => {
      for (let r in e) {
        browser.notifications.clear(r);
      }
    });
  },
  notify: function (e, r, o) {
    if ((r && this.notify_clear(), !e)) {
      return;
    }
    let t = {
      type: "basic",
      title: "SerpClix ClickSense",
      iconUrl: browser.runtime.getURL("icons/serpclix-64.png"),
      message: e,
    };
    if ((browser.notifications.create(t), o)) {
      let e = this.sounds.bell;
      (e.loop = !1), e.play();
    }
    browser.notifications.onClicked.addListener((e) => {
      serpclix_addon.open_orders_tab();
    });
  },
};
