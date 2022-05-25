import blog, { ga, redirects } from "https://deno.land/x/blog@0.1.0/blog.tsx";

const header = `![](/ry.jpg)
# Ryan Dahl

ry@tinyclouds.org

https://github.com/ry

https://www.linkedin.com/in/tinyclouds/

Twitter: none`;

blog({
  title: "Ryan Dahl",
  author: "Ryan Dahl",
  header,
  style: `body { padding: 32px 0; background-color: #f0f0f0; }`,
  middlewares: [
    ga("UA-91675022-1"),
    redirects({
      "iocp-links.html": "iocp_links",
      "rant.html": "rant",
    }),
  ],
});
