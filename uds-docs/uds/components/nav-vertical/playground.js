const html = "<udc-nav-vertical aria-label=\"Main navigation\">\n  <udc-nav-item href=\"/dashboard\" current>Dashboard</udc-nav-item>\n  <udc-nav-item href=\"/leases\">Leases</udc-nav-item>\n</udc-nav-vertical>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
