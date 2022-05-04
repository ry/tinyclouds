# Blog

Minimal boilerplate blogging. All you need is one boilerplate JavaScript file
that has 2 lines of code:

```js
import blog from "https://deno.land/x/blog/blog.tsx";
blog(import.meta.url);
```

Or 7 lines of code if you want to customize it:

```js
import blog from "https://deno.land/x/blog/blog.tsx";
blog(import.meta.url, {
  author: "Denobot",
  title: "My blog title",
  subtitle: "Subtitle",
  header:
    `A header that will be visible on the index page. You can use *Markdown* here.`,
  style: `body { background-color: #f0f0f0; }`,
  gaKey: "GA-ANALYTICS-KEY",
  redirectMap: {
    "/foo": "/my_post",
    // you can skip leading slashes too
    "bar": "my_post2",
  },
});
```

Currently this is both Ryan's personal blog posts combined with the blog
framework itself (in the `src/` directory). This is just for quick initial
iteration. Eventually we'll want to split the blog framework from the personal
blog posts.

To get started:

```
deno run -A --no-check=remote --watch main.js --dev
```

Running in production

```
deno run -A --no-check main.js
```
