# Custom domain setup

Optional follow-up to the Week 4 launch checklist. Connecting a custom domain is a manual step because it requires purchasing a domain (a real-money transaction) and editing DNS records at the registrar, neither of which should happen without Ankit driving it directly.

## Steps (manual, done by Ankit)

Step 1: Buy a domain from any registrar (Namecheap, Cloudflare Registrar, etc.).

Step 2: In the Vercel dashboard, open the AI-3dPortfolio project, go to Settings, then Domains, then Add.

Step 3: Enter the domain and follow Vercel's DNS instructions. For an apex domain (example.com) add an A record pointing to 76.76.21.21, or use Vercel's nameservers if the registrar allows it. For a subdomain (www.example.com) add a CNAME record pointing to cname.vercel-dns.com.

Step 4: Wait for DNS propagation and let Vercel auto-issue the TLS certificate.

Step 5: Set the new domain as the production domain in Vercel, and confirm the old .vercel.app URL still redirects.

Step 6: Update the site value in astro.config.mjs and any OG/meta URLs in Layout.astro to the new domain.

Step 7: Update the Live site link in the repo README.

## Why this isn't a normal PR

Every other backlog item is pure code/content that can be built and previewed without leaving GitHub. This one needs a purchased domain and registrar access, so it can't be completed as a blind code change. This doc records the steps; the actual purchase and DNS configuration remains a manual, one-time task for Ankit.
