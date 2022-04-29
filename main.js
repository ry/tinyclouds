//import blog from "https://deno.land/x/blog/blog.tsx";
import blog from "./src/blog.tsx";
blog(import.meta.url, {
  title: "Tiny Clouds",
  subtitle: "This is a demo of Deno blog",
  gaKey: "UA-91675022-1"
});
