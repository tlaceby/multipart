Multipart Form Middleware for Deno's Opine Framework.

Provides a simple configurable middleware for the Opine framework that handles file and form uploads. Provides a req.files and req.formData fields to the OpineRequest object. Provides configuration for maximum bytes and options for parsing out files and form data.

Currentl a work in progress and does not promise a stable API.



**Simple Example**
```ts
// Import Opine
import { opine } from 'https://deno.land/x/opine@2.3.3/mod.ts';

// Import Middleware
import multipartFormParser from 'https://github.com/tylerlaceby/multipart/raw/main/opine/mod.ts';

// Define Opine App
const app = opine();

// Define main route with a simple form containg upload input and submit button with action that submit to '/upload' route
app.use('/', (req, res) => {
  res.send(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" />
        <input type="submit" value="Upload" /> 
      </form>`);
});

// Define upload route to handle upload submit.
app.use('/upload',  multipartFormParser({files: true}),  (req, res) => {
  console.log(req.body)
  res.json(req.parsedBody);
});

// Start server
app.listen(8000);
```
