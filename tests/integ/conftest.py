"""Integration-test harness for the Pink Plume cloud.

Serves the theme's own built assets (assets/pp-cloud.js, pp-three.min.js, the paintings) on a
local port together with a tiny harness page that carries fake products, and drives it with
Playwright/Chromium (software GL, so no GPU is needed).

    pip install pytest playwright && playwright install chromium
    python -m pytest tests/integ -q
"""
import base64, functools, http.server, json, pathlib, threading
import pytest
from playwright.sync_api import sync_playwright

ASSETS = pathlib.Path(__file__).resolve().parents[2] / "assets"
FILES = {"/pp-cloud.js": "pp-cloud.js", "/three.min.js": "pp-three.min.js", "/pp-sky.jpg": "pp-sky.jpg",
         "/pp-lake.jpg": "pp-lake.jpg", "/pp-floor.jpg": "pp-floor.jpg", "/pp-water.jpg": "pp-water.jpg"}
TYPES = {".js": "text/javascript", ".jpg": "image/jpeg"}

def _svg(i):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="hsl({(i*47)%360},45%,80%)"/><circle cx="150" cy="200" r="70" fill="hsl({(i*47)%360},45%,55%)"/></svg>'
    return "data:image/svg+xml;base64," + base64.b64encode(s.encode()).decode()

#          title, tags, cents
ITEMS = [("Persian Raindrop Necklace", ["Chainmail", "Necklace"], 20500), ("Spiral Net Necklace", ["Chainmail", "Necklace"], 21000),
         ("European Piercing Earrings", ["Chainmail", "Earrings"], 4800), ("European Pendant Necklace", ["Chainmail", "Necklace"], 18500),
         ("Persian Raindrop Bracelet", ["Bracelet", "Chainmail"], 8500), ("White Orchid Earrings", ["Earrings", "Polymer clay"], 12000),
         ("Cream Orchids Earrings", ["Earrings", "Polymer clay"], 12000), ("Button Pendant", ["Necklace", "Silver"], 25000),
         ("Pearl Earrings", ["Chainmail", "Earrings"], 2200), ("Spiral Bracelet", ["Bracelet", "Chainmail"], 9800),
         ("Orchid Set", ["Polymer clay", "Set"], 24000), ("Pendant Set", ["Chainmail", "Set"], 34800)]
PRODUCTS = [{"title": t, "url": f"/products/test-{i}", "price": f"${c/100:.2f}", "cents": c, "imgs": [_svg(i), _svg(i + 5)], "tags": tg}
            for i, (t, tg, c) in enumerate(ITEMS)]
HARNESS = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'
           '<script>window.PP_DATA=' + json.dumps({"sky": "/pp-sky.jpg", "floor": "/pp-lake.jpg", "pages": {"about": "/x", "faq": "/y", "contact": "/z"},
           "products": PRODUCTS, "terms": "/policies/terms-of-service", "social": {}}) +
           ';try{sessionStorage.setItem("pp-welcomed","1")}catch(e){}</script><script src="/three.min.js" defer></script><script src="/pp-cloud.js" defer></script></body></html>')
PDP_JSON = json.dumps({"title": "Test Necklace", "description": "<p>Hand woven.</p>", "images": [_svg(1)],
                       "variants": [{"id": 1, "title": "Default Title", "price": 20500, "available": True}], "options": []})

class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        path = self.path.split("?")[0]
        if path in FILES and (ASSETS / FILES[path]).exists():
            f = ASSETS / FILES[path]; body = f.read_bytes(); ct = TYPES[f.suffix]
        elif path.startswith("/products/"): body, ct = PDP_JSON.encode(), "application/json"
        elif path == "/": body, ct = HARNESS.encode(), "text/html"
        else: self.send_response(404); self.end_headers(); return
        self.send_response(200); self.send_header("Content-Type", ct); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

@pytest.fixture(scope="session")
def base_url():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_port}"
    srv.shutdown()

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
        yield b
        b.close()

VIEWS = {"phone": dict(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True),
         "desktop": dict(viewport={"width": 1400, "height": 820}, device_scale_factor=1)}

class Site:
    def __init__(self, pg, base, kind): self.pg, self.base, self.kind = pg, base, kind; self.errors = []; pg.on("pageerror", lambda e: self.errors.append(str(e)))
    @property
    def size(self): return self.pg.viewport_size["width"], self.pg.viewport_size["height"]
    def open(self, query="popup=none"):
        self.pg.add_init_script("Date.prototype.getHours=function(){return 12}")   # always the daytime look
        self.pg.goto(f"{self.base}/?{query}#shop", wait_until="domcontentloaded", timeout=90000); self.pg.wait_for_timeout(12000); self.dismiss_welcome(); return self
    def dismiss_welcome(self):
        if self.pg.locator('#welcome').count(): self.pg.keyboard.press('Escape'); self.pg.wait_for_timeout(1500)
    def in_room(self): return self.pg.evaluate("document.body.classList.contains('inroom')&&document.body.classList.contains('galon')")
    def enter_room(self):
        """Tap the shop cloud until the room is open (taps that land before the page is ready are ignored)."""
        w, h = self.size
        for _ in range(8):
            self.dismiss_welcome()
            if self.in_room(): break
            self.pg.mouse.click(w / 2, h / 2); self.pg.wait_for_timeout(5000)
        assert self.in_room(), "could not get into the shop room"
        self.dismiss_welcome(); self.pg.wait_for_timeout(4000)   # lettering gets sewn and the bar settles
        self.pg.evaluate("(()=>{const x=document.querySelector('#pdp .px');if(x)x.click();})()"); self.pg.wait_for_timeout(800)   # a tap can land on a frame as it appears
        return self

@pytest.fixture(params=["phone", "desktop"])
def site(request, browser, base_url):
    ctx = browser.new_context(**VIEWS[request.param]); ctx.route("**/products/*.js", lambda r: r.fulfill(status=200, content_type="application/json", body=PDP_JSON))
    s = Site(ctx.new_page(), base_url, request.param); yield s
    assert not s.errors, f"page errors: {s.errors}"
    ctx.close()

@pytest.fixture
def phone(browser, base_url):
    ctx = browser.new_context(**VIEWS["phone"]); s = Site(ctx.new_page(), base_url, "phone"); yield s
    assert not s.errors, f"page errors: {s.errors}"
    ctx.close()

@pytest.fixture
def desktop(browser, base_url):
    ctx = browser.new_context(**VIEWS["desktop"]); s = Site(ctx.new_page(), base_url, "desktop"); yield s
    assert not s.errors, f"page errors: {s.errors}"
    ctx.close()
