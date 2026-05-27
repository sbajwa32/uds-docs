const html = "<udc-tabs selected-panel=\"overview\">\n  <udc-tab panel=\"overview\">Overview</udc-tab>\n  <udc-tab panel=\"details\">Details</udc-tab>\n  <udc-tab-panel panel=\"overview\">Overview content</udc-tab-panel>\n  <udc-tab-panel panel=\"details\">Details content</udc-tab-panel>\n</udc-tabs>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
