/* jshint esversion: 8 */
/* jshint esversion: 8 */
/* jshint node: true */
"use strict";

import {} from "dotenv/config";
import { firefox } from "playwright";
import getPort from "get-port";
import { connect } from "../node_modules/web-ext/lib/firefox/remote.js";
import { sleep, writeFile, getCurrentTime } from "./common.js";

const proxySettings = {
  server: process.env.PROXY_SERVER
};
const firefoxUserPrefs = {
  "devtools.chrome.enabled": true,
  "devtools.debugger.prompt-connection": false,
  "devtools.debugger.remote-enabled": true,
  "toolkit.telemetry.reportingpolicy.firstRun": true,
};
const extensionPath = process.env.SERPCLIX_ADDON_PATH;
const username = process.env.SERPCLIX_USERNAME;
const password = process.env.SERPCLIX_PASSWORD;
autoClick();

async function autoClick() {
  // 写入登录信息
  writeFile(`${extensionPath}/js/addon/settings_1.js`, `var username="${username}";\nvar password="${password}";\n`);

  const rpp_port = await getPort();
  const browser = await firefox.launch({
    headless: false,
    args: [`--start-debugger-server=${rpp_port}`],
    ignoreDefaultArgs: ["--enable-automation"],
    firefoxUserPrefs: firefoxUserPrefs,
    proxy: proxySettings,
  });
 
  const rdp = await connect(rpp_port);
  await rdp.installTemporaryAddon(extensionPath);
  await rdp.installTemporaryAddon(process.env.NOPECHA_EXTENSION_PATH);
  rdp.disconnect();
  log("==== playwright.launch done ====");
  
  const context = await browser.newContext();
  let page = await context.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(`https://nopecha.com/setup#${process.env.NOPECHA_API_KEY}`);
  await sleep(5);
  await page.goto('https://www.google.com/ncr');
  await sleep(5);
  await page.goto('https://serpclix.com');

  log("==== service start successfully ====");
}

function log(...args) {
  console.log("[serpclix]", getCurrentTime(), ...args);
}
