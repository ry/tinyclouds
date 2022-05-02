/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { serveDir } from "https://deno.land/std@0.137.0/http/file_server.ts";
import { walk } from "https://deno.land/std@0.137.0/fs/walk.ts";
import { dirname, relative } from "https://deno.land/std@0.137.0/path/mod.ts";
import { fromFileUrl, join } from "https://deno.land/std@0.137.0/path/mod.ts";
import { serve } from "https://deno.land/std@0.137.0/http/mod.ts";

import { h, Helmet, ssr } from "https://crux.land/nanossr@0.0.4";
import * as gfm from "https://deno.land/x/gfm@0.1.20/mod.ts";
import "https://esm.sh/prismjs@1.27.0/components/prism-c?no-check";
import { parse as frontMatter } from "https://deno.land/x/frontmatter@v0.1.4/mod.ts";
import { createReporter } from "https://deno.land/x/g_a@0.1.2/mod.ts";
import type { Reporter as GaReporter } from "https://deno.land/x/g_a@0.1.2/mod.ts";
import { Feed } from "https://esm.sh/feed@4.2.2?pin=v57";
import type { Item as FeedItem } from "https://esm.sh/feed@4.2.2?pin=v57";

export interface BlogSettings {
  title?: string;
  subtitle?: string;
  header?: string;
  style?: string;
  gaKey?: string;
}

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

const IS_DEV = Deno.args.includes("--dev") && "watchFs" in Deno;
const HMR_SOCKETS: Set<WebSocket> = new Set();
const POSTS = new Map<string, Post>();

/** The main function of the library.
 *
 * ```js
 * import blog from "https://deno.land/x/blog/blog.tsx";
 * blog(import.meta.url);
 * ```
 *
 * Configure it:
 *
 * ```js
 * import blog from "https://deno.land/x/blog/blog.tsx";
 * blog(import.meta.url, {
 *   title: "My blog title",
 *   subtitle: "Subtitle",
 *   header:
 *     `A header that will be visible on the index page. You can use *Markdown* here.`,
 *   gaKey: "GA-ANALYTICS-KEY",
 * });
 * ```
 */
export default async function blog(url: string, settings?: BlogSettings) {
  const dirUrl = dirname(url);
  const postsDirPath = join(fromFileUrl(dirUrl), "posts");
  const cwd = Deno.cwd();
  let gaReporter: undefined | GaReporter;

  let blogSettings: BlogSettings = {
    title: "Blog",
  };

  if (settings) {
    blogSettings = {
      ...blogSettings,
      ...settings,
    };

    if (blogSettings.gaKey) {
      gaReporter = createReporter({ id: blogSettings.gaKey });
    }

    if (settings.header) {
      const { content } = frontMatter(settings.header) as {
        content: string;
      };

      blogSettings.header = content;
    }
  }

  // TODO(bartlomieju): this loading logic could be handled by a single helper
  // function
  // Read posts from the current directory and store them in memory.
  // TODO(@satyarohith): not efficient for large number of posts.
  for await (
    const entry of walk(postsDirPath)
  ) {
    if (entry.isFile && entry.path.endsWith(".md")) {
      await loadPost(entry.path);
    }
  }
  // FIXME(bartlomieju): seems like using `cwd` is wrong here, since `url` arg
  // to `blog` might be a remote URL
  if (IS_DEV) {
    watchForChanges(cwd).catch(() => {});
  }

  serve(async (req: Request, connInfo) => {
    let err: undefined | Error;
    let res: undefined | Response;

    const start = performance.now();
    try {
      res = await handler(req, blogSettings) as Response;
    } catch (e) {
      err = e;
      res = new Response("Internal server error", {
        status: 500,
      });
    } finally {
      if (gaReporter) {
        gaReporter(req, connInfo, res!, start, err);
      }
    }
    return res;
  });
}

