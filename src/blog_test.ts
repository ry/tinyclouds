import { configureBlog, handler } from "./blog.tsx";
import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.137.0/testing/asserts.ts";

const BLOG_URL = new URL("./testdata/main.js", import.meta.url);
const SETTINGS = {
  title: "Test blog",
  subtitle: "This is some subtitle",
  header: "This is some header",
  style: `body { background-color: #f0f0f0; }`,
};
const BLOG_SETTINGS = await configureBlog(false, BLOG_URL.href, SETTINGS);

Deno.test("index page", async () => {
  const resp = await handler(
    new Request("https://blog.deno.dev"),
    BLOG_SETTINGS,
  );
  assert(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("content-type"), "text/html");
  const body = await resp.text();
  assertStringIncludes(body, `<html lang="en">`);
  assertStringIncludes(body, `Test blog`);
  assertStringIncludes(body, `This is some subtitle`);
  assertStringIncludes(body, `This is some header`);
  assertStringIncludes(body, `href="/first"`);
  assertStringIncludes(body, `href="/second"`);
});
