export const layout = "layout.tsx";
export const title = "Ryan Dahl";
export const url = "/";

export default function ({ search }: Lume.Data) {
  const posts = search.pages(
    "type=post publish_date!=undefined",
    "publish_date=desc",
  );

  return `
    <div class="header">
      <img src="/ry.jpg" alt="Ryan Dahl" class="avatar">
      <div class="header-content">
        <h1 class="site-title">Ryan Dahl</h1>
        <div class="links">
          <a href="mailto:ry@tinyclouds.org">Email</a>
          <a href="https://github.com/ry">GitHub</a>
          <a href="https://twitter.com/rough__sea">Twitter</a>
          <a href="/feed">RSS</a>
        </div>
      <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
      </div>
    </div>
    
    <ul class="post-list">
      ${
    posts.map((post) => {
      const formattedDate =
        new Date(post.publish_date).toISOString().split("T")[0];

      return `
          <li>
            <h2><a href="${post.url}">${post.title}</a></h2>
            <div class="post-date">${formattedDate}</div>
          </li>
        `;
    }).join("")
  }
    </ul>
  `;
}
