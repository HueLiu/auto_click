const login_url = browser.extension.getURL("/html/login.html");
window.onload = function (e) {
  console.log(login_url);
  const current_url = window.location.href;
  if (current_url !== login_url) {
    browser.runtime.sendMessage('login');
  }
};
