export const layout = "layout.tsx";
export const title = "Ryan Dahl";

export default function Home({ search }: Lume.Data) {
  const posts = search.pages("src.path*=/posts/")
    .filter((page) => page.publish_date)
    .sort((a, b) =>
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
    );

  return (
    <ul class="post-list">
      {posts.map((post) => {
        const formattedDate = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(post.publish_date));

        return (
          <li key={post.url}>
            <h2>
              <a href={post.url}>{post.title}</a>
            </h2>
            <div class="post-date">{formattedDate}</div>
          </li>
        );
      })}
    </ul>
  );
}
