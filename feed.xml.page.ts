export const url = "/feed.xml";

export default function () {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=/feed">
</head>
<body>
  <p>Redirecting to <a href="/feed">/feed</a>...</p>
</body>
</html>`;
}
