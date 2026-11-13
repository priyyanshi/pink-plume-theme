# Pink Plume: page record

Status key: **final** = you're happy, leave alone. **v1** = first pass to match the theme (lake/cloud look, palette, Sacramento + DM Sans). **todo** = still on the Savor engine, needs a pass. Everything in **v1** and **todo** is on your "improve properly" list.

## Final
| Page | Where |
|---|---|
| Cloud homepage | `templates/index.json` → `sections/pp-cloud.liquid` |
| Lakes view (top-down floor menu) | built into `assets/pp-cloud.js` |

## v1: matches the theme, to be improved
| Page | URL | File |
|---|---|---|
| Shop gallery room (you want to improve this one) | /#shop | built into `assets/pp-cloud.js` (`gal/gallery.js`, `gallery.css`) |
| About (lake page) | /pages/about | `templates/page.about.liquid` |
| FAQ (lake page) | /pages/faq | `templates/page.faq.liquid` |
| Contact (lake page) | /pages/contact | `templates/page.contact.liquid` |
| Terms of service, Privacy, Refund, Shipping, Contact-info policies | /policies/* | `layout/theme.liquid` (policy wrapper, restyles Shopify's policy markup) |
| Any other page (default template) | /pages/* | `templates/page.liquid` |
| Search overlay on the homepage | (icon in header) | `assets/pp-cloud.js` |
| Product sheet on the homepage (opens over the clouds) | (click a product) | `assets/pp-cloud.js` |
| Product page, full page | /products/* | `templates/product.liquid` |
| Collection | /collections/* | `templates/collection.liquid` |
| All collections | /collections | `templates/list-collections.liquid` |
| Search results | /search | `templates/search.liquid` |
| Basket | /cart | `templates/cart.liquid` |
| Journal (blog) + article | /blogs/*, /blogs/*/* | `templates/blog.liquid`, `templates/article.liquid` |
| 404 | any missing URL | `templates/404.liquid` |

All of these share one shell (`layout/pond.liquid`, also copied to `layout/theme.liquid` so default pages and policies get it) and one stylesheet (`assets/pp-pond.css`).

## todo: still Savor-styled (palette colours only)
| Page | File | Note |
|---|---|---|
| Password / coming-soon page | `layout/password.liquid`, `templates/password.json` | only shown if the store is password-protected |
| Gift card page | `templates/gift_card.liquid` | standalone layout |

## todo: lives outside the theme
| Page | Where to change it |
|---|---|
| Checkout, thank-you, order status | Shopify admin → Settings → Checkout → Customize (branding). Not touched, because it applies to the live store immediately. |
| Customer accounts (login, orders) | Shopify-hosted "new customer accounts"; branding is in the same checkout editor |
| Order and shipping emails | Admin → Settings → Notifications |
| Welcome pop-up | needs a real discount code |

## Not in the header yet
- Cart icon (basket is reachable from the product sheet's "view cart" link and the /cart URL).
- Search on the homepage is an overlay; on every other page the search icon opens /search.

## Old templates kept for reference
The previous Savor templates were renamed `*.savor.json` (404, article, blog, cart, collection, list-collections, page, product, search) and the old layout is `layout/savor.liquid`. They aren't used unless a page is assigned that alternate template.
