import { IncomingMessage } from 'http';

export function readRequestParameters(req: IncomingMessage): Promise<any> {
  const url = new URL(`http://localhost${req.url || ''}`);
  const parameters: any = {};
  for (const [key, value] of url.searchParams.entries()) {
    parameters[key] = value;
  }
  if (req.method === 'POST') {
    return new Promise((resolve, reject) => {
      let body = Buffer.alloc(0);

      req.on('data', function(data) {
        body = Buffer.concat([body, data]);

        // Too much POST data, kill the connection!
        if (body.length > 1_000_000) {
          req.connection.destroy();
        }
      });

      req.on('end', function() {
        try {
          const bodyParameters = JSON.parse(body.toString());
          resolve({
            ...parameters,
            ...bodyParameters,
          });
        } catch (err) {
          reject(err);
        }
      });
    });
  } else {
    return Promise.resolve(parameters);
  }
}