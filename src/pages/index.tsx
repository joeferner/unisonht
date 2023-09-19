import JSX from "../helpers/jsx";
import { UnisonHTModule } from "../UnisonHTModule";

export interface IndexParams {
  modules: UnisonHTModule[];
  content: string;
}

export function index(params: IndexParams): string {
  return (
    "<!doctype html>\n" +
    (
      <html lang="en" data-bs-theme="dark">
        <head>
          <meta charset="utf-8"></meta>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          <title>UnisonHT</title>
          <link href="/bootstrap/bootstrap.min.css" rel="stylesheet"></link>
          <link href="/unisonht.css" rel="stylesheet"></link>
        </head>
        <body>
          <header class="navbar navbar-expand-lg sticky-top">
            <nav class="container-xxl bd-gutter flex-wrap flex-lg-nowrap" aria-label="Main navigation">
              <div class="container-fluid">
                <a class="navbar-brand" href="/">
                  UnisonHT
                </a>
              </div>
            </nav>
          </header>

          <div class="container-xxl bd-gutter mt-3 bd-layout">
            <div class="page-wrapper">
              <aside class="sidebar-wrapper">
                <div class="sidebar">
                  {params.modules.map((module) => (
                    <div>
                      <a href={`/module/${encodeURIComponent(module.name)}/`}>{module.name}</a>
                    </div>
                  ))}
                </div>
              </aside>
              <main class="bd-main order-1">{params.content}</main>
            </div>
          </div>

          <script src="/unisonht.js"></script>
          <script src="/bootstrap/bootstrap.bundle.min.js"></script>
        </body>
      </html>
    )
  );
}
