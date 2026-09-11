# HiveHand Install (macOS + Windows)

HiveHand consists of:
1) A **DSH Agent Preset** named `hivehand` (lives under `~/.dsh/.agent-presets/hivehand/`)
2) Workspace assets in your repo: `hivehand/` and `work_folders/`
3) Local embeddings via **Ollama** (`nomic-embed-text`)

---

## A) Export from source machine

### Preset
macOS/Linux:
```bash
cd "$HOME/.dsh/.agent-presets" && zip -r hivehand_preset.zip hivehand
```

### Workspace assets
Recommended (exclude live index; rebuild on target):
```bash
cd "<your-workspace-root>" && zip -r hivehand_workspace.zip hivehand work_folders -x "hivehand/vector_db/index.json"
```

Transfer:
- `hivehand_preset.zip`
- `hivehand_workspace.zip`

---

## B) Install on Windows

### 1) Preset install
```powershell
$dst = "$env:USERPROFILE\.dsh\.agent-presets"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Expand-Archive -Force -Path .\hivehand_preset.zip -DestinationPath $dst
```

### 2) Workspace assets
```powershell
cd "C:\path\to\your\workspace"
Expand-Archive -Force -Path C:\path\to\hivehand_workspace.zip -DestinationPath .
```

### 3) Ollama
Install Ollama (Windows installer): https://ollama.com/download

Then:
```powershell
ollama pull nomic-embed-text
```

### 4) Reindex (run once after you add docs)
From workspace root:
```powershell
powershell -ExecutionPolicy Bypass -File .\hivehand\install\windows_setup.ps1
```

---

## C) Install on macOS

From workspace root:
```bash
bash hivehand/install/macos_setup.sh
```

---

## Using HiveHand

1) Start a new session in DSH
2) Select preset **HiveHand (Proposal Pipeline)**
3) The role agents are prompted to use semantic search over `work_folders/*` via:
   - `node hivehand/vector_db/indexer.js search ...`

If search results look stale after adding documents, rerun the reindex script.
