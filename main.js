import blog, { ga, redirects } from "https://deno.land/x/blog@0.3.1/blog.tsx";

blog({
  title: "Ryan Dahl",
  author: "Ryan Dahl",
  picture: "./ry.jpg",
  links: [
    { title: "Email", url: "mailto:ry@tinyclouds.org" },
    { title: "GitHub", url: "https://github.com/ry" },
    { title: "LinkedIn", url: "https://www.linkedin.com/in/tinyclouds/" },
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
