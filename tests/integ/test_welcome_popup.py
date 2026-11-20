"""The first-visit pop-up: a plain 10% off offer and an email."""
import re

def popup(site):
    site.pg.add_init_script("Date.prototype.getHours=function(){return 12}")
    site.pg.goto(f"{site.base}/?popup=discount", wait_until="domcontentloaded", timeout=90000); site.pg.wait_for_selector("#welcome.on", timeout=60000); return site.pg

def test_offer_text_and_form(phone):
    pg = popup(phone); t = pg.inner_text("#welcome")
    assert "10% off" in t and "email" in t.lower()
    assert "spin" not in t.lower() and "no thanks" not in t.lower()

def test_empty_and_bad_email_are_told_in_white(phone):
    pg = popup(phone)
    pg.click("#welcome .wyay"); assert "pop in your email" in pg.inner_text("#welcome .werr")
    assert pg.eval_on_selector("#welcome .werr", "e=>getComputedStyle(e).color") == "rgb(255, 255, 255)"
    pg.fill("#welcome input[type=email], #welcome input", "nope"); pg.click("#welcome .wyay")
    assert "a little off" in pg.inner_text("#welcome .werr")

def test_escape_dismisses(phone):
    pg = popup(phone); pg.keyboard.press("Escape"); pg.wait_for_selector("#welcome", state="detached", timeout=5000)
