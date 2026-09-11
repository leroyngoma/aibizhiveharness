# Setting up DeepSeek Harness (dsh) + dsh-passwords on a new Windows Server

Multi-user remote access to a single dsh instance, secured with the dsh-passwords plugin, on a Windows Server VM with a static public IP on the open internet.

---

## 1. Provision the VM and lock down networking

Create the Windows Server VM with a static public IP.

**Cloud NSG (e.g. Azure Networking):**
- Allow inbound **80** and **443** from `Any` (needed for the app and its auto-HTTPS certificate).
- Restrict **RDP (3389)** to your own IP only — never leave it open to `Any`. This is the single biggest exposure on an internet-facing box.

**Windows Defender Firewall** (run as Administrator):
```powershell
New-NetFirewallRule -DisplayName "dsh-passwords HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "dsh-passwords HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## 2. Install Node.js and dsh, verify it works

```powershell
winget install OpenJS.NodeJS.LTS
```
Close and reopen PowerShell so `node`/`npm` are on PATH, then:
```powershell
npm install -g @deepseek-ai/dsh@0.1.2-rc.1
```

Verify it actually works with your model **before** going further:
```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"   # or your actual provider's key/env var
dsh web
```
Confirm the local Web UI responds at `http://127.0.0.1:3080` and you can send a message. Then `Ctrl+C` to stop it.

---

## 3. Install dsh-passwords from the npm registry

Skip `git clone` entirely — install the published package directly. This avoids the local build/`npm ci` step and its quirks:
```powershell
npm install -g dsh-passwords
```

---

## 4. Apply the Windows compatibility patch

There's a known bug in how the installer shells out to `.cmd` binaries (`dsh`, `npm`, `pnpm`) on Windows — it fails at the detection step on every Windows machine with a "未找到 dsh" (dsh not found) error, even when dsh is installed and working correctly. Patch it before running the installer.

Open the file:
```powershell
notepad "$env:APPDATA\npm\node_modules\dsh-passwords\scripts\install.mjs"
```

Find this block:
```javascript
  let result;
  if (isWin && WINDOWS_SHIMS.has(command)) {
    const line = [commandPath(command), ...args].map((a) => `"${a}"`).join(' ');
    result = spawnSync(
      process.env.ComSpec || 'cmd.exe',
      ['/d', '/s', '/c', `"${line}"`],
      runOptions,
    );
  } else {
    result = spawnSync(commandPath(command), args, runOptions);
  }
```

Replace it with:
```javascript
  let result;
  if (isWin && WINDOWS_SHIMS.has(command)) {
    // .cmd shims need a real shell on Windows. shell:true with a single
    // pre-joined string lets Node handle Windows quoting correctly —
    // manually wrapping the line in an extra layer of quotes collides
    // with Node's own escaping and breaks every .cmd invocation.
    const line = [commandPath(command), ...args].map((a) => `"${a}"`).join(' ');
    result = spawnSync(line, { ...runOptions, shell: true });
  } else {
    result = spawnSync(commandPath(command), args, runOptions);
  }
```

Save the file.

> **Note:** check whether the published package still has this exact unpatched code before editing — if the maintainer has since shipped a fix, this step becomes a no-op. Harmless either way.

---

## 5. Pre-install pnpm manually

`dsh-passwords install` tries to auto-install pnpm if it's missing, but that auto-install path is broken on Windows — it tries to invoke npm from inside `dsh-passwords`'s own (shadowed/incomplete) local `node_modules` instead of your real global npm, and fails with `Cannot find module '...\dsh-passwords\node_modules\npm\bin\npm-prefix.js'`. Avoid triggering it by installing pnpm yourself, first, from outside the project folder:

```powershell
cd C:\
npm install -g pnpm
pnpm --version
```

Confirm a version number prints back before moving on. This is a second, separate Windows path/shim bug from the one patched in step 4 — worth including in the same GitHub issue if you file one.

---

## 6. Run the installer

```powershell
dsh-passwords install
```

It should now detect pnpm is already present and skip straight past that step, then proceed cleanly through: Node check → dsh check → pnpm check → `.env` generation → plugin registration → patch applied → **"★ 安装完成 / Install complete"**.

**Copy the printed `SETUP_KEY` somewhere safe** — it's needed once, and the backing `setup-key.txt` file auto-deletes after first use.

---

## 6. Start dsh and complete first-time setup

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"   # or your actual provider's key/env var
dsh web
```

From any browser:
```
https://<your-static-IP>.sslip.io
```
First visit auto-issues a free Let's Encrypt HTTPS certificate (needs port 80 reachable — confirmed in step 1) and redirects to a first-time setup page. Enter the `SETUP_KEY` and create your main/admin account.

*(If you have your own domain instead of using sslip.io, point an A record at your static IP and add `MCP_GATEWAY_DOMAIN=yourdomain.com` to `.env`.)*

---

## 7. Add subusers with permissions

Log in as admin → **Settings → Plugins → dsh-passwords card → Subuser management**. For each person:
- Create username + password (12+ chars, mixed case/digit/symbol — enforced automatically).
- Set their **workspace whitelist** — which folders they can see. This is what keeps one user's workspace hidden from another; it's admin-curated, not automatic per-creator ownership.
- Set hourly token cap, daily time cap, and sandbox level (read-only / writable / full) as needed.
- Leave **git-download permission off** unless someone specifically needs it.

Everyone logs in at the same URL from step 6 above, with their own username/password.

---

## 8. Harden secrets and keep it running as a service

**Independent secrets** — in `.env`, set your own random values rather than relying on defaults derived from `SETUP_KEY`:
```
MCP_JWT_SECRET=<random 64-char hex string>
MCP_DB_ENC_KEY=<random 64-char hex string>
```
Generate one in PowerShell:
```powershell
-join ((48..57)+(97..102) | Get-Random -Count 64 | % {[char]$_})
```
⚠️ **`MCP_DB_ENC_KEY` can never be changed once set** — all encrypted data becomes unreadable if you rotate it. Set it once, correctly, now.

**Run as a Windows service** so it survives reboots and restarts on crash, instead of dying when your RDP session disconnects:
```powershell
winget install -e --id NSSM.NSSM
```
Then configure NSSM to run `node.exe` with the dsh entry script and `web --no-open`, set `DSH_HOME` as an environment variable, configure logging, and set `AppExit Default Restart`. (Ask for the full NSSM command sequence if you need it spelled out again.)

---

## Ongoing hygiene

- **Pin versions** — note the exact `dsh` and `dsh-passwords` versions this guide was built against (`dsh@0.1.2-rc.1`), since a future `npm update` could silently reintroduce the step-4 and step-5 bugs if they aren't merged upstream yet.
- **Back up `.env` and `data\platform.db` together** — they're cryptographically linked via `MCP_DB_ENC_KEY`; backing up one without the other makes backups useless.
- **Review the audit log periodically:**
  ```powershell
  node "$env:APPDATA\npm\node_modules\dsh-passwords\dist\cli.js" audit --limit 20
  ```
- **Consider filing a GitHub issue** on `slywalker2006/dsh-passwords` covering both Windows bugs (the step-4 `.cmd` shell-escaping issue and the step-5 pnpm auto-install path) — both affect every Windows user installing the package.
