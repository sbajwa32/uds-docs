const html = "<udc-text-input\n  name=\"email\"\n  label=\"Email address\"\n  type=\"email\"\n  helper-text=\"We'll never share your email.\"\n  required\n></udc-text-input>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
