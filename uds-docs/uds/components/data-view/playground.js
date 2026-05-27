const html = "<udc-data-view>\n  <span slot=\"header\">Lease Summary</span>\n  <p>Current balance: $0.00</p>\n  <udc-button slot=\"actions\" variant=\"secondary\">View details</udc-button>\n</udc-data-view>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
