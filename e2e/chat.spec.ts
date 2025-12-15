import { expect, test } from '@playwright/test'

function getRequiredEnvAny(names: string[]) {
  for (const name of names) {
    const v = process.env[name]
    if (v)
      return v
  }
  throw new Error(`Missing required env var (any of): ${names.join(', ')}`)
}

interface E2EConfig {
  apiKey: string
  model: string
  baseUrl: string
}

function e2eInitScript(config: E2EConfig) {
  ;(globalThis as any).__FLOW_CHAT_E2E__ = true

  // Disable tutorials in E2E
  localStorage.setItem('tutorial/firstHereDriver', 'false')
  localStorage.setItem('tutorial/chatDriver', 'false')
  localStorage.setItem('tutorial/settingsDriver', 'false')

  // Configure OpenRouter as the text generation provider
  const providerName = 'OpenRouter'
  const provider = {
    id: crypto.randomUUID(),
    name: providerName,
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  }

  localStorage.setItem('settings/configuredTextProviders', JSON.stringify([provider]))
  localStorage.setItem('settings/defaultTextModel', JSON.stringify({ provider: providerName, model: config.model }))

  // Avoid image tool usage in this smoke test
  localStorage.setItem('settings/imageGeneration', JSON.stringify({ apiKey: '', baseURL: '', model: '' }))
}

test('can navigate via flow UI, enter settings, and receive streamed assistant output (OpenRouter)', async ({ page }) => {
  test.setTimeout(60_000)
  /* eslint-disable no-console */
  page.on('console', (msg) => {
    console.log(`[browser:${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => {
    console.log(`[pageerror] ${err.message}`)
  })
  page.on('requestfailed', (req) => {
    console.log(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText ?? ''}`)
  })
  /* eslint-enable no-console */

  const apiKey = getRequiredEnvAny(['LLM_API_KEY', 'OPENROUTER_API_KEY'])
  const model = getRequiredEnvAny(['LLM_MODEL', 'OPENROUTER_MODEL'])
  const baseUrl = process.env.LLM_BASE_URL ?? process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'

  await page.addInitScript(e2eInitScript, {
    apiKey,
    model,
    baseUrl,
  })

  await page.goto('/')

  // The index page redirects to /chat/:id after DB init + room init.
  await expect(page).toHaveURL(/\/chat\//, { timeout: 60_000 })

  // Sanity: we start in Flow view
  await expect(page.getByTestId('flow-view')).toBeVisible({ timeout: 30_000 })

  // Verify Settings is reachable through the UI
  const settingsBtn = page.locator('#settings-btn')
  await expect(settingsBtn).toBeVisible({ timeout: 30_000 })

  // In headless/CI, hit-testing can be flaky due to transient overlays.
  // Trigger the click on the element directly and wait for SPA route change.
  await settingsBtn.evaluate((el: HTMLElement) => el.click())
  await page.waitForFunction(() => location.pathname.startsWith('/settings'), null, { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({ timeout: 30_000 })

  // Back to chat
  const backBtn = page.locator('#settings-back-btn')
  await expect(backBtn).toBeVisible({ timeout: 30_000 })
  await backBtn.evaluate((el: HTMLElement) => el.click())
  await page.waitForFunction(() => location.pathname.startsWith('/chat/'), null, { timeout: 30_000 })

  const input = page.getByTestId('chat-input')
  const send = page.getByTestId('chat-send')

  await expect(input).toBeVisible({ timeout: 30_000 })

  const prompt = `Hello from e2e ${Date.now()}`
  await input.fill(prompt)
  await send.click()

  // In Flow mode, right click the newly created user node and switch to conversation view.
  // Do this as soon as the user node appears to avoid the assistant node overlapping and intercepting clicks.
  const userNode = page.locator('[data-testid="flow-node"][data-node-role="user"]').last()
  await expect(userNode).toBeVisible({ timeout: 30_000 })

  // In headless mode, nodes can overlap slightly differently, causing pointer interception.
  // Force the event to target the intended element and click a deterministic point within it.
  await userNode.click({ button: 'right', force: true, position: { x: 8, y: 8 } })

  await expect(page.getByTestId('node-context-menu')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('node-menu-focus-in').click()

  // Now we should be in conversation view and see messages
  await expect(page.getByTestId('conversation')).toBeVisible({ timeout: 30_000 })

  const userMsg = page.locator('[data-testid="message-user"]').last()
  await expect(userMsg).toContainText(prompt, { timeout: 30_000 })

  const assistantMsg = page.locator('[data-testid="message-assistant"]').last()
  await expect(assistantMsg).toBeVisible({ timeout: 60_000 })

  await expect.poll(
    async () => {
      const text = (await assistantMsg.textContent()) ?? ''
      return text.trim().length
    },
    { timeout: 90_000, intervals: [500, 1000, 2000] },
  ).toBeGreaterThan(0)
})
