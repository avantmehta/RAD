export class ConnectorPreview {
  async fetch() {
    return new Response("connector preview", { headers: { "content-type": "text/plain" } });
  }
}

export default {
  async fetch(request, env, ctx) {
    return new ConnectorPreview().fetch(request, env, ctx);
  },
};
