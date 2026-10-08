# KHAYA'S ACADEMIC STUDIO — SITE

## Resource system

This version uses Supabase for administrator authentication, the `guides` table and the
`academic-resources` Storage bucket.

### Important: public PDF resources

Public guides are opened using stable Supabase Storage public URLs. The Storage bucket
named `academic-resources` must therefore be configured as **Public** in Supabase.

In Supabase:

1. Open **Storage**.
2. Open the `academic-resources` bucket.
3. Open the bucket settings.
4. Enable **Public bucket**.
5. Save.

Existing guide records and uploaded PDFs do not need to be uploaded again if they are
already present in that bucket.

## GitHub Pages

The site itself can remain hosted on GitHub Pages. Supabase handles the resource
database, administrator login and PDF storage.

## Public/private resources

- `PUBLIC` resources appear on the website.
- `PRIVATE` resources remain in the administrator cabinet and are not shown publicly.
- The website does not expose premium/private resources in the public catalogue.

## Contact

Current website contact button uses the WhatsApp number configured in `index.html`.
