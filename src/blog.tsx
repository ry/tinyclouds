/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import { h, Helmet, ssr } from "https://crux.land/nanossr@0.0.4";
import { serveDir } from "https://deno.land/std@0.134.0/http/file_server.ts";
import { walk } from "https://deno.land/std@0.134.0/fs/walk.ts";
import { dirname, relative } from "https://deno.land/std@0.134.0/path/mod.ts";
import { fromFileUrl } from "https://deno.land/std@0.134.0/path/mod.ts";
import { serve } from "https://deno.land/std@0.134.0/http/mod.ts";
import * as gfm from "https://deno.land/x/gfm@0.1.20/mod.ts";
import { parse as frontMatter } from "https://deno.land/x/frontmatter@v0.1.4/mod.ts";
import { Feed } from "https://esm.sh/feed@4.2.2?pin=v57";
import type { Item as FeedItem } from "https://esm.sh/feed@4.2.2?pin=v57";

const posts = new Map<string, Post>();

/** Represents a Post in the Blog. */
export interface Post {
  title: string;
  pathname: string;
  author: string;
  publishDate: Date;
  snippet: string;
  /** Raw markdown content. */
  markdown: string;
  coverHtml: string;
  background: string;
  /** An image URL which is used in the OpenGraph og:image tag. */
  ogImage: string;
}

/** The main function of the library.
 *
 * ```js
 * import blog from "https://deno.land/x/blog/blog.tsx";
 * blog(import.meta.url);
 * ```
 */
export default async function blog(url: string) {
  const dirUrl = dirname(url);
  const path = fromFileUrl(dirUrl);
  const cwd = Deno.cwd();

  // Read posts from the current directory and store them in memory.
  // TODO(@satyarohith): not efficient for large number of posts.
  for await (
    const entry of walk(path, {
      // Exclude README.md/readme.md
      skip: [new RegExp("readme.md", "i")],
    })
  ) {
    if (entry.isFile && entry.path.endsWith(".md")) {
      await loadPost(entry.path);
    }
  }

  console.log("http://localhost:8000/");
  serve(handler);

  // Watcher watches for .md file changes and updates the posts.
  const watcher = Deno.watchFs(cwd);
  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create") {
      for (const path of event.paths) {
        if (path.endsWith(".md")) {
          await loadPost(path);
        }
      }
    }
  }
}

async function loadPost(path: string) {
  const contents = await Deno.readTextFile(path);
  let pathname = "/" + relative(Deno.cwd(), path);
  // Remove .md extension.
  pathname = pathname.slice(0, -3);
  const { content, data } = frontMatter(contents) as {
    data: Record<string, string>;
    content: string;
  };

  const post: Post = {
    title: data.title,
    author: data.author,
    // Note: users can override path of a blog post using
    // pathname in front matter.
    pathname: data.pathname ?? pathname,
    publishDate: new Date(data.publish_date),
    snippet: data.snippet ?? "",
    markdown: content,
    coverHtml: data.cover_html,
    background: data.background,
    ogImage: data["og:image"],
  };
  posts.set(pathname, post);
  console.log("Load: ", post.pathname);
}

async function handler(req: Request) {
  const { pathname } = new URL(req.url);
  if (pathname == "/static/gfm.css") {
    return new Response(gfm.CSS, {
      headers: {
        "content-type": "text/css",
      },
    });
  }
  if (pathname == "/") {
    return ssr(() => <Index />);
  }
  if (pathname == "/feed") {
    return serveRSS(req);
  }

  const post = posts.get(pathname);
  if (!post) {
    return serveDir(req);
  }

  return ssr(() => <Post post={post} />);
}

const Index = () => {
  const postIndex = [];
  for (const [_key, post] of posts.entries()) {
    postIndex.push(post);
  }
  postIndex.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

  return (
    <div class="max-w-screen-md px-4 pt-16 mx-auto">
      <Helmet>
        <title>Blog</title>
        <link rel="stylesheet" href="/static/gfm.css" />
      </Helmet>
      <h1 class="text-5xl font-bold">Blog</h1>
      <div class="mt-8">
        {postIndex.map((post) => <PostCard post={post} />)}
      </div>
    </div>
  );
};

function PostCard({ post }: { post: Post }) {
  return (
    <div class="py-8 border(t gray-200) grid sm:grid-cols-3 gap-2">
      <div class="w-56 text-gray-500">
        <p>
          <PrettyDate date={post.publishDate} />
        </p>
      </div>
      <a class="sm:col-span-2" href={post.pathname}>
        <h3 class="text(2xl gray-900) font-bold">
          {post.title}
        </h3>
        <div class="mt-4 text-gray-900">
          {post.snippet}
        </div>
      </a>
    </div>
  );
}

function Post({ post }: { post: Post }) {
  const html = gfm.render(post.markdown);

  return (
    <div class="min-h-screen">
      <Helmet>
        {post.background && <body style={`background: ${post.background}`} />}
        <title>{post.title}</title>
        <link rel="stylesheet" href="/static/gfm.css" />
        {post.snippet && <meta name="description" content={post.snippet} />}
        <meta property="og:title" content={post.title} />
      </Helmet>
      {post.coverHtml && (
        <div dangerouslySetInnerHTML={{ __html: post.coverHtml }} />
      )}
      <article class="max-w-screen-md px-4 pt-8 md:pt-16 mx-auto">
        <h1 class="text-5xl text-gray-900 font-bold">
          {post.title}
        </h1>
        <div class="mt-8 text-gray-500">
          <p class="flex gap-2 items-center">
            <PrettyDate date={post.publishDate} />
            <a href="/feed" class="hover:text-gray-700" title="Atom Feed">
              <svg
                class="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z">
                </path>
                <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z">
                </path>
              </svg>
            </a>
          </p>
        </div>
        <hr class="my-8" />
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          class="markdown-body"
        />
      </article>
    </div>
  );
}

function PrettyDate({ date }: { date: Date }) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <time dateTime={date.toISOString()}>
      {formatter.format(date)}
    </time>
  );
}

/** Serves the rss/atom feed of the blog. */
async function serveRSS(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const copyright = `Copyright ${new Date().getFullYear()} ${origin}`;
  const feed = new Feed({
    title: "Deno",
    description: "The latest news from Deno Land Inc.",
    id: `${origin}/blog`,
    link: `${origin}/blog`,
    language: "en",
    favicon: `${origin}/favicon.ico`,
    copyright: copyright,
    generator: "Feed (https://github.com/jpmonette/feed) for Deno",
    feedLinks: {
      atom: `${origin}/feed`,
    },
  });

  for (const [_key, post] of posts.entries()) {
    const item: FeedItem = {
      id: `${origin}/blog/${post.title}`,
      title: post.title,
      description: post.snippet,
      date: post.publishDate,
      link: `${origin}/blog/${post.pathname}`,
      author: post.author?.split(",").map((author: string) => ({
        name: author.trim(),
      })),
      image: post.ogImage,
      copyright,
      published: post.publishDate,
    };
    feed.addItem(item);
  }

  const atomFeed = feed.atom1();
  return new Response(atomFeed, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
    },
  });
}
