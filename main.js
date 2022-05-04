//import blog from "https://deno.land/x/blog/blog.tsx";
import blog from "./src/blog.tsx";

const header = `![](http://tinyclouds.org/ry.jpg)
# Ryan Dahl
ry@tinyclouds.org`;

blog(import.meta.url, {
  title: "Ryan Dahl",
  header,
  style: `body { background-color: #f0f0f0; }`,
  gaKey: "UA-91675022-1",
});
