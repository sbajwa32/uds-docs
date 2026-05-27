const html = "<udc-tooltip>\n  <udc-button slot=\"trigger\" variant=\"ghost\" icon-only leading-icon=\"info\" aria-label=\"More information\"></udc-button>\n  More information about this field.\n</udc-tooltip>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
