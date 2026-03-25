import { test } from "@playwright/test";

test("debug depot create", async ({ page }) => {
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

  // Go to create depot
  await page.goto("/depots/new");
  await page.waitForLoadState("networkidle");

  // Fill name
  await page.getByPlaceholder("Enter depot name").fill("Debug Depot");

  // Listen for network requests
  const gqlRequests: { url: string; method: string; headers: Record<string, string>; postData: string | null }[] = [];
  page.on('request', req => {
    if (req.url().includes('graphql')) {
      gqlRequests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
        postData: req.postData()
      });
    }
  });
  
  page.on('response', async resp => {
    if (resp.url().includes('graphql')) {
      console.log('GraphQL Response:', resp.status(), await resp.text().catch(() => 'N/A'));
    }
  });

  // Submit
  await page.getByRole("button", { name: /Create Depot/ }).click();
  
  // Wait a bit
  await page.waitForTimeout(5000);
  
  console.log('GraphQL Requests:', JSON.stringify(gqlRequests, null, 2));
  console.log('Console errors:', errors);
});
