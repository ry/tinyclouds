import blog from "https://deno.land/x/blog@0.0.1/blog.tsx";

const header = `![](/ry.jpg)
# Ryan Dahl
ry@tinyclouds.org`;

blog(import.meta.url, {
  title: "Ryan Dahl",
  author: "Ryan Dahl",
  header,
  style: `body { padding: 32px 0; background-color: #f0f0f0; }`,
  gaKey: "UA-91675022-1",
  redirectMap: {
    "iocp-links.html": "iocp_links",
    "rant.html": "rant",
  },
});
