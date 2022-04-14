/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import { h, Helmet, ssr } from "https://crux.land/nanossr@0.0.4";
import { serveDir } from "https://deno.land/std/http/file_server.ts";
import { walk } from "https://deno.land/std/fs/walk.ts";
import { dirname, relative } from "https://deno.land/std/path/mod.ts";
import { fromFileUrl } from "https://deno.land/std/path/mod.ts";
import { serve } from "https://deno.land/std/http/mod.ts";
import * as gfm from "https://deno.land/x/gfm/mod.ts";
import { default as frontMatter } from "https://esm.sh/front-matter@4.0.2?pin=v57";

let postIndex = [];
const posts = new Map<string, unknown>();

export default async function blog(url) {
  const dirUrl = dirname(url);
  const path = fromFileUrl(dirUrl);
  const cwd = Deno.cwd();
  const postsUnordered = [];
  for await (const entry of walk(path)) {
    if (entry.isFile && entry.path.endsWith(".md")) {
      // console.log(entry);
      const pathname = "/" + relative(cwd, entry.path);
      const contents = await Deno.readTextFile(entry.path);
      const post = frontMatter(contents);
      post.pathname = pathname;
      posts[pathname] = post
      postsUnordered.push(post);
    }
  }

	postIndex = postsUnordered.sort((a, b) => {
		const aDate = new Date(a.attributes.publish_date);
		const bDate = new Date(b.attributes.publish_date);
		return bDate.getTime() - aDate.getTime();
	});


  console.log("http://localhost:8000/");
  serve(handler);
}

async function handler(req) {
  let { pathname } = new URL(req.url);
  if (pathname == "/static/gfm.css") {
    return new Response(gfm.CSS, {
      headers: {
        "content-type": "text/css",
      },
    });
  } 

  if (pathname == "/") {
    return ssr(() => <Index/>);
  }

  console.log(pathname);

  let post = posts[pathname];
  if (!post) {
    return serveDir(req);
  }

  return ssr(() => <Post name="World" post={post} />);
}

const Index = (props) => {
  return (
    <div class="max-w-screen-md px-4 pt-16 mx-auto">
      <Helmet>
        <title>Blog</title>
        <link rel="stylesheet" href="/static/gfm.css" />
      </Helmet>
      <h1 class="text-5xl font-bold">Blog</h1>
      <div class="mt-8">
        {
          postIndex.map((post) => <PostCard post={post}/>)
        }
      </div>
    </div>
  );
};

function PostCard(props: { post: Post }) {
  const post = props.post;
  return (
    <div class="py-8 border(t gray-200) grid sm:grid-cols-3 gap-2">
      <div class="w-56 text-gray-500">
        <p>
          <PrettyDate date={post.attributes.publish_date} />
        </p>
      </div>
      <a class="sm:col-span-2" href={post.pathname}>
        <h3 class="text(2xl gray-900) font-bold">
          {post.attributes.title}
        </h3>
        <div class="mt-4 text-gray-900">
          {post.attributes.snippet}
        </div>
      </a>
    </div>
  );
}

function Post(props) {
  const { post } = props;
  const html = gfm.render(post.body);

  console.log("background", post.attributes.background);

  return (
    <div class="min-h-screen">
      <Helmet>
        {post.attributes.background && (
					<body style={`background: ${post.attributes.background}`} />
        )}
        <title>{post.title}</title>
        <link rel="stylesheet" href="/static/gfm.css" />
        {post.snippet && <meta name="description" content={post.snippet} />}
        <meta property="og:title" content={post.attributes.title} />
      </Helmet>
      {post.attributes.cover_html && (
        <div dangerouslySetInnerHTML={{ __html: post.attributes.cover_html }} />
      )}
      <article class="max-w-screen-md px-4 pt-8 md:pt-16 mx-auto">
        <h1 class="text-5xl text-gray-900 font-bold">
          {post.attributes.title}
        </h1>
        <div class="mt-8 text-gray-500">
          <p class="flex gap-2 items-center">
            <PrettyDate date={post.attributes.publish_date} />
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
};

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function PrettyDate(props: { date: string | Date }) {
  console.log(props.date);
  const date = new Date(props.date);
  console.log(date);
  return (
    <time dateTime={date.toISOString()}>
      {formatter.format(date)}
    </time>
  );
}
