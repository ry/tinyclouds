---
title: My Dream Stack
publish_date: 2022-05-29
---

[A talk on this subject given at Remix Conf](https://www.youtube.com/watch?v=4_nxvVTNY9s&t=10790s)

The web has become the medium of human information. Over the past 15 years,
we've seen institution after institution add web interfaces. Everything from the
New York Times to the State of New York can be accessed on the web.

At this point it's safe to assume that the web will still be here, say, 5 years
from now - if not 10 or 20 years. That means the various technical bits that
make up the web will be here: HTTP, HTML, CSS, and JavaScript. JavaScript is
inherently tied to the web, and thus inherently deeply rooted in human
institutions. JavaScript will still be important in the future.

Web Frameworks Are Constantly Improving. React components, path based routing,
layout routes: these are all massively important innovations. Remix is a perfect
example of the breakneck speed of innovation. Yet relatively little over the
past decade has changed in the JavaScript runtime space. It's all still my
software - it's all still Node.js. This will change over the next couple years.

Changes in the runtime space let us address fundemental problems in the
JavaScript ecosystem. In this post I want to describe in the abstract what I
think an ideal workflow for JavaScript programs looks like.

## My Dream Stack

Reduces boilerplate - ideally very small apps can be defined in a single file
Uses JavaScript, the universal scripting language Async I/O and optimal HTTP
server performance Built-in, uniform dev tools - code formatter, linter, doc
generation, etc

## My dream stack extends to the cloud

Serverless - managed, pay per request, free for low-traffic/demo apps Edge -
code runs geographically near users. Excellent latency everywhere. Cold starts
must be fast. No config. Reduce boilerplate!

## This Blog as a Demo

Almost entirely markdown Server-side Syntax Highlighting 100% server rendered,
no client side JS Source code in Github - PR previews Serverless at Edge
Deployments to prod take less than 10 sec https://github.com/ry/tinyclouds
https://tinyclouds.org/

## The Post-Unix Future

Serverless at Edge runtimes like Cloudflare Workers and Deno Deploy are very
cheap and very fast.

Performance and simplicity is achieved by using V8 Isolates for multi-tenancy
rather than Linux VMs

Prediction: to maximize the utility of serverless, web frameworks will soon be
built on post-Unix primitives rather than Node.js primitives.

https://fresh.deno.dev/ example

Call To Action: Demonstrate Remix deploying in less than 10 seconds

Hint: the build step must be JIT instead of AOT

## Deno Deploy

Serverless JavaScript at Edge 32 regions => low-latency world-wide Powering
Netlify and Supabase Edge Functions
