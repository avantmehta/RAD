export default {
  async fetch() {
    return new Response("Heartfood CT worker", { headers: { "content-type": "text/plain" } });
  },
};
