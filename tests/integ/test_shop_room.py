"""How the shop room is expected to behave, on a phone and on a desktop."""
import re

PLUM = "rgb(109, 42, 90)"

def titles(pg):   return pg.evaluate("[...document.querySelectorAll('#galRing a.gf')].map(a=>a.getAttribute('aria-label').replace(/,.*$/,''))")
def first_left(pg): return pg.evaluate("document.querySelector('#galRing a.gf').getBoundingClientRect().left")
def settled(pg, tries=40):
    """wait for the wall to stop moving (software GL animates slowly)"""
    pg.wait_for_timeout(4000); last = first_left(pg)
    for _ in range(tries):
        pg.wait_for_timeout(2000); now = first_left(pg)
        if abs(now - last) < .5: return now
        last = now
    return last

def test_room_never_turns_by_itself(site):
    site.open().enter_room(); a = first_left(site.pg); site.pg.wait_for_timeout(4000)
    assert abs(first_left(site.pg) - a) < 1, "the wall drifted without any arrow or swipe"

def test_arrow_moves_the_wall_by_a_page(site):
    site.open().enter_room(); a = first_left(site.pg)
    site.pg.click("#galNext"); moved = settled(site.pg)
    assert abs(moved - a) > 40
    site.pg.click("#galPrev"); back = settled(site.pg)
    assert abs(back - a) < 14, "previous should bring back the first page"

def test_filter_and_sort_ui(site):
    pg = site.open().enter_room().pg
    if site.kind == "phone":
        btn = pg.locator("#galBar .fbtn"); assert btn.is_visible()
        st = btn.evaluate("e=>{const s=getComputedStyle(e);return [s.backgroundColor,s.borderTopStyle,s.borderRadius,e.querySelector('canvas').width]}")
        assert st[0] == PLUM and st[1] == "dashed" and st[3] > 0, f"filter button should be a plum stitched pill with sewn lettering: {st}"
        btn.click(); pg.wait_for_selector("#galPop.on")
        card = pg.locator("#galPop .card")
        # cloud format: a cloud pad bigger than the card, and no flat box behind it
        pad = card.evaluate("c=>{const p=c.querySelector('canvas.pp-pad');const r=c.getBoundingClientRect(),q=p.getBoundingClientRect();return {pw:q.width,cw:r.width,bg:getComputedStyle(c).backgroundColor,ov:getComputedStyle(c).overflow}}")
        assert pad["pw"] > pad["cw"] and pad["bg"] == "rgba(0, 0, 0, 0)" and pad["ov"] == "visible", pad
        n = len(titles(pg)); opts = pg.locator("#galPop button.plb"); assert opts.count() >= 10
        pg.locator("#galPop button[aria-label='Silver']").click(); pg.wait_for_timeout(1200)
        assert 0 < len(titles(pg)) < n, "choosing silver should narrow the wall"
        pg.locator("#galPop button.done").click(); pg.wait_for_selector("#galPop", state="detached")
    else:
        assert pg.locator("#galBar .fbtn").count() == 0, "desktop shows the options themselves, not a button"
        bar = pg.evaluate("(()=>{const b=document.getElementById('galBar').getBoundingClientRect(),f=document.querySelector('#galRing a.gf .fr').getBoundingClientRect();return {top:b.top,bottom:b.bottom,frame:f.top}})()")
        assert 60 <= bar["top"] <= 110, f"the bar should sit slightly below the header, got top={bar['top']}"
        assert bar["bottom"] <= bar["frame"], "the option bar must not overlap the pictures"
        btns = pg.locator("#galBar button.plb"); assert btns.count() >= 11   # 4 materials + 4 kinds + 4 orders (some may be hidden if no stock)
        assert pg.locator("#galBar button[aria-label='a to z']").count() == 1 and pg.locator("#galBar button[aria-label='featured']").count() == 1
        assert all(b["l"] >= 0 and b["r"] <= 1400 for b in btns.evaluate_all("els=>els.map(e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right}})"))
        pg.wait_for_timeout(3000)   # lettering is sewn, the bar settles, the wall steps down if it wrapped
        bar = pg.evaluate("(()=>{const b=document.getElementById('galBar').getBoundingClientRect(),f=document.querySelector('#galRing a.gf .fr').getBoundingClientRect();return {bottom:b.bottom,frame:f.top}})()")
        assert bar["bottom"] <= bar["frame"], f"the option bar must not overlap the pictures once sewn: {bar}"
        pg.locator("#galBar button[aria-label='a to z']").click(); pg.wait_for_timeout(1200)
        t = titles(pg); assert t == sorted(t, key=str.lower), "a to z should list the pictures alphabetically"
        pg.locator("#galBar button[aria-label='Earrings']").click(); pg.wait_for_timeout(1200)
        assert all("earring" in x.lower() for x in titles(pg)) and titles(pg)

