# Blog

Minimal boilerplate blogging. All you need is one boilerplate JavaScript file
that has 2 lines of code

```js
import blog from "https://deno.land/x/blog/blog.tsx";
blog(import.meta.url);
```

Currently this is both Ryan's personal blog posts combined with the blog
framework itself (in the `src/` directory). This is just for quick initial
iteration. Eventually we'll want to split the blog framework from the personal
blog posts.

To get started:
```
deno run -A --no-check --watch main.js
```
