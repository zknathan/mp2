import { test, expect } from "@playwright/test";
import fixture from "./fixtures/artworks.json" with { type: "json" };

// Recorded public API data makes interaction tests independent of museum uptime.
test.beforeEach(async ({ page }) => {
  await page.route("https://api.artic.edu/api/v1/artworks?*", (route) =>
    route.fulfill({ json: fixture }),
  );
  // A working gallery must not depend on the challenged museum image host.
  await page.route("https://www.artic.edu/iiif/**", (route) => route.abort());
});

test("gallery filters combine, search updates while typing, and reset restores all works", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".art-card")).toHaveCount(36);
  await page
    .getByRole("button", { name: "Post-Impressionism", exact: true })
    .click();
  await expect(page.locator(".art-card")).toHaveCount(7);
  await page.getByLabel("Filter by artist").selectOption("Vincent van Gogh");
  await expect(page.locator(".art-card")).toHaveCount(2);
  await page.getByRole("searchbox").fill("bed");
  await expect(page.locator(".art-card")).toHaveCount(1);
  await expect(page.locator(".art-card h3")).toHaveText("The Bedroom");
  await page.getByRole("searchbox").fill("unfindable-artwork");
  await expect(page.getByText("No works in this corner.")).toBeVisible();
  await page.getByRole("button", { name: "Show all works" }).click();
  await expect(page.locator(".art-card")).toHaveCount(36);
});

test("list search, three sort properties in both directions, and context survive navigation", async ({
  page,
}) => {
  await page.goto("./list?q=monet");
  await expect(page.locator(".art-row")).toHaveCount(14);
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
  await expect(page.locator(".art-row")).toHaveCount(14);
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
    "The Basket of Apples",
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
  await expect(page.locator(".art-card")).toHaveCount(36);
});

test("unknown artworks, single-result details, and malformed filters are safe", async ({
  page,
}) => {
  await page.goto("./artworks/not-an-id");
  await expect(
    page.getByRole("heading", { name: "This work isn’t in our collection." }),
  ).toBeVisible();
  await page.goto("./?movement=unknown&sort=wrong");
  await expect(page.locator(".art-card")).toHaveCount(36);
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
  await page.route("**/mp2/artworks/*.webp", (route) => route.abort());
  await page.goto("./?artist=Claude+Monet&sort=date&order=desc");
  await expect(page.locator(".art-card")).toHaveCount(14);
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

test("all 36 actual artwork files render with the museum image host unavailable", async ({
  page,
}, testInfo) => {
  const remoteImages: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("artic.edu/iiif"))
      remoteImages.push(request.url());
  });
  await page.goto("./");
  await expect(page.locator(".art-card")).toHaveCount(36);
  const images = page.locator(".art-card img");
  await expect(images).toHaveCount(36);
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        img.evaluate((node) => node.complete && node.naturalWidth >= 500),
      )
      .toBe(true);
    await expect(img).toHaveAttribute("src", /^\/mp2\/artworks\/\d+\.webp$/);
  }
  expect(remoteImages.length).toBeGreaterThanOrEqual(36);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: testInfo.outputPath("gallery-desktop.png") });
  await page.goto("./artworks/111436/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The Basket of Apples",
  );
  const painting = page.locator(".painting-button img");
  await expect
    .poll(() =>
      painting.evaluate((node) => node.complete && node.naturalWidth >= 500),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: "Enlarge The Basket of Apples" })
    .click();
  const enlarged = page.locator("dialog img");
  await expect
    .poll(() =>
      enlarged.evaluate((node) => node.complete && node.naturalWidth >= 500),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await page.screenshot({ path: testInfo.outputPath("detail-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.locator(".art-card")).toHaveCount(36);
  await expect
    .poll(() =>
      page
        .locator(".hero-art img")
        .evaluate((node) => node.complete && node.naturalWidth >= 500),
    )
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath("gallery-mobile.png") });
});

test("available museum media uses the image URL supplied by the API", async ({ page }) => {
  const work = fixture.data.find((item) => item.id === 16568)!;
  const primary = `${fixture.config.iiif_url}/${work.image_id}/full/843,/0/default.jpg`;
  await page.route(primary, (route) =>
    route.fulfill({ path: "public/artworks/16568.webp", contentType: "image/webp" }),
  );
  await page.goto("./artworks/16568/");
  const painting = page.locator(".painting-button img");
  await expect.poll(() => painting.evaluate((node) => node.complete && node.naturalWidth >= 500)).toBe(true);
  await expect(painting).toHaveAttribute("src", primary);
});
