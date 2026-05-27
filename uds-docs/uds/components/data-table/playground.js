const html = "<udc-data-table>\n  <table>\n    <thead><tr><th data-sort-key=\"tenant\" tabindex=\"0\">Tenant</th><th>Status</th></tr></thead>\n    <tbody><tr><td>Brian Smith</td><td><udc-badge tone=\"success\">Active</udc-badge></td></tr></tbody>\n  </table>\n</udc-data-table>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
