---
title: JavaScript Containers
publish_date: 2021-06-23T10:00:00.000Z
---

The majority of server programs are Linux programs. They consist of a file
system, some executable files, maybe some shared libraries, they probably
interface with system software like systemd or nsswitch.

Docker popularized the use of Linux containers; OS level virtualization that
provides a wonderful mechanism for distributing server software. Each container
image is a dependency-free ready-to-run software package.

Because server software often depends on many system resources and
configuration, deploying it has been challenging in the past. Linux containers
solved that.

A similar hermetic environment can be found in browser JavaScript, albeit at a
higher level of abstraction. JavaScript is has toy-like simplicity compared to
the historical unix artifacts that make up a Linux container. Thus motivating us
to wonder if JavaScript itself can provide a new type of self-contained server
container.

browsers already provide a container-like hermetic environment and that the time
has come to take that container to other contexts

## The Universal Scripting Language

Technology is difficult to predict, but certainly the World Wide Web will be
here in 10 years. Every passing day sees more and more human infrastructure tied
together via web apps. By definition, the standards that make up the web - HTTP,
HTML, CSS, and JavaScript - will be here in the next decade. It is certain that
JavaScript will continue to be developed and improved. There is no alternative
method of programming websites.

JavaScript is unlike other programming languages in that it is deeply tied into
the web, the fundamental medium of human information.

Scripting languages make a lot of sense for many server-side problems. Most of
the code being written in the web service space is not compute bound. Rather it
is bound by productivity: speed it can be written and the monetary cost of the
developers. Dynamic languages allow code to be written faster and cheaper. The
scripting languages (Python, Ruby, Lua, JavaScript, Perl) are all pretty much
the same. There are differences in syntax and APIs, but there’s little else to
contrast them with. Anyone who has learned more than one of these can attest to
this.

## Shell : Executables :: JavaScript : WASM blobs

There is a new higher level container emerging for server software: the
JavaScript sandbox itself.

This container isn’t meant to address the same breadth of problems that Linux
containers target. Rather it’s explicitly for HTTP servers. Its emergence is a
result of its simplicity. It minimizes the boilerplate for web service business
logic. It shares concepts with the browser and eliminates concepts found in
Linux.

Think about this: Every web engineer already knows JavaScript browser APIs and
because the container is built on the same browser APIs, the total amount of
experience the engineer needs is reduced. The universality of Javascript reduces
complexity.

Shell is the interpreted scripting language used to invoke Unix programs. It can
do conditionals, loops, it has variables… but it is unfortunately limited and
difficult to program. Real functionality is relegated to binary executables.

In this emerging server abstraction layer, JavaScript takes the place of Shell.
It is quite a bit better suited to “scripting” than Bash or Zsh. Instead of
invoking Linux programs, like shell does, the JavaScript sandbox executes WASM
binaries. If you have some computational heavy lifting, like image resizing, it
probably makes sense to use WASM rather than writing it in JS. Just like you
wouldn’t write image resizing code in bash, you’d spawn imagemagick.

The North Star

The North Star is the browser JavaScript. That has been and always will be the
future of any JavaScript system. The fundamental mistake of Node.js was
diverging from the browser as new APIs were standardized. We didn’t have fetch()
originally - but once it was standardized it should be been brought into Node.
Antiquated non-standard bits like CommonJS require, package.json, node_modules,
NPM, the global `process` object will ultimately either be standardized or
supplanted by standardized replacements.

This higher level container is yet to be specified and locked into standards.
For the moment Cloudflare Workers and [Deno Deploy](https://deno.com/deploy) use
the
[FetchEvent](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/)

```js
addEventListener("fetch", (event) => {
  event.respondWith(new Response("Hello world"));
});
```

Wasm subset of JS

To be clear, I am not claiming that Linux containers are going away. That level
of abstraction will always be useful - but it’s rather low-level for much of the
server code people write.

(Move follow to top?)
