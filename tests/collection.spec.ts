import { test, expect } from "@playwright/test";
import fixture from "./fixtures/artworks.json" with { type: "json" };

// Recorded public API data makes interaction tests independent of museum uptime.
test.beforeEach(async ({ page }) => {
  await page.route("https://api.artic.edu/api/v1/artworks?*", (route) =>
    route.fulfill({ json: fixture }),
  );
  await page.route("https://www.artic.edu/iiif/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="843" height="650"><rect width="843" height="650" fill="#aab9a2"/></svg>',
    }),
  );
});

test("gallery filters combine, search updates while typing, and reset restores all works", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".art-card")).toHaveCount(24);
  await page
    .getByRole("button", { name: "Post-Impressionism", exact: true })
    .click();
  await expect(page.locator(".art-card")).toHaveCount(4);
  await page.getByLabel("Filter by artist").selectOption("Vincent van Gogh");
  await expect(page.locator(".art-card")).toHaveCount(2);
  await page.getByRole("searchbox").fill("bed");
  await expect(page.locator(".art-card")).toHaveCount(1);
  await expect(page.locator(".art-card h3")).toHaveText("The Bedroom");
  await page.getByRole("searchbox").fill("unfindable-artwork");
  await expect(page.getByText("No works in this corner.")).toBeVisible();
  await page.getByRole("button", { name: "Show all works" }).click();
  await expect(page.locator(".art-card")).toHaveCount(24);
});

test("list search, three sort properties in both directions, and context survive navigation", async ({
  page,
}) => {
  await page.goto("./list?q=monet");
  await expect(page.locator(".art-row")).toHaveCount(10);
  for (const sort of ["title", "date", "artist"]) {
    await page.getByLabel("Sort by", { exact: true }).selectOption(sort);
    const forward = await page.locator(".row-art strong").allTextContents();
    await page
      .getByRole("button", { name: "Sort descending", exact: true })
      .click();
    await expect(page.locator(".row-art strong")).toHaveText(
      [...forward].reverse(),
    );
    await page
      .getByRole("button", { name: "Sort ascending", exact: true })
      .click();
    await expect(page.locator(".row-art strong")).toHaveText(forward);
  }
  const firstTitle = await page
    .locator(".row-art strong")
    .first()
    .textContent();
  const secondTitle = await page
    .locator(".row-art strong")
    .nth(1)
    .textContent();
  await page.locator(".art-row").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(firstTitle!);
  await page.getByRole("link", { name: /NEXT WORK/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    secondTitle!,
  );
  await page.getByRole("link", { name: /PREVIOUS WORK/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(firstTitle!);
  await page.getByRole("link", { name: "Back to list", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("monet");
  await expect(page.locator(".art-row")).toHaveCount(10);
});

test("gallery detail opens, wraps, enlarges, and reloads directly", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator(".art-card").first().click();
  await expect(page).toHaveURL(/\/mp2\/artworks\/16568/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Water Lilies",
  );
  await page.getByRole("button", { name: "Enlarge Water Lilies" }).click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: /PREVIOUS WORK/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Charing Cross Bridge, London",
  );
  await page.getByRole("link", { name: /NEXT WORK/ }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Water Lilies",
  );
  await expect(page.getByText("Oil on canvas", { exact: true })).toBeVisible();
});

test("API errors offer a working retry without fabricated content", async ({
  page,
}) => {
  let fail = true;
  await page.route("https://api.artic.edu/api/v1/artworks?*", (route) =>
    fail
      ? route.fulfill({ status: 503, body: "Temporarily unavailable" })
      : route.fulfill({ json: fixture }),
  );
  await page.goto("./");
  await expect(
    page.getByText(
      "We couldn’t reach the museum. Check your connection and try again.",
    ),
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".art-card")).toHaveCount(24);
});

test("unknown artworks, single-result details, and malformed filters are safe", async ({
  page,
}) => {
  await page.goto("./artworks/not-an-id");
  await expect(
    page.getByRole("heading", { name: "This work isn’t in our collection." }),
  ).toBeVisible();
  await page.goto("./?movement=unknown&sort=wrong");
  await expect(page.locator(".art-card")).toHaveCount(24);
  await page.getByRole("searchbox").fill("Water Lilies");
  await page.locator(".art-card").click();
  await expect(
    page.getByText("One work in this selection.", { exact: false }),
  ).toBeVisible();
});

test("mobile gallery, list and detail have no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["./", "./list", "./artworks/16568", "./about"]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(
      page.getByText("Gathering paintings from the Art Institute of Chicago…"),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("browser back restores collection state and broken images have a fallback", async ({
  page,
}) => {
  await page.route("https://www.artic.edu/iiif/**", (route) => route.abort());
  await page.goto("./?artist=Claude+Monet&sort=date&order=desc");
  await expect(page.locator(".art-card")).toHaveCount(10);
  await expect(
    page.locator(".art-card .image-unavailable").first(),
  ).toBeVisible();
  await page.locator(".art-card").first().click();
  await page.goBack();
  await expect(page.getByLabel("Sort by", { exact: true })).toHaveValue("date");
  await expect(
    page.getByRole("button", { name: "Sort ascending", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Filter by artist")).toHaveValue("Claude Monet");
});
