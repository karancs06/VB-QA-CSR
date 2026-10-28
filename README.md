# VB QA CSR

A client-side React site (Vite) that renders Contentstack entries with the Live Preview SDK. Visual
Builder and Live Preview QA load it in their canvas. The same code serves every stack and region:
each deployment reads its stack from environment variables at build time, and nothing
stack-specific is committed.

## Environment variables

| Variable | What it is |
| --- | --- |
| `VITE_CONTENTSTACK_API_KEY` | The stack's API key |
| `VITE_CONTENTSTACK_DELIVERY_TOKEN` | A delivery token scoped to the environment below |
| `VITE_CONTENTSTACK_PREVIEW_TOKEN` | The preview token of that delivery token |
| `VITE_CONTENTSTACK_ENVIRONMENT` | The stack environment the site reads from |
| `VITE_CONTENTSTACK_BRANCH` | Stack branch, `main` unless you use branches |
| `VITE_CONTENTSTACK_API_HOST` | The region's delivery host, e.g. `cdn.contentstack.io`, `eu-cdn.contentstack.com`, `dev22-cdn.csnonprod.com` |
| `VITE_CONTENTSTACK_APP_HOST` | The region's app URL, e.g. `https://app.contentstack.com`, `https://eu-app.contentstack.com` |

Vite inlines these at build time, so a change only takes effect after a new build or deploy. The
delivery and preview tokens end up in the browser bundle, as with any client-side Contentstack
site, so use tokens scoped to a single environment. Never commit a `.env` file.

## Run locally

```bash
npm ci
cp .env.example .env   # fill in the values
npm run dev            # http://localhost:3006
```

## Deploy on Launch

Every Launch project connected to this repo redeploys on each push to `main`, so a new page or
route goes live everywhere with one push.

1. **Stack.** In the stack, create an environment for the site (for example `launch`), and a
   delivery token scoped to it with a preview token (Settings > Tokens). Publish the entries and
   assets the site shows to that environment.
2. **Launch project.** In the same org, open Launch and choose New Project > Import from a Git
   Repository, then connect GitHub if Launch asks. Pick this repository and branch `main`, and set:
   - Framework preset: CSR (Client-Side Rendered)
   - Build command: `npm run build`
   - Output directory: `./build`
   - Environment variables: the seven variables above
3. **Deploy**, then copy the site URL Launch gives you.
4. **Turn off Contentstack Authentication** for the Launch environment (environment settings).
   Launch may switch it on for new projects. While it is on, the site redirects to a Contentstack
   login that refuses to load inside the Visual Builder and Live Preview iframe ("refused to
   connect").
5. **Back in the stack**, set the environment's URLs to the site: the site URL for the master
   locale, and `<site URL>/locale/<locale code>` for each other locale. Turn on Live Preview
   (Settings > Live Preview) with that environment if Visual Builder should open the site.

To point an existing deployment at another stack, change its environment variables on Launch and
redeploy. One project can also serve several stacks, from any region or org: add a Launch
environment per stack (branch `main`, the same build settings, that stack's variables). Each
environment gets its own URL and redeploys on every push.

## Routes

| Route | Renders |
| --- | --- |
| `/`, `/:page` | `page` entries by URL |
| `/blog`, `/blog/:blogId` | `blog_post` entries |
| `/data/:contentTypeUid/:entryUrl` | any entry, shown field by field |
| `/locale/:locale/...` | the same routes in another locale |
| `?slug=/path` | routes to `/path`, for sites whose base URL is a query string |
