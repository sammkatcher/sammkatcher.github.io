/*
*  Chatgpt finnessed this framework, it's a small, feature weak, but effective. Mini superpowers
*  1. Seperate resuable code into indivdual files you can put local css, javascipt and html into
*  2. Single pagedness + per-refresh caching allows for faster rendering
*  3. no three, that't it, maybe well add in reactivity/state mangement later
*
*  What is this for? Making brocure type websites. This makes it easy to drop in copy paste
*  code and sratch up and destory features at a whim
*/

let $navbar, $content, $footer;
const htmlCache = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  $navbar = document.getElementById("navbar");
  $content = document.getElementById("content");
  // $footer = document.getElementById("footer");

  if (!$navbar || !$content) {
    console.error("Missing #navbar or #content in index.html");
    return;
  }

  // Load navbar
  await loadHTML($navbar, "/components/utilities/navbar.html");
  // await loadHTML($footer, "/components/utilities/footer.html");

  // Handle nav clicks (intercept)
  $navbar.addEventListener("click", async (e) => {
    const link = e.target.closest("[data-page]");
    if (!link) return;

    e.preventDefault();
    const page = link.dataset.page;

    navigate(page);
  });

  // Handle back/forward navigation
  window.addEventListener("popstate", () => {
    const page = pathToPage(window.location.pathname);
    showPage(page);
  });

  // Initial page load
  const initialPage = pathToPage(window.location.pathname);
  await showPage(initialPage);
});

/* ------------------ Helpers ------------------ */

// Convert URL path → page name
function pathToPage(pathname) {
  // /about → "about", / → "home"
  if (pathname === "/" || pathname === "") return "about";
  return pathname.replace(/^\/+/, ""); // strip leading /
}

// Push new URL + render
function navigate(page) {
  history.pushState({}, "", page === "about" ? "/" : `/${page}`);
  showPage(page);
}

// Load and display a page
async function showPage(page) {
  const path = `/components/pages/${page}.html`;
  try {
    await loadHTML($content, path);
  } catch (err) {
    console.error("Page load failed:", err);
    await loadHTML($content, "/components/pages/404.html");
  }
}

// Fetch + insert HTML (with cache + script execution)
async function loadHTML(target, url, { executeScripts = true } = {}) {
  let html;

  if (htmlCache.has(url)) {
    html = htmlCache.get(url);
  } else {
    const res = await fetch(url).catch(()=>{});
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    html = await res.text();
    htmlCache.set(url, html);
  }

  const range = document.createRange();
  range.selectNode(document.body);
  const fragment = range.createContextualFragment(html);

  const scripts = Array.from(fragment.querySelectorAll("script"));
  scripts.forEach((s) => s.remove());

  target.replaceChildren(fragment);

  if (executeScripts) {
    for (const oldScript of scripts) {
      const newScript = document.createElement("script");

      for (const { name, value } of oldScript.attributes) {
        if (name === "async") continue;
        newScript.setAttribute(name, value);
      }

      if (oldScript.textContent?.trim()) {
        newScript.textContent = oldScript.textContent;
      }

      target.appendChild(newScript);

      if (newScript.src) {
        await new Promise((resolve, reject) => {
          newScript.onload = resolve;
          newScript.onerror = reject;
        });
      }
    }
  }
}