def test_option_buttons_are_plum_and_stitched(site):
    pg = site.open().enter_room().pg
    if site.kind == "phone": pg.locator("#galBar .fbtn").click(); pg.wait_for_selector("#galPop.on")
    sel = "#galPop button.plb" if site.kind == "phone" else "#galBar button.plb"
    for s in pg.locator(sel).evaluate_all("els=>els.map(e=>[getComputedStyle(e).borderTopStyle,e.querySelector('canvas').width])"):
        assert s[1] > 0, "every option label is sewn"
    first = pg.locator(sel).first.evaluate("e=>getComputedStyle(e).borderRadius"); assert first.startswith("999") or float(first.rstrip("px")) > 15

def test_clicking_a_picture_opens_a_cloud_page(site):
    pg = site.open().enter_room().pg; w, h = site.size; url0 = pg.url
    pg.evaluate("document.querySelector('#galRing a.gf').click()"); pg.wait_for_selector("#pdp.on .pcard .pdesc", state="attached", timeout=45000)
    r = pg.evaluate("(()=>{const c=document.querySelector('#pdp .pcard').getBoundingClientRect(),p=document.querySelector('#pdp .pcard canvas.pp-pad');return {w:c.width,h:c.height,cloud:!!p&&p.width>0,bar:getComputedStyle(document.getElementById('galBar')).visibility}})()")
    assert r["cloud"], "the product page is drawn on a cloud"
    assert r["w"] >= w * .9 and r["h"] >= h * .78, f"the page should fill nearly the whole screen: {r} of {w}x{h}"
    assert r["bar"] == "hidden", "the filter bar must not show through the product page"
    assert pg.url != url0 and "/products/" in pg.url
    pg.keyboard.press("Escape"); pg.wait_for_selector("#pdp", state="detached", timeout=20000)
    assert pg.url == url0, "closing puts the address back"
    pg.evaluate("document.querySelector('#galRing a.gf').click()"); pg.wait_for_selector("#pdp.on .px", timeout=45000)
    pg.click("#pdp .px"); pg.wait_for_selector("#pdp", state="detached", timeout=20000)

def test_sky_and_bar_tones_follow_the_day(site):
    pg = site.open().enter_room().pg
    assert pg.evaluate("document.body.dataset.tone") == "day"

def test_floor_is_warmed_up_before_the_first_scroll_down(site):
    """Regression: the first scroll down used to build the floor on the spot and stall."""
    pg = site.open().pg; pg.wait_for_timeout(9000)
    assert pg.locator("#floor").count() == 1, "the floor should be prepared while the page is idle"

def test_phone_background_runs_under_the_bars(phone):
    pg = phone.open().pg
    r = pg.evaluate("(()=>{const g=document.getElementById('gl').getBoundingClientRect();return {t:g.top,b:g.bottom,h:innerHeight}})()")
    assert r["t"] < 0 and r["b"] > r["h"], f"the scene should extend past both phone bars: {r}"
