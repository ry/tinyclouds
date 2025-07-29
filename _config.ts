import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";
import jsx from "lume/plugins/jsx.ts";
import mdx from "lume/plugins/mdx.ts";

const site = lume({
  src: ".",
  dest: "_site",
}, {
  url: "https://tinyclouds.ry.deno.net",
});

site.use(jsx());
site.use(mdx());
site.use(date());
site.use(slugify_urls());

// Copy static files
site.copy("colorize/", "colorize/");
site.copy("residency/", "residency/");
site.copy([".jpg", ".jpeg", ".png", ".pdf"]);

// Set default layout for markdown posts (excluding index.page.ts)
site.process([".md"], (pages) => {
  for (const page of pages) {
    if (
      page.src.path !== "/index" && page.data.title && page.data.publish_date
    ) {
      page.data.layout = "post.tsx";
    }
  }
});

export default site;
