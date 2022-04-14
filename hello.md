---
title: Hello!
author: Ryan Dahl
publish_date: 2021-06-23T10:00:00.000Z
---

This is my new blog.

The goal is minimum boilerplate, maximal performance. This blog is hosted at the
edge in running in every Google Cloud data center. That is, it can respond
locally to requests.

As you dig deeper, you will find that the blog, yet tiny, is based on an very
flexiable architecture that can service API endpoints with minimal additional
javascript.

But nevermind that aspect - the technical poetry aspect. The point is the blog
is sufficently minimal and maximally extensible.

The blog works like this:

1. Start a github repo with a `hello.md` file

```md
---
title: Hello!
author: Ryan Dahl
publish_date: 2021-06-23T10:00:00.000Z
---

This is my new blog.
```

2. Create a `main.js` file (boilerplate):

```ts
import blog from "https://deno.land/x/ry_blog/mod.ts";
blog(import.meta.url);
```

3. Create a new project on dash.deno.com

4. Connect github repo

5. Done!

[Screenshot]

# Claim

My claim is that this style of website, just a small 2 line file that defines
the "framework" (in this case a blog) plus a bunch of structured data that has
visual representations defined by the framework.
