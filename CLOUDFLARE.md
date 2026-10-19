# Cloudflare Pages deployment

This is a plain static website. It needs no build tools or server-side runtime.

## Connect GitHub to Cloudflare Pages

1. In Cloudflare, open **Workers & Pages** and create a Pages project using **Connect to Git**.
2. Choose the GitHub repository `1awwal/Awwal-brand-solution` and set:
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** `exit 0`
   - **Build output directory:** `.` (the repository root, where `index.html` is located)
   - **Root directory:** leave blank (the repository root)
3. Save and deploy. Cloudflare Pages will publish future pushes to `main` automatically.

## Connect a custom domain

In the Pages project, open **Custom domains** and add the domain you own. Follow Cloudflare's DNS instructions there. An apex domain (such as `example.com`) must be added as a Cloudflare zone and use Cloudflare nameservers. A subdomain (such as `www.example.com`) can be connected using the CNAME target Cloudflare provides.

The domain name and Cloudflare account were not included with the site files, so enter the intended domain in the Cloudflare dashboard when ready.
