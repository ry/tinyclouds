---
title: Asynchronous I/O in Windows for Unix Programmers
publish_date: 2011-04-26
---

This document was an attempt at understanding how best to port Node.js to
Windows. The result of the port was the library
[libuv](https://github.com/libuv/libuv), which (among other things) provides a
unified interface for asynchronous networking on the three big operating
systems: Linux, OSX, and Windows.

This document assumes you are familiar with how non-blocking socket I/O is done
in Unix.

## IOCP

The syscall
[`select` is available in Windows](http://msdn.microsoft.com/en-us/library/ms740141(v=VS.85).aspx)
but `select` processing is O(n) in the number of file descriptors unlike the
modern constant-time multiplexers like epoll which makes select unacceptable for
high-concurrency servers. This document will describe how high-concurrency
programs are designed in Windows.

Instead of [epoll](http://en.wikipedia.org/wiki/Epoll) or
[kqueue](http://en.wikipedia.org/wiki/Kqueue), Windows has its own I/O
multiplexer called
[I/O completion ports](http://msdn.microsoft.com/en-us/library/aa365198(VS.85).aspx)
(IOCPs). IOCPs are the objects used to poll
[overlapped I/O](http://msdn.microsoft.com/en-us/library/ms686358(v=vs.85).aspx)
for completion. IOCP polling is constant time (REF?).

The fundamental variation is that in a Unix you generally ask the kernel to wait
for state change in a file descriptor's readability or writablity. With
overlapped I/O and IOCPs the programmers waits for asynchronous function calls
to complete. For example, instead of waiting for a socket to become writable and
then using
[`send(2)`](http://www.kernel.org/doc/man-pages/online/pages/man2/send.2.html)
on it, as you commonly would do in a Unix, with overlapped I/O you would rather
[`WSASend()`](http://msdn.microsoft.com/en-us/library/ms742203(v=vs.85).aspx)
the data and then wait for it to have been sent.

Unix non-blocking I/O is not beautiful. A principle abstraction in Unix is the
unified treatment of many things as files (or more precisely as file
descriptors). `write(2)`, `read(2)`, and `close(2)` work with TCP sockets just
as they do on regular files. Well—kind of. Synchronous operations work similarly
on different types of file descriptors but once demands on performance drive you
to world of `O_NONBLOCK` various types of file descriptors can act quite
different for even the most basic operations. In particular, regular file system
files do _not_ support non-blocking operations. (Disturbingly no man page
mentions this rather important fact.) For example, one cannot poll on a regular
file FD for readability expecting it to indicate when it is safe to do a
non-blocking read. Regular file are always readable and `read(2)` calls _always_
have the possibility of blocking the calling thread for an unknown amount of
time.

POSIX has defined
[an asynchronous interface](http://pubs.opengroup.org/onlinepubs/007908799/xsh/aio.h.html)
for some operations but implementations for many Unixes have unclear status. On
Linux the `aio_*` routines are implemented in userland in GNU libc using
pthreads.
[`io_submit(2)`](http://www.kernel.org/doc/man-pages/online/pages/man2/io_submit.2.html)
does not have a GNU libc wrapper and has been reported
[to be very slow and possibly blocking](http://voinici.ceata.org/~sana/blog/?p=248).
[Solaris has real kernel AIO](http://download.oracle.com/docs/cd/E19253-01/816-5171/aio-write-3rt/index.html)
but it's unclear what its performance characteristics are for socket I/O as
opposed to disk I/O. Contemporary high-performance Unix socket programs use
non-blocking file descriptors with a I/O multiplexer—not POSIX AIO. Common
practice for accessing the disk asynchronously is still done using custom
userland thread pools—not POSIX AIO.

Windows IOCPs does support both sockets and regular file I/O which greatly
simplifies the handling of disks. For example,
[`ReadFileEx()`](http://msdn.microsoft.com/en-us/library/aa365468(v=VS.85).aspx)
operates on both. As a first example let's look at how `ReadFile()` works.

```c
typedef void* HANDLE;

BOOL ReadFile(HANDLE file,
              void* buffer,
              DWORD numberOfBytesToRead,
              DWORD* numberOfBytesRead,
              OVERLAPPED* overlapped);
```

The function has the possibility of executing the read synchronously or
asynchronously. A synchronous operation is indicated by returning 0 and
[WSAGetLastError()](http://msdn.microsoft.com/en-us/library/ms741580(v=VS.85).aspx)
returning `WSA_IO_PENDING`. When `ReadFile()` operates asynchronously the the
user-supplied
[`OVERLAPPED*`](http://msdn.microsoft.com/en-us/library/ms741665(v=VS.85).aspx)
is a handle to the incomplete operation.

```c
typedef struct {
  unsigned long* Internal;
  unsigned long* InternalHigh;
  union {
    struct {
      WORD Offset;
      WORD OffsetHigh;
    };
    void* Pointer;
  };
  HANDLE hEvent;
} OVERLAPPED;
```

To poll on the completion of one of these functions, use an IOCP,
`overlapped->hEvent`, and
[`GetQueuedCompletionStatus()`](http://msdn.microsoft.com/en-us/library/aa364986(v=vs.85).aspx).

### Simple TCP Connection Example

To demonstrate the use of `GetQueuedCompletionStatus()` an example of connecting
to `localhost` at port 8000 is presented.

```c
char* buffer[200];
WSABUF b = { buffer, 200 };
size_t bytes_recvd;
int r, total_events;
OVERLAPPED overlapped;
HANDLE port;

port = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, NULL, 0);
if (!port) {
  goto error;
}

r = WSARecv(socket, &b, 1, &bytes_recvd, NULL, &overlapped, NULL);

CreateIoCompletionPort(port, &overlapped.hEvent);

if (r == 0) {
  if (WSAGetLastError() == WSA_IO_PENDING) {
    /* Asynchronous */
    GetQueuedCompletionStatus()


    if (r == WAIT_TIMEOUT) {
      printf("Timeout\n");
    } else {

    }


  } else {
    /* Error */
    printf("Error %d\n", WSAGetLastError());
  }
} else {
  /* Synchronous */
  printf("read %ld bytes from socket\n", bytes_recvd);
}
```

### Previous Work

Writing code that can take advantage of the best worlds on across Unix operating
systems and Windows is very difficult, requiring one to understand intricate
APIs and undocumented details from many different operating systems. There are
several projects which have made attempts to provide an abstraction layer but in
the author's opinion, none are completely satisfactory.

**Marc Lehmann's [libev](http://software.schmorp.de/pkg/libev.html) and
[libeio](http://software.schmorp.de/pkg/libeio.html).** libev is the perfect
minimal abstraction of the Unix I/O multiplexers. It includes several helpful
tools like `ev_async`, which is for asynchronous notification, but the main
piece is the `ev_io`, which informs the user about the state of file
descriptors. As mentioned before, in general it is not possible to get state
changes for regular files—and even if it were the `write(2)` and `read(2)` calls
do not guarantee that they won't block. Therefore libeio is provided for calling
various disk-related syscalls in a managed thread pool. Unfortunately the
abstraction layer which libev targets is not appropriate for IOCPs—libev works
strictly with file descriptors and does not the concept of a _socket_.
Furthermore users on Unix will be using libeio for file I/O which is not ideal
for porting to Windows. On windows libev currently uses `select()`—which is
limited to 64 file descriptors per thread.

**[libevent](http://monkey.org/~provos/libevent/).** Somewhat bulkier than libev
with code for RPC, DNS, and HTTP included. Does not support file I/O. libev was
created after Lehmann
[evaluated libevent and rejected it](http://www.mail-archive.com/libevent-users@monkey.org/msg00753.html)—it's
interesting to read his reasons why.
[A major rewrite](http://google-opensource.blogspot.com/2010/01/libevent-20x-like-libevent-14x-only.html)
was done for version 2 to support Windows IOCPs but
[anecdotal evidence](http://www.mail-archive.com/libevent-users@monkey.org/msg01730.html)
suggests that it is still not working correctly.

**[Boost ASIO](http://www.boost.org/doc/libs/1_43_0/doc/html/boost_asio.html).**
It basically does what you want on Windows and Unix for sockets. That is, epoll
on Linux, kqueue on Macintosh, IOCPs on Windows. It does not support file I/O.
In the author's opinion is it too large for a not extremely difficult problem
(~300 files, ~12000 semicolons).

## File Types

Almost every socket operation that you're familiar with has an overlapped
counter-part. The following section tries to pair Windows overlapped I/O
syscalls with non-blocking Unix ones.

### TCP Sockets

TCP Sockets are by far the most important stream to get right. Servers should
expect to be handling tens of thousands of these per thread, concurrently. This
is possible with overlapped I/O in Windows if one is careful to avoid Unix-ism
like file descriptors. (Windows has a hard limit of 2048 open file
descriptors—see
[`_setmaxstdio()`](http://msdn.microsoft.com/en-us/library/6e3b887c.aspx).)

`send(2)`, `write(2)`

Windows:
[`WSASend()`](http://msdn.microsoft.com/en-us/library/ms742203(v=vs.85).aspx),
[`WriteFileEx()`](http://msdn.microsoft.com/en-us/library/aa365748(v=VS.85).aspx)

`recv(2)`, `read(2)`

Windows:
[`WSARecv()`](http://msdn.microsoft.com/en-us/library/ms741688(v=VS.85).aspx),
[`ReadFileEx()`](http://msdn.microsoft.com/en-us/library/aa365468(v=VS.85).aspx)

`connect(2)`

Windows:
[`ConnectEx()`](http://msdn.microsoft.com/en-us/library/ms737606(VS.85).aspx)

Non-blocking `connect()` is has difficult semantics in Unix. The proper way to
connect to a remote host is this: call `connect(2)` while it returns
`EINPROGRESS` poll on the file descriptor for writablity. Then use

int error; socklen_t len = sizeof(int); getsockopt(fd, SOL_SOCKET, SO_ERROR,
&error, &len);

A zero `error` indicates that the connection succeeded. (Documented in
`connect(2)` under `EINPROGRESS` on the Linux man page.)

`accept(2)`

Windows:
[`AcceptEx()`](http://msdn.microsoft.com/en-us/library/ms737524(v=VS.85).aspx)

`sendfile(2)`

Windows:
[`TransmitFile()`](http://msdn.microsoft.com/en-us/library/ms740565(v=VS.85).aspx)

The exact API of `sendfile(2)` on Unix has not been agreed on yet. Each
operating system does it slightly different. All `sendfile(2)` implementations
(except possibly FreeBSD?) are blocking even on non-blocking sockets.

- [Linux `sendfile(2)`](http://www.kernel.org/doc/man-pages/online/pages/man2/sendfile.2.html)
- [FreeBSD `sendfile(2)`](http://www.freebsd.org/cgi/man.cgi?query=sendfile&sektion=2)
- [Darwin `sendfile(2)`](http://www.manpagez.com/man/2/sendfile/)

Marc Lehmann has written
[a portable version in libeio](https://github.com/joyent/node/blob/2c185a9dfd3be8e718858b946333c433c375c295/deps/libeio/eio.c#L954-1080).

`shutdown(2)`, graceful close, half-duplex connections

[Graceful Shutdown, Linger Options, and Socket Closure](http://msdn.microsoft.com/en-us/library/ms738547(v=VS.85).aspx)
[`DisconnectEx()`](http://msdn.microsoft.com/en-us/library/ms737757(VS.85).aspx)

`close(2)`

[`closesocket()`](http://msdn.microsoft.com/en-us/library/ms737582(v=VS.85).aspx)

The following are nearly same in Windows overlapped and Unix non-blocking
sockets. The only difference is that the Unix variants take integer file
descriptors while Windows uses `SOCKET`.

- [`sockaddr`](http://msdn.microsoft.com/en-us/library/ms740496(v=VS.85).aspx)
- [`bind()`](http://msdn.microsoft.com/en-us/library/ms737550(v=VS.85).aspx)
- [`getsockname()`](http://msdn.microsoft.com/en-us/library/ms738543(v=VS.85).aspx)

### Named Pipes

Windows has "named pipes" which are more or less the same as
[`AF_Unix` domain sockets](http://www.kernel.org/doc/man-pages/online/pages/man7/unix.7.html).
`AF_Unix` sockets exist in the file system often looking like

```
/tmp/_pipename_
```

Windows named pipes have a path, but they are not directly part of the file
system; instead they look like

```
\\.\pipe\pipename
```

`socket(AF_Unix, SOCK_STREAM, 0), bind(2), listen(2)`

[`CreateNamedPipe()`](http://msdn.microsoft.com/en-us/library/aa365150(VS.85).aspx)

Use `FILE_FLAG_OVERLAPPED`, `PIPE_TYPE_BYTE`, `PIPE_NOWAIT`.

`send(2)`, `write(2)`

[`WriteFileEx()`](http://msdn.microsoft.com/en-us/library/aa365748(v=VS.85).aspx)

`recv(2)`, `read(2)`

[`ReadFileEx()`](http://msdn.microsoft.com/en-us/library/aa365468(v=VS.85).aspx)

`connect(2)`

[`CreateNamedPipe()`](http://msdn.microsoft.com/en-us/library/aa365150(VS.85).aspx)

`accept(2)`

[`ConnectNamedPipe()`](http://msdn.microsoft.com/en-us/library/aa365146(v=VS.85).aspx)

Examples:

- [Named Pipe Server Using Completion Routines](http://msdn.microsoft.com/en-us/library/aa365601(v=VS.85).aspx)
- [Named Pipe Server Using Overlapped I/O](http://msdn.microsoft.com/en-us/library/aa365603(v=VS.85).aspx)

### Regular Files

In Unix file system files are not able to use non-blocking I/O. There are some
operating systems that have asynchronous I/O but it is not standard and at least
on Linux is done with pthreads in GNU libc. For this reason applications
designed to be portable across different Unixes must manage a thread pool for
issuing file I/O syscalls.

The situation is better in Windows: true overlapped I/O is available when
reading or writing a stream of data to a file.

`write(2)`

Windows:
[`WriteFileEx()`](http://msdn.microsoft.com/en-us/library/aa365748(v=VS.85).aspx)

Solaris's event completion ports has true in-kernel async writes with
[aio_write(3RT)](http://download.oracle.com/docs/cd/E19253-01/816-5171/aio-write-3rt/index.html)

`read(2)`

Windows:
[`ReadFileEx()`](http://msdn.microsoft.com/en-us/library/aa365468(v=VS.85).aspx)

Solaris's event completion ports has true in-kernel async reads with
[aio_read(3RT)](http://download.oracle.com/docs/cd/E19253-01/816-5171/aio-read-3rt/index.html)

### Console/TTY

It is (usually?) possible to poll a Unix TTY file descriptor for readability or
writablity just like a TCP socket—this is very helpful and nice. In Windows the
situation is worse, not only is it a completely different API but there are not
overlapped versions to read and write to the TTY. Polling for readability can be
accomplished by waiting in another thread with
[`RegisterWaitForSingleObject()`](http://msdn.microsoft.com/en-us/library/ms685061(VS.85).aspx).

`read(2)`

[`ReadConsole()`](http://msdn.microsoft.com/en-us/library/ms684958(v=VS.85).aspx)
and
[`ReadConsoleInput()`](http://msdn.microsoft.com/en-us/library/ms684961(v=VS.85).aspx)
do not support overlapped I/O and there are no overlapped counter-parts. One
strategy to get around this is

[RegisterWaitForSingleObject](http://msdn.microsoft.com/en-us/library/ms685061(VS.85).aspx)(&tty_wait_handle,
tty_handle, tty_want_poll, NULL, INFINITE, WT_EXECUTEINWAITTHREAD |
WT_EXECUTEONLYONCE)

which will execute `tty_want_poll()` in a different thread. You can use this to
notify the calling thread that `ReadConsoleInput()` will not block.

`write(2)`

[`WriteConsole()`](http://msdn.microsoft.com/en-us/library/ms687401(v=VS.85).aspx)
is also blocking but this is probably acceptable.

[`tcsetattr(3)`](http://www.kernel.org/doc/man-pages/online/pages/man3/tcsetattr.3.html)

[`SetConsoleMode()`](http://msdn.microsoft.com/en-us/library/ms686033(VS.85).aspx)

## Assorted Links

tips

- overlapped = non-blocking.
- There is no overlapped
  [`GetAddrInfoEx()`](http://msdn.microsoft.com/en-us/library/ms738518(VS.85).aspx)
  function. It seems Asynchronous Procedure Calls must be used instead.
- [`Windows Sockets 2`](http://msdn.microsoft.com/en-us/library/ms740673(VS.85).aspx")

IOCP:

- [Synchronization and Overlapped Input and Output](http://msdn.microsoft.com/en-us/library/ms686358(v=vs.85).aspx)
- [`OVERLAPPED` Structure](http://msdn.microsoft.com/en-us/library/ms741665(v=VS.85).aspx)
  - [`GetOverlappedResult()`](http://msdn.microsoft.com/en-us/library/ms683209(v=VS.85).aspx)
  - [`HasOverlappedIoCompleted()`](http://msdn.microsoft.com/en-us/library/ms683244(v=VS.85).aspx)
  - [`CancelIoEx()`](http://msdn.microsoft.com/en-us/library/aa363792(v=vs.85).aspx)
    — cancels an overlapped operation.
- [`WSASend()`](http://msdn.microsoft.com/en-us/library/ms742203(v=vs.85).aspx)
- [`WSARecv()`](http://msdn.microsoft.com/en-us/library/ms741688(v=VS.85).aspx)
- [`ConnectEx()`](http://msdn.microsoft.com/en-us/library/ms737606(VS.85).aspx)
- [`TransmitFile()`](http://msdn.microsoft.com/en-us/library/ms740565(v=VS.85).aspx)
  — an async `sendfile()` for windows.
- [`WSADuplicateSocket()`](http://msdn.microsoft.com/en-us/library/ms741565(v=VS.85).aspx)
  — describes how to share a socket between two processes.
- [`_setmaxstdio()`](http://msdn.microsoft.com/en-us/library/6e3b887c.aspx) —
  something like setting the maximum number of file decriptors and
  [`setrlimit(3)`](http://www.kernel.org/doc/man-pages/online/pages/man2/setrlimit.2.html)
  AKA `ulimit -n`. Note the file descriptor limit on windows is 2048.

APC:

- [Asynchronous Procedure Calls](http://msdn.microsoft.com/en-us/library/ms681951(v=vs.85).aspx)
- [`DNSQuery()`](http://msdn.microsoft.com/en-us/library/ms682016) — General
  purpose DNS query function like `res_query()` on Unix.

Pipes:

- [`Pipe functions`](http://msdn.microsoft.com/en-us/library/aa365781(v=VS.85).aspx)
- [`CreateNamedPipe`](http://msdn.microsoft.com/en-us/library/aa365150(VS.85).aspx)
- [`CallNamedPipe`](http://msdn.microsoft.com/en-us/library/aa365144(v=VS.85).aspx)
  — like `accept` is for Unix pipes.
- [`ConnectNamedPipe`](http://msdn.microsoft.com/en-us/library/aa365146(v=VS.85).aspx)

`WaitForMultipleObjectsEx` is pronounced "wait for multiple object sex". Also
useful:
[Introduction to Visual C++ for Unix Users](http://msdn.microsoft.com/en-us/library/xw1ew2f8(v=vs.80).aspx)

[Network Programming For Microsoft Windows 2nd Edition 2002](http://ebookbrowse.com/network-programming-for-microsoft-windows-2nd-edition-2002-pdf-d73663829).
Juicy details on page 119.
