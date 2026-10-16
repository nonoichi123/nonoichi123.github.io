import { escapeAttr, escapeHtml } from "./escape.js";

const NAV_ITEMS = [
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Skills", href: "/#skills" },
  { name: "News", href: "/news/", page: "news" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
];

export function renderDocument({
  title,
  description,
  canonical,
  keywords,
  ogType = "website",
  ogImage = "/assets/images/nonopp.png",
  jsonLd = null,
  activeNav = null,
  mainHtml,
  production = true,
}) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeAttr(description);
  const safeCanonical = escapeAttr(canonical);
  const safeKeywords = escapeAttr(keywords);
  const safeOgImage = escapeAttr(ogImage);
  const jsonLdBlock = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll(
        "</",
        "<\\/",
      )}</script>`
    : "";

  const analyticsHead = production
    ? `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KCCD77W');</script>
    <!-- End Google Tag Manager -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-138489514-1"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','UA-138489514-1');</script>
    <script data-ad-client="ca-pub-9638052216153241" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>`
    : "";

  const analyticsBody = production
    ? `<noscript><iframe title="Google Tag Manager" src="https://www.googletagmanager.com/ns.html?id=GTM-KCCD77W" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    ${analyticsHead}
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${safeTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${safeDescription}" />
    <meta name="keywords" content="${safeKeywords}" />
    <meta name="author" content="rhinonolike" />
    <link rel="canonical" href="${safeCanonical}" />
    <meta property="og:type" content="${escapeAttr(ogType)}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:image" content="${safeOgImage}" />
    <meta property="og:url" content="${safeCanonical}" />
    <meta property="og:site_name" content="ノノップ" />
    <meta property="og:description" content="${safeDescription}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:image" content="${safeOgImage}" />
    <meta name="twitter:url" content="${safeCanonical}" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Quicksand:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/css/animate.css" />
    <link rel="stylesheet" href="/assets/css/icomoon.css" />
    <link rel="stylesheet" href="/assets/css/bootstrap.css" />
    <link rel="stylesheet" href="/assets/css/flexslider.css" />
    <link rel="stylesheet" href="/assets/css/owl.carousel.min.css" />
    <link rel="stylesheet" href="/assets/css/owl.theme.default.min.css" />
    <link rel="stylesheet" href="/assets/css/style.css" />
    <script src="/assets/js/modernizr-2.6.2.min.js"></script>
    ${jsonLdBlock}
  </head>
  <body>
    ${analyticsBody}
    <div id="colorlib-page">
      <div class="container-wrap">
        <a href="#" class="js-colorlib-nav-toggle colorlib-nav-toggle" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar"><i></i></a>
        <aside id="colorlib-aside" role="complementary" class="border js-fullheight">
          ${renderAuthor()}
          ${renderNav(activeNav)}
          ${renderFooter()}
        </aside>
        <div id="colorlib-main">
          ${mainHtml}
        </div>
      </div>
    </div>
    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/jquery.easing.1.3.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <script src="/assets/js/jquery.waypoints.min.js"></script>
    <script src="/assets/js/jquery.flexslider-min.js"></script>
    <script src="/assets/js/owl.carousel.min.js"></script>
    <script src="/assets/js/jquery.countTo.js"></script>
    <script src="/assets/js/main.js"></script>
  </body>
</html>`;
}

function renderAuthor() {
  return `<div class="text-center">
  <div class="author-img" style="background-image: url(/assets/images/nonopp.png);"></div>
  <h1 id="colorlib-logo"><a href="/">ノノップ<br /><small>nonopp</small></a></h1>
  <span class="position">京都南部・木津川市を拠点とする<br />システム開発・ITサービス運営</span>
</div>`;
}

function renderNav(activeNav) {
  const items = NAV_ITEMS.map((item) => {
    const active = item.page === activeNav ? ' class="active"' : "";
    return `<li${active}><a class="external" href="${escapeAttr(item.href)}">${escapeHtml(item.name)}</a></li>`;
  }).join("");
  return `<nav id="colorlib-main-menu" role="navigation" class="navbar">
  <div id="navbar" class="collapse">
    <ul>${items}</ul>
  </div>
</nav>`;
}

function renderFooter() {
  return `<div class="colorlib-footer">
  <p><small>&copy; ノノップ（nonopp） All rights reserved</small></p>
  <ul>
    <li><a href="//github.com/nonoichi123"><i class="icon-github"></i></a></li>
    <li><a href="//twitter.com/nonoichi123"><i class="icon-twitter2"></i></a></li>
  </ul>
</div>`;
}

export function htmlResponse(
  html,
  status = 200,
  cacheControl = "public, s-maxage=60, stale-while-revalidate=300",
) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
