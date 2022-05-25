---
title: JavaScript Containers
publish_date: 2022-05-04
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
higher level of abstraction.
[Zack Bloom at Cloudflare motivated us back in 2018](https://blog.cloudflare.com/cloud-computing-without-containers/)
to wonder if JavaScript itself can provide a new type of self-contained server
container.

The more we can remove unnecessary abstractions, the closer we can get to the
concept of "The Network Is the Computer". Cloudflare Workers is essentially an
implementation of this concept in the Cloudflare network. Deno Deploy is a new
implementation of this idea (on the GCP network).

In this post I’ll describe how I think about JavaScript Containers and speculate
about how this technology will unfold over the next couple years.

## The Universal Scripting Language

Technology is difficult to predict, but certainly the World Wide Web will be
here in 10 years. Every passing day sees more and more human infrastructure tied
together via web apps - the web is eating the world. If you believe the web will
be here in 10 years, then certainly the standards that make up the web - HTTP,
HTML, CSS, JavaScript - will be here. Thus I’m confident that JavaScript will
continue to be developed and improved.

The web is the fundamental medium of human information. JavaScript is unlike
other programming languages in that it is deeply tied into this infrastructure.

Scripting languages make a lot of sense for many server-side problems. Most of
the code being written is not compute bound, rather it’s bound by productivity:
the speed it can be written and the monetary cost of the developers. Scripting
languages allow business logic to be written faster and cheaper. The scripting
languages (Python, Ruby, Lua, Shell, Perl, Smalltalk, JavaScript) are pretty
similar. There are differences in syntax and APIs, but there’s little else to
contrast them with. Anyone who has spent time in Rust or C understands how
scripting languages feel.

To summarize: scripting languages are useful, but they’re all pretty much the
same, of them JavaScript is by far more wildly used and future proof. Thus it
makes sense to think of JavaScript as the universal scripting language.

## Shell : Executables :: JavaScript : WebAssembly

There is a new higher level container emerging for server software: the
JavaScript sandbox itself.

This container isn’t meant to address the same breadth of problems that Linux
containers target. Its emergence is a result of its simplicity. It minimizes the
boilerplate for web service business logic. It shares concepts with the browser
and reduces the concepts that the programmer needs to know. (Example: when
writing a web service, very likely any systemd configuration is just unnecessary
boilerplate.)

Every web engineer already knows JavaScript browser APIs. Because the JS
container abstraction is built on the same browser APIs, the total amount of
experience the engineer needs is reduced. The universality of Javascript reduces
complexity.

Shell is the interpreted scripting language used to invoke Unix programs. It can
do conditionals, loops, it has variables… but it is unfortunately limited and
difficult to program. Real functionality is relegated to executables.

In this emerging server abstraction layer, JavaScript takes the place of Shell.
It is quite a bit better suited to scripting than Bash or Zsh. Instead of
invoking Linux executables, like shell does, the JavaScript sandbox can invoke
Wasm. If you have some computational heavy lifting, like image resizing, it
probably makes sense to use Wasm rather than writing it in JS. Just like you
wouldn’t write image resizing code in bash, you’d spawn imagemagick.

## The North Star

The future of scripting languages is browser JavaScript. The fundamental mistake
of Node.js was diverging from the browser as new APIs were standardized,
inventing too much. In 2010, we didn’t have ES modules, but once it was
standardized it should have been brought into Node. The same can be said for
promises, async/await, fetch, streams, and more. Antiquated non-standard bits
like CommonJS require, package.json, `node_modules`, NPM, the global `process`
object will ultimately either be standardized and added to the browser or
supplanted by web-aligned replacements.

This higher level container is yet to be standardized. We don’t quite know how
all this will pan out. For the moment Cloudflare Workers and
[Deno Deploy](https://deno.com/deploy) use the
[FetchEvent](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/)
API:

```js
addEventListener("fetch", (event) => {
  event.respondWith(new Response("Hello world"));
});
```

It might be that a better interface yet can be found.

## Conclusion

JavaScript is the universal scripting language. Due to JavaScript’s universality
a new container-like abstraction is emerging that simplifies servers.

I am not claiming that Linux containers are going away. That level of
abstraction will always be useful. It’s just rather low-level for much of the
“business logic” that people write. When you’re building a website things like
systemd configuration are boilerplate.

Maybe the majority of “web services” can be simplified by thinking in terms of
JavaScript containers, rather than Linux containers.

At [Deno](https://deno.com/) we are exploring these ideas; we’re trying to
radically simplify the server abstraction. [We’re hiring](https://deno.com/jobs)
if this sounds interesting to you.

<br/>
<br/>
<br/>
<br/>

[HN comments](https://news.ycombinator.com/item?id=31262542)
