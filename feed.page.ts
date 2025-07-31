export const url = "/feed";

export default function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  // Generate RSS content for /feed to match original tinyclouds.org
  const posts = search.pages("type=post publish_date!=undefined", "publish_date=desc");

  const rssItems = posts.map((post) => {
    const url = helpers.url(post.url, true);
    const date = new Date(post.publish_date).toUTCString();

    return `    <item>
      <title>${post.title}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${date}</pubDate>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ryan Dahl</title>
    <description>Personal blog of Ryan Dahl</description>
    <link>https://tinyclouds.ry.deno.net</link>
    <language>en</language>
    <generator>Lume v3.0.5</generator>
${rssItems}
  </channel>
</rss>`;
}
