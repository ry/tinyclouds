export const layout = "layout.tsx";

export default function Post(
  { title, publish_date, cover_html, children }: {
    title: string;
    publish_date: Date;
    cover_html?: string;
    children: React.ReactNode;
  },
) {
  const formattedDate = new Date(publish_date).toISOString().split("T")[0];

  return (
    <>
      <div class="header">
        <a href="/" class="back-button">← Back</a>
        <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
      </div>

      {cover_html && (
        <div
          class="post-cover"
          dangerouslySetInnerHTML={{ __html: cover_html }}
        />
      )}

      <h1 class="post-title">{title}</h1>
      <div class="post-meta">
        {formattedDate}
      </div>

      <div class="content">
        {children}
      </div>
    </>
  );
}
