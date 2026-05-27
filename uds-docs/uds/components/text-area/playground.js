const html = "<udc-text-area\n  name=\"notes\"\n  label=\"Notes\"\n  helper-text=\"Add context for the leasing team.\"\n  max-length=\"500\"\n></udc-text-area>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
