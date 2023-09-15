import JSX from "../helpers/jsx";
import { UnisonHTModule } from "../UnisonHTModule";

export function index(params: { modules: UnisonHTModule[] }): string {
  return (
    "<!doctype html>\n" +
    (
      <html lang="en">
        <head>
          <meta charset="utf-8"></meta>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          <title>UnisonHT</title>
          <link href="/bootstrap/bootstrap.min.css" rel="stylesheet"></link>
        </head>
        <body>
          <ul>
            {params.modules.map((module) => (
              <li>
                <a href={`/module/${encodeURIComponent(module.name)}/`}>{module.name}</a>
              </li>
            ))}
          </ul>
          <script src="/bootstrap/bootstrap.bundle.min.js"></script>
        </body>
      </html>
    )
  );
}
