import blog, { ga, redirects } from "https://deno.land/x/blog@0.5.0/blog.tsx";

blog({
  title: "Ryan Dahl",
  author: "Ryan Dahl",
  avatar: "./ry.jpg",
  avatarClass: "full",
  links: [
    { title: "Email", url: "mailto:ry@tinyclouds.org" },
    { title: "GitHub", url: "https://github.com/ry" },
    { title: "Twitter", url: "https://twitter.com/rough__sea" },
  ],
  background: "#fff",
  middlewares: [
    ga("UA-91675022-1"),
    redirects({
      "iocp-links.html": "iocp_links",
      "rant.html": "rant",
    }),
  ],
});
