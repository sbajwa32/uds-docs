const html = "<udc-list selectable>\n  <udc-list-item value=\"dashboard\" selected>Dashboard</udc-list-item>\n  <udc-list-item value=\"settings\">Settings</udc-list-item>\n</udc-list>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
