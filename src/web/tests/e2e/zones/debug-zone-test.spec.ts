import { test, expect } from "@playwright/test";

test("debug zone create", async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Login
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";

  await page.goto("/login");
  await page.getByPlaceholder("Enter your username").fill(adminUsername);
  await page.getByPlaceholder("Enter your password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("/dashboard");

  // Go to create zone
  await page.goto("/zones/new");
  await page.waitForLoadState("networkidle");

  // Listen for network requests
  page.on('response', async resp => {
    if (resp.url().includes('graphql') && resp.status() >= 400) {
      console.log('GraphQL Error Response:', resp.status(), await resp.text().catch(() => 'N/A'));
    }
  });

  // Submit without any data
  await page.getByRole("button", { name: /Create Zone/ }).click();
  
  // Wait a bit
  await page.waitForTimeout(3000);
  
  console.log('Console errors:', errors);
});
