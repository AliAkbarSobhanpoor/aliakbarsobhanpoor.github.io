
## Development

### 1. Install dependencies

Install the project's npm dependencies, including Tailwind CSS and the Typography plugin, if they are not already installed.

```bash
npm install
```

### 2. Start Tailwind CSS in watch mode

Run the following command to rebuild the CSS whenever you modify the source stylesheet:

```bash
npx @tailwindcss/cli -i ./css/tailwind.css -o ./css/tailwind.generated.css --watch
```

Keep this terminal running during development.

### 3. Start the local HTTP server

Open a second terminal in the project root and run:

```bash
python -m http.server 8000
```

Open the website in your browser:

http://localhost:8000

Keep both terminals running while developing.

> Do not open `index.html` directly using a `file://` URL. Use the local HTTP server so JavaScript can fetch the JSON and Markdown files correctly.

## Production Build

Before deploying, generate the optimized CSS file:

```bash
npx @tailwindcss/cli -i ./css/tailwind.css -o ./css/tailwind.generated.css --minify
```

This command creates a minified stylesheet at `styles/index.css`, which is referenced by the HTML pages.

Commit the generated stylesheet to the repository because GitHub Pages does not compile Tailwind CSS for you.