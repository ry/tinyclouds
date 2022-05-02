//import blog from "https://deno.land/x/blog/blog.tsx";
import blog from "./src/blog.tsx";
blog(import.meta.url, {
  title: "Ryan Dahl",
  subtitle: "",
  header: `![](http://tinyclouds.org/ry.jpg)

ry@tinyclouds.org`,
  style: `body {
    background-color: #f0f0f0;
}

.markdown-body {
    background-color: #f0f0f0;
}`,
  gaKey: "UA-91675022-1",
});
