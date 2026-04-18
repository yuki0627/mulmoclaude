// Plugin launcher buttons that sit above the canvas. All buttons
// switch the canvas view mode directly via kind:"view" — the URL
// reflects the state (?view=todos, ?view=wiki, etc.) and landing
// on that URL restores the view.
//
// First slice of issue #253.

import { test, expect } from "@playwright/test";
import { mockAllApis } from "../fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockAllApis(page);
});

test.describe("plugin launcher — view path", () => {
  test("Todos button switches canvas to todos view", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForURL(/\/chat\//);

    await page.getByTestId("plugin-launcher-todos").click();

    await page.waitForURL(/view=todos/);
    expect(page.url()).toContain("view=todos");
  });

  test("Scheduler button switches canvas to scheduler view", async ({
    page,
  }) => {
    await page.goto("/chat");
    await page.waitForURL(/\/chat\//);

    await page.getByTestId("plugin-launcher-scheduler").click();

    await page.waitForURL(/view=scheduler/);
    expect(page.url()).toContain("view=scheduler");
  });

  test("Wiki button switches canvas to wiki view", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForURL(/\/chat\//);

    await page.getByTestId("plugin-launcher-wiki").click();

    await page.waitForURL(/view=wiki/);
    expect(page.url()).toContain("view=wiki");
  });

  test("Skills button switches canvas to skills view", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForURL(/\/chat\//);

    await page.getByTestId("plugin-launcher-skills").click();

    await page.waitForURL(/view=skills/);
    expect(page.url()).toContain("view=skills");
  });

  test("Roles button switches canvas to roles view", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForURL(/\/chat\//);

    await page.getByTestId("plugin-launcher-roles").click();

    await page.waitForURL(/view=roles/);
    expect(page.url()).toContain("view=roles");
  });

  test("Files button switches canvas to files view", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForURL(/\/chat\//);

    await page.getByTestId("plugin-launcher-files").click();

    await page.waitForURL(/view=files/);
    expect(page.url()).toContain("view=files");
    expect(page.url()).not.toContain("path=");
  });
});
