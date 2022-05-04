//import blog from "https://deno.land/x/blog/blog.tsx";
import blog from "./src/blog.tsx";

const header = `![](/ry.jpg)
# Ryan Dahl
ry@tinyclouds.org`;

blog(import.meta.url, {
  title: "Ryan Dahl",
  author: "Ryan Dahl",
  header,
  style: `body { padding: 32px; background-color: #f0f0f0; }`,
  gaKey: "UA-91675022-1",
  redirectMap: {
    "iocp-links.html": "iocp_links",
  },
});