// Watcher watches for .md file changes and updates the posts.
async function watchForChanges(cwd: string) {
  const watcher = Deno.watchFs(cwd);
  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create") {
      for (const path of event.paths) {
        if (path.endsWith(".md")) {
          await loadPost(path);
          HMR_SOCKETS.forEach((socket) => {
            socket.send("refresh");
          });
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
  // Remove /posts prefix.
  pathname = pathname.slice(6);
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
  POSTS.set(pathname, post);
  console.log("Load: ", post.pathname);
}

async function handler(req: Request, blogSettings: BlogSettings) {
  const { pathname } = new URL(req.url);
  if (pathname == "/static/gfm.css") {
    return new Response(gfm.CSS, {
      headers: {
        "content-type": "text/css",
      },
    });
  }
  if (pathname == "/hmr.js") {
    const HMR_CLIENT_PATH = join(
      fromFileUrl(dirname(import.meta.url)),
      "./hmr.js",
    );
    const hmrClient = await Deno.readTextFile(HMR_CLIENT_PATH);
    return new Response(hmrClient, {
      headers: {
        "content-type": "application/javascript",
      },
    });
  }

  if (pathname.endsWith("/hmr")) {
    const { response, socket } = Deno.upgradeWebSocket(req);
    HMR_SOCKETS.add(socket);
    socket.onclose = () => {
      HMR_SOCKETS.delete(socket);
    };

    return response;
  }

  if (pathname == "/") {
    return ssr(() => (
      <Index
        posts={POSTS}
        settings={blogSettings}
        hmr={IS_DEV}
      />
    ));
  }
  if (pathname == "/feed") {
    return serveRSS(req, blogSettings, POSTS);
  }

  const post = POSTS.get(pathname);
  if (post) {
    return ssr(() => <Post post={post} hmr={IS_DEV} settings={blogSettings} />);
  }

  // Fallback to serving static files, this will handle 404s as well.
  return serveDir(req);
}

export function Index(
  { posts, settings, hmr }: {
    posts: Map<string, Post>;
    settings: BlogSettings;
    hmr: boolean;
  },
) {
  const postIndex = [];
  for (const [_key, post] of posts.entries()) {
    postIndex.push(post);
  }
  postIndex.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

  const headerHtml = settings.header && gfm.render(settings.header);

  return (
    <div class="max-w-screen-sm px-4 pt-16 mx-auto">
      <Helmet>
        <title>{settings.title}</title>
        <link rel="stylesheet" href="/static/gfm.css" />
        {settings.style && <style>{settings.style}</style>}
        {hmr && <script src="/hmr.js"></script>}
      </Helmet>
      <h1 class="text-5xl font-bold py-8">{settings.title}</h1>

      {settings.subtitle && <h2 class="text-3xl">{settings.subtitle}</h2>}

      {headerHtml && (
        <div>
          <div class="markdown-body">
            <div innerHTML={{ __dangerousHtml: headerHtml }} />
          </div>
        </div>
      )}

      <div class="mt-8">
        {postIndex.map((post) => <PostCard post={post} />)}
      </div>
    </div>
  );
}

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

function Post(
  { post, hmr, settings }: { post: Post; hmr: boolean; settings: BlogSettings },
) {
  const html = gfm.render(post.markdown);

  return (
    <div class="min-h-screen">
      <Helmet>
        {post.background && (
          <style type="text/css">
            {` body { background: ${post.background}; } `}
          </style>
        )}
        <style type="text/css">
          {` .markdown-body { --color-canvas-default: transparent; } `}
        </style>
        <title>{post.title}</title>
        <link rel="stylesheet" href="/static/gfm.css" />
        {settings.style && <style>{settings.style}</style>}
        <meta property="og:title" content={post.title} />
        {post.snippet && <meta name="description" content={post.snippet} />}
        {hmr && <script src="/hmr.js"></script>}
      </Helmet>
      {post.coverHtml && (
        <div dangerouslySetInnerHTML={{ __html: post.coverHtml }} />
      )}
      <article class="max-w-screen-sm px-4 pt-8 md:pt-16 mx-auto">
        <h1 class="text-5xl text-gray-900 font-bold">
          {post.title}
        </h1>
        <div class="mt-8 text-gray-500">
          <p class="flex gap-2 items-center">
            <PrettyDate date={post.publishDate} />
            <RssFeedIcon />
          </p>
        </div>
        <hr class="my-8" />
        <div class="markdown-body">
          <div innerHTML={{ __dangerousHtml: html }} />
        </div>
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

function RssFeedIcon() {
  return (
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
  );
}

/** Serves the rss/atom feed of the blog. */
function serveRSS(
  req: Request,
  settings: BlogSettings,
  posts: Map<string, Post>,
) {
  const url = new URL(req.url);
  const origin = url.origin;
  const copyright = `Copyright ${new Date().getFullYear()} ${origin}`;
  const feed = new Feed({
    title: settings.title ?? "Blog",
    description: settings.subtitle,
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
      id: `${origin}/${post.title}`,
      title: post.title,
      description: post.snippet,
      date: post.publishDate,
      link: `${origin}/${post.pathname}`,
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
