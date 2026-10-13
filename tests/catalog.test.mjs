import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { kiokus, elements, roles, sortOrders, defaultFilters, filterKiokus, groupKiokus, sortKiokus, kiokuSummary } from "../lib/kioku-catalog.ts";
import { kiokuCopy } from "../lib/kioku-copy.ts";
import { news, newsCopy } from "../lib/news-data.ts";
import { languages } from "../lib/locales.ts";
import { resolvePortalRoute } from "../lib/portal-routes.ts";
import { defaultNoteKioku, favoriteItem, isFavoriteItem, isNoteCharacter } from "../lib/account-items.ts";

test("the sourced roster has distinct versions, complete stats and matching local illustrations", () => {
  assert.equal(kiokus.length, 115);
  assert.equal(new Set(kiokus.map(unit => unit.id)).size, 115);
  assert.deepEqual([5, 4, 3].map(rarity => kiokus.filter(unit => unit.rarity === rarity).length), [76, 17, 22]);
  for (const unit of kiokus) {
    assert.ok(elements.includes(unit.element) && roles.includes(unit.role), unit.id);
    assert.ok(existsSync(new URL("../public" + unit.image, import.meta.url)), unit.id);
    assert.match(unit.source, /^https:\/\/wiki\.puella-magi\.net\/w\/index\.php\?title=.+&oldid=\d+$/);
    for (const key of ["hp", "atk", "def"]) {
      assert.ok(unit.stats.base[key] > 0 && unit.stats.max[key] >= unit.stats.base[key], unit.id + key);
    }
    assert.equal(unit.skills.some(skill => skill.kind === "special"), unit.rarity !== 3, unit.id);
    for (const skill of unit.skills) {
      assert.ok(skill.damage.every(value => value.high >= value.low && value.low > 0), unit.id);
      assert.ok(skill.features.every(feature => kiokuCopy.es[feature === "speed" ? "speedUp" : feature]), unit.id);
    }
  }
  assert.equal(kiokus.find(unit => unit.kioku === "Aqua Tempest").releaseDate, "2026-10-04");
  assert.equal(kiokus.find(unit => unit.kioku === "Metallicized Projectile").releaseDate, "2026-09-27");
  assert.equal(kiokus.find(unit => unit.kioku === "Pluvia☆Magica").releaseDate, "2025-03-26");
});

test("search recognizes Japanese names, symbol-free Kioku names and combined filters", () => {
  assert.ok(filterKiokus(kiokus, { ...defaultFilters, query: "鹿目" }).every(unit => unit.family === "Madoka Kaname"));
  assert.equal(filterKiokus(kiokus, { ...defaultFilters, query: "  pluviaMAGICA  " })[0].kioku, "Pluvia☆Magica");
  const filtered = filterKiokus(kiokus, { query: "Homura", rarity: "5", element: "Flame", role: "Attacker" });
  assert.ok(filtered.some(unit => unit.kioku === "Metallicized Projectile"));
  assert.ok(filtered.every(unit => unit.rarity === 5 && unit.role === "Attacker" && unit.element === "Flame"));
  assert.deepEqual(filterKiokus(kiokus, { ...defaultFilters, query: "no-matching-unit-000" }), []);
});

test("sorting preserves rarity groups and handles ties and unknown dates deterministically", () => {
  const before = kiokus.map(unit => unit.id);
  for (const order of sortOrders) {
    const groups = groupKiokus(kiokus, order, "es");
    assert.deepEqual(groups.map(group => group.rarity), [5, 4, 3]);
    assert.ok(groups.every(group => group.units.every(unit => unit.rarity === group.rarity)));
    if (order.startsWith("attack") || order.startsWith("speed")) {
      for (const group of groups) for (let i = 1; i < group.units.length; i++) {
        const value = unit => order.startsWith("attack") ? unit.stats.max.atk : unit.speed;
        const delta = value(group.units[i]) - value(group.units[i - 1]);
        assert.ok(order.endsWith("Asc") ? delta >= 0 : delta <= 0);
      }
    }
  }
  assert.deepEqual(kiokus.map(unit => unit.id), before, "sorting must not mutate the shared roster");
  const unknown = { ...kiokus[0], id: "unknown-date", releaseDate: null };
  for (const order of ["dateAsc", "dateDesc"]) assert.equal(sortKiokus([unknown, ...kiokus.slice(0, 4)], order, "ja").at(-1).id, "unknown-date");
  assert.equal(sortKiokus(kiokus, "dateDesc", "es")[0].kioku, "Aqua Tempest");
});

test("news and Kioku have valid detail routes and localized content in every supported language", () => {
  for (const lang of languages) {
    assert.ok(newsCopy[lang].read && kiokuCopy[lang].intro);
    for (const article of news) {
      assert.equal(resolvePortalRoute(lang, ["news", article.id]), "news/" + article.id);
      assert.ok(article.title[lang] && article.text[lang] && article.sections.length >= 3);
      assert.ok(article.sections.every(section => section.title[lang] && section.text[lang]));
      assert.ok(existsSync(new URL("../public" + article.image, import.meta.url)));
    }
    for (const unit of kiokus) {
      assert.equal(resolvePortalRoute(lang, ["kioku", unit.id]), "kioku/" + unit.id);
      assert.ok(!kiokuSummary(unit, lang).includes("{"));
    }
  }
  assert.equal(resolvePortalRoute("es", ["news", "missing"]), null);
  assert.equal(resolvePortalRoute("es", ["kioku", "missing"]), null);
  assert.equal(resolvePortalRoute("xx", ["news", news[0].id]), null);
  assert.equal(resolvePortalRoute("es", ["news", news[0].id, "extra"]), null);
});

test("account catalog accepts distinct Kioku notes without changing existing favorites", () => {
  const unit = kiokus.find(item => item.kioku === "Pluvia☆Magica");
  assert.equal(isFavoriteItem("kioku", unit.id), true);
  assert.equal(isFavoriteItem("character", "madoka"), true);
  assert.equal(isFavoriteItem("guide", "first-steps"), true);
  assert.equal(isFavoriteItem("kioku", "madoka"), false);
  assert.equal(isFavoriteItem("character", unit.id), false);
  assert.equal(isNoteCharacter(unit.id), true);
  assert.equal(isNoteCharacter("madoka"), true);
  assert.equal(isNoteCharacter("unknown"), false);
  assert.equal(defaultNoteKioku(unit.id, "ja"), unit.kiokuJapanese);
  assert.equal(favoriteItem({ kind: "kioku", itemId: unit.id }, "es").href, "/es/kioku/" + unit.id + "/");
  assert.equal(favoriteItem({ kind: "character", itemId: "madoka" }, "es").href, "/es/characters/madoka/");
});
