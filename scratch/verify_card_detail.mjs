import { chromium } from "@playwright/test";

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("Navigating to board detail...");
  await page.goto("http://localhost:5173/boards/board-website-redesign");
  await page.waitForSelector("text=Website Redesign");
  console.log("✓ Board page loaded");

  // 1. Verify Card Detail Opening Flow for NEX-101
  console.log("Clicking NEX-101 card...");
  const card101 = page.locator("text=Finalize landing page copy").first();
  await card101.click();

  const dialog = page.locator("[role='dialog']");
  await dialog.waitFor({ state: "visible" });
  console.log("✓ Card Detail Drawer opened");

  // Check code, title, and initial status
  await page.locator("text=NEX-101").waitFor();
  await page.locator("text=Finalize landing page copy").first().waitFor();
  console.log("✓ Card header & title visible");

  // Check consistent business logic: NEX-101 is NOT blocked
  const blockedBanner = page.locator("text=Blocked by an incomplete prerequisite");
  const isBlockedVisible = await blockedBanner.isVisible();
  if (isBlockedVisible) {
    throw new Error("FAIL: NEX-101 should NOT show blocked banner because NEX-107 is DONE!");
  }
  console.log("✓ Verified: NEX-101 does NOT show blocked banner");

  // Check checklist initial state (1/2, 50%)
  await page.locator("text=1/2 (50%)").waitFor();
  console.log("✓ Checklist counter 1/2 (50%) verified");

  // 2. Test Checklist Toggle (1/2 -> 2/2)
  console.log("Toggling Legal review checkbox...");
  const legalReviewCheckbox = page.locator("input[type='checkbox']").nth(1);
  await legalReviewCheckbox.click();
  await page.locator("text=2/2 (100%)").waitFor();
  console.log("✓ Checklist updated to 2/2 (100%)");

  // 3. Test Description Autosave
  console.log("Testing description autosave...");
  const descTextarea = dialog.locator("textarea").first();
  await descTextarea.fill("Review and finalize hero and features section copy. Updated for testing.");
  await page.locator("text=Unsaved changes...").waitFor();
  await page.waitForTimeout(1200); // Wait for debounce
  await page.locator("text=Auto-saved").waitFor();
  console.log("✓ Description autosaved successfully");

  // 4. Test Lazy-Loaded Activity
  console.log("Testing lazy-loaded activity...");
  const activityTab = dialog.locator("button[role='tab']:has-text('Activity')");
  await activityTab.click();
  await dialog.locator("text=created this card").waitFor();
  console.log("✓ Activity log lazy-loaded successfully");

  // 5. Test Status Change via moveCard (TO DO -> IN PROGRESS)
  console.log("Testing status change to IN PROGRESS...");
  const statusTrigger = dialog.locator("button:has-text('TO DO')").first();
  await statusTrigger.click();
  const inProgressOption = page.locator("[role='menuitem']:has-text('IN PROGRESS')");
  await inProgressOption.click();
  await dialog.locator("button:has-text('IN PROGRESS')").first().waitFor();
  console.log("✓ Status moved to IN PROGRESS");

  // 6. Test Close Drawer via X button
  console.log("Testing close drawer via close button...");
  const closeBtn = dialog.locator("button[aria-label='Close task details']");
  await closeBtn.click();
  await dialog.waitFor({ state: "hidden" });
  console.log("✓ Drawer closed cleanly");

  // 7. Test Blocked Card NEX-103
  console.log("Clicking blocked card NEX-103...");
  const card103 = page.locator("text=Finalize event materials & print assets").first();
  await card103.click();
  await dialog.waitFor({ state: "visible" });

  // NEX-103 MUST show the blocked banner!
  await page.locator("text=Blocked by an incomplete prerequisite").waitFor();
  console.log("✓ Verified: Blocked card NEX-103 shows blocked alert banner");

  // Try moving NEX-103 to DONE: must be rejected!
  console.log("Attempting to move NEX-103 to DONE (should be rejected)...");
  const status103 = dialog.locator("button:has-text('TO DO')").first();
  await status103.click();
  const doneOption = page.locator("[role='menuitem']:has-text('DONE')");
  await doneOption.click();

  // Check error toast notification
  await page.locator("text=Cannot move to Done").waitFor();
  console.log("✓ Verified: Moving blocked card to DONE is rejected with error toast");

  // Close drawer with Escape key
  console.log("Testing close via Escape key...");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  console.log("✓ Drawer dismissed via Escape key");

  console.log("\n==========================================");
  console.log("🎉 ALL E2E VERIFICATION CHECKS PASSED 100%!");
  console.log("==========================================\n");

  await browser.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
