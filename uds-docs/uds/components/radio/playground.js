const html = "<udc-radio-group name=\"contact\" label=\"Preferred contact\" value=\"email\">\n  <udc-radio value=\"email\">Email</udc-radio>\n  <udc-radio value=\"phone\">Phone</udc-radio>\n</udc-radio-group>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
