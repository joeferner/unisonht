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
      <html lang="en" data-theme="dark">
        <head>
          <meta charset="utf-8"></meta>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          <title>UnisonHT</title>
          <link href="/@fontsource/roboto/300.css" rel="stylesheet"></link>
          <link href="/@fontsource/roboto/400.css" rel="stylesheet"></link>
          <link href="/@fontsource/roboto/500.css" rel="stylesheet"></link>
          <link href="/@fontsource/roboto/700.css" rel="stylesheet"></link>
          <link href="/@fontawesome/css/fontawesome.css" rel="stylesheet"></link>
          <link href="/@fontawesome/css/brands.css" rel="stylesheet"></link>
          <link href="/@fontawesome/css/solid.css" rel="stylesheet"></link>
          <link href="/unisonht.css" rel="stylesheet"></link>
        </head>
        <body>
          <header class="navbar sticky-top">
            <div class="page-width">
              <button onclick="toggleSidebar()" class="toggle-sidebar-button">
                <i class="fa-solid fa-bars"></i>
              </button>
              <a class="navbar-brand" href="/">
                UnisonHT
              </a>
            </div>
          </header>

          <div class="page-width page-wrapper-wrapper">
            <div class="page-wrapper">
              <aside class="sidebar-wrapper">
                <div class="sidebar">
                  <div class="sidebar-title">Modules</div>
                  {params.modules.map((module) => (
                    <div>
                      <a href={`/module/${encodeURIComponent(module.name)}/`}>{module.name}</a>
                    </div>
                  ))}
                </div>
              </aside>
              <main class="main-content">{params.content}</main>
            </div>
          </div>

          <script src="/unisonht.js"></script>
        </body>
      </html>
    )
  );
}
