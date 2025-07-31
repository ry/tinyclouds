---
title: I hate almost all software
publish_date: 2011-09-29
---

It's unnecessary and complicated at almost every layer. At best I can
congratulate someone for quickly and simply solving a problem on top of the shit
that they are given. The only software that I like is one that I can easily
understand and solves my problems. The amount of complexity I'm willing to
tolerate is proportional to the size of the problem being solved.

In the past year I think I have finally come to understand the ideals of Unix:
file descriptors and processes orchestrated with C. It's a beautiful idea. This
is not however what we interact with. The complexity was not contained. Instead
I deal with DBus and /usr/lib and Boost and ioctls and SMF and signals and
volatile variables and prototypal inheritance and `_C99_FEATURES_` and dpkg and
autoconf.

Those of us who build on top of these systems are adding to the complexity. Not
only do you have to understand `$LD_LIBRARY_PATH` to make your system work but
now you have to understand `$NODE_PATH` too - there's my little addition to the
complexity you must now know! The users - the one who just want to see a
webpage - don't care. They don't care how we organize `/usr`, they don't care
about zombie processes, they don't care about bash tab completion, they don't
care if zlib is dynamically linked or statically linked to Node. There will come
a point where the accumulated complexity of our existing systems is greater than
the complexity of creating a new one. When that happens all of this shit will be
trashed. We can flush boost and glib and autoconf down the toilet and never
think of them again.

Those of you who still find it enjoyable to learn the details of, say, a
programming language - being able to happily recite off if NaN equals or does
not equal null - you just don't yet understand how utterly fucked the whole
thing is. If you think it would be cute to align all of the equals signs in your
code, if you spend time configuring your window manager or editor, if put
unicode check marks in your test runner, if you add unnecessary hierarchies in
your code directories, if you are doing anything beyond just solving the
problem - you don't understand how fucked the whole thing is. No one gives a
fuck about the glib object model.

The only thing that matters in software is the experience of the user.

<a href="https://news.ycombinator.com/item?id=3055154">HN comments</a>
