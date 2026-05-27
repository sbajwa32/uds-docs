const html = "<udc-dialog heading=\"Confirm archive\" open>\n  Archive this lease?\n  <div slot=\"actions\">\n    <udc-button variant=\"secondary\">Cancel</udc-button>\n    <udc-button variant=\"primary\" color=\"danger\">Archive</udc-button>\n  </div>\n</udc-dialog>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
