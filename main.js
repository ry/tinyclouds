//import blog from "https://deno.land/x/blog/blog.tsx";
import blog from "./src/blog.tsx";
blog(import.meta.url, {
  title: "Tiny Clouds",
  subtitle: "This is a demo of Deno blog",
  header:
    `A header that will be visible on the index page. You can use *Markdown* here.`,
  gaKey: "UA-91675022-1",
});
