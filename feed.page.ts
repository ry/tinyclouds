export const url = "/feed";

export default function ({ search }: Lume.Data) {
  // Generate RSS content for /feed to match original tinyclouds.org
  const posts = search.pages()
    .filter((page) => page.title && page.publish_date)
    .sort((a, b) =>
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
    );

  const rssItems = posts.map((post) => {
    const url = `https://tinyclouds${post.url}`;
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
