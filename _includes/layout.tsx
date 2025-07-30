export default function Layout(
  { title, background, children }: {
    title?: string;
    background?: string;
    children: React.ReactNode;
  },
) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          {title && title !== "Ryan Dahl" ? `${title} | ` : ""}Ryan Dahl
        </title>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Ryan Dahl"
          href="/feed"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            function toggleTheme() {
              document.body.classList.toggle('dark');
              localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
            }
            
            // Apply saved theme on load
            if (localStorage.getItem('theme') === 'dark' || 
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.body.classList.add('dark');
            }
          `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              box-sizing: border-box;
            }

            body {
              font-family: "Times New Roman", Times, serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background: ${background || "#fff"};
              color: #333;
              font-size: 18px;
            }

            body.dark {
              background: #111;
              color: #eee;
            }

            .container {
              max-width: 680px;
              margin: 0 auto;
              padding: 3rem 2rem;
            }

            .header {
              display: flex;
              align-items: center;
              margin-bottom: 4rem;
              position: relative;
            }

            .avatar {
              width: 80px;
              height: 80px;
              margin-right: 1.5rem;
            }

            .header-content {
              flex: 1;
            }

            .site-title {
              font-size: 1.875rem;
              font-weight: 800;
              margin: 0 0 0.5rem 0;
              line-height: 1.2;
            }

            .links {
              display: flex;
              gap: 1rem;
              align-items: center;
            }
            
            .theme-toggle, .back-button {
              background: none;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 0.75rem;
              cursor: pointer;
              color: #666;
              text-decoration: none;
              display: inline-block;
            }
            
            .theme-toggle {
              position: absolute;
              top: 0;
              right: 0;
            }
            
            .back-button {
              position: absolute;
              top: 0;
              left: 0;
            }
            
            .theme-toggle:hover, .back-button:hover {
              background: #f8f8f8;
              color: #333;
              text-decoration: none;
            }
            
            body.dark .theme-toggle, body.dark .back-button {
              border-color: #555;
              color: #aaa;
            }
            
            body.dark .theme-toggle:hover, body.dark .back-button:hover {
              background: #333;
              color: #eee;
            }

            .links a {
              font-size: 0.875rem;
              color: #666;
            }

            .links a:hover {
              color: #06c;
            }

            body.dark .links a {
              color: #aaa;
            }
            
            body.dark .links a:hover {
              color: #6bf;
            }

            @media (max-width: 640px) {
              .header {
                gap: 1rem;
              }
              
              .avatar {
                width: 64px;
                height: 64px;
              }
              
              .site-title {
                font-size: 1.5rem;
              }
            }

            a {
              color: #06c;
              text-decoration: none;
            }

            a:hover {
              text-decoration: underline;
            }

            body.dark a {
              color: #6bf;
            }

            h1, h2, h3, h4, h5, h6 {
              font-weight: 700;
              line-height: 1.25;
              margin: 2rem 0 1rem 0;
            }

            h1, .post-title { 
              font-size: 2.25rem;
            }
            
            h2 { font-size: 1.875rem; }
            h3 { font-size: 1.5rem; }

            .post-meta, .post-list .post-date {
              color: #666;
              font-size: 0.875rem;
            }
            
            .post-meta {
              margin-bottom: 3rem;
            }

            body.dark .post-meta, body.dark .post-list .post-date {
              color: #aaa;
            }

            .post-cover {
              margin-bottom: 3rem;
            }

            .post-cover svg {
              width: 100%;
              height: auto;
              max-height: 350px;
            }

            .post-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            .post-list li {
              margin-bottom: 1.5rem;
            }

            .post-list h2 {
              margin: 0 0 0.5rem 0;
              font-size: 1.5rem;
              font-weight: 600;
            }

            .content p {
              margin-bottom: 1.5rem;
            }

            .content blockquote {
              border-left: 4px solid #eee;
              margin: 2rem 0;
              padding: 1rem 0 1rem 1.5rem;
              font-style: italic;
            }

            body.dark .content blockquote {
              border-left-color: #555;
            }

            .content pre {
              background-color: #f8f8f8;
              padding: 1.5rem;
              border-radius: 0.375rem;
              overflow-x: auto;
              font-size: 0.875rem;
              margin: 2rem 0;
            }

            body.dark .content pre {
              background-color: #1a1a1a;
            }

            .content code {
              background-color: #f8f8f8;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-size: 0.875em;
            }

            body.dark .content code {
              background-color: #1a1a1a;
            }

            @media (max-width: 640px) {
              .container {
                padding: 2rem 1.5rem;
              }
              
              body {
                font-size: 16px;
              }
              
              h1, .post-title { font-size: 1.875rem; }
              h2 { font-size: 1.5rem; }
            }
          `,
          }}
        />
      </head>
      <body>
        <div class="container">
          {children}
        </div>
      </body>
    </html>
  );
}
