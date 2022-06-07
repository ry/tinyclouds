import blog, { ga, redirects } from "https://deno.land/x/blog@0.3.3/blog.tsx";

blog({
  title: "Ryan Dahl",
  author: "Ryan Dahl",
  avatar: "./ry.jpg",
  avatarClass: "full",
  links: [
    { title: "Email", url: "mailto:ry@tinyclouds.org" },
    { title: "GitHub", url: "https://github.com/ry" },
  ],
  background: "#f9f9f9",
  middlewares: [
    ga("UA-91675022-1"),
    redirects({
      "iocp-links.html": "iocp_links",
      "rant.html": "rant",
    }),
  ],
});
