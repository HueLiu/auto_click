window.grabba_was_here ||
  ((window.grabba_was_here = !0),
  browser.runtime.onMessage.addListener((e) => {
    if (e) {
      if (e.grabba) {
        let e = String(document.body.innerText)
            .replace(/[\n\r\s]{2,}/gi, " ")
            .trim(),
          t = {
            grabba: new Date(Date.now()).toISOString() || !0,
            pglocation: String(window.location.href),
            pgreferrer: document.referrer,
            pgcontent: e.substring(0, 2048),
            pgtitle: (document.title || "").trim(),
          },
          r = document.querySelectorAll(
            ".ytp-play-button, .player-control-play-pause-icon"
          );
        for (let e = 0; r && e < r.length; e++) {
          r[e].click();
        }
        let i = document.querySelector(
          ".ytp-time-display, ytm-time-display, ytp-time-display"
        );
        if (i) {
          let e = String(i.innerText).trim();
          t.ytp_time = e;
        }
        for (let e = 0; r && e < r.length; e++) {
          r[e].click();
        }
        browser.runtime.sendMessage(t);
      }
      if (e.go) {
        try {
          let t = document.createElement("a");
          t.setAttribute("href", e.go),
            t.setAttribute("target", "_self"),
            document.body.appendChild(t),
            t.click();
        } catch (t) {
          window.location = e.go;
        }
      }
    }
  }));
