const html = "<udc-badge tone=\"success\">Active</udc-badge>\n<udc-badge tone=\"warning\">Pending</udc-badge>\n<udc-badge tone=\"error\">Overdue</udc-badge>";

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
