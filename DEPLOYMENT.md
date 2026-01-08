# Manuelles Deployment für Forge App

**WICHTIG**: Deployment ist ein manueller Schritt, NICHT Teil der CI/CD Pipeline.

---

## Warum manuell?

Forge CLI hat eine Plattform-Beschränkung: Es verlangt interaktive Analytics-Zustimmung,
die in CI/CD-Umgebungen nicht umgangen werden kann.

Deployment ist daher ein **kontrollierter manueller Schritt**.

---

## Voraussetzungen

```bash
# 1. Build erfolgreich (CI muss grün sein)
#    Prüfe GitHub Actions:
#    https://github.com/WietRob/Jira_PlanningMate/actions

# 2. Lokal auf neuestem Stand
git pull origin main

# 3. Build ausführen (optional, um sicher zu gehen)
cd jira-plugin
npm run build
```

---

## Deployment durchführen

**Schritt 1: Deploy**

```bash
cd jira-plugin
forge deploy
```

Erwartetes Ergebnis:
```
Deploying to environment 'development'...
√ Deployed to 'ari:cloud:ecosystem::app/93d5f2bb-9931-445a-b59d-910eab95b0e3'
```

**Schritt 2: Installation aktualisieren**

```bash
cd jira-plugin
forge install --upgrade all
```

Erwartetes Ergebnis:
```
Upgrading installations...
✓ Upgraded installation on robertoschmidt.atlassian.net
```

---

## Fehlerbehebung

### `forge deploy` schlägt mit Auth-Fehler

```bash
# Token prüfen
echo $FORGE_API_TOKEN

# Neue Token erstellen, falls nötig:
# https://id.atlassian.com/manage-profile/security/api-tokens

# Setzen (nur wenn geändert)
export FORGE_API_TOKEN="ATATT3xFfG..."
```

### `forge install` schlägt

```bash
# Environment prüfen
echo $FORGE_ENVIRONMENT
# Sollte 'development' sein

# App ist installiert, aber nicht sichtbar?
forge install --app
```

---

## Deployment verifizieren

### 1. In Jira öffnen

```
https://robertoschmidt.atlassian.net/plugins/servlet/ac/com.atlassian.plugin.atlassianforge.app:93d5f2bb-9931-445a-b59d-910eab95b0e3/#!/index
```

**Sollte**: Global Page "Jira Planning Mate" erscheinen

### 2. App-Status prüfen

```bash
cd jira-plugin
forge status
```

### 3. Forge Logs prüfen

```bash
cd jira-plugin
forge logs --tail --limit=100
```

Keine Fehler (oder nur informative) ✓

---

## Rollback bei Problemen

### Schnelles Zurücksetzen

```bash
cd jira-plugin
forge deploy --version <previous-version>
```

### Oder manuell deinstallieren

```
In Jira: Apps → Apps verwalten → Jira Planning Mate → Deinstallieren
```

---

## Hinweise

1. **Immer zuerst `build`** vor deploy, um sicherzustellen, dass alles funktioniert
2. **Deployment nur auf `main` branch** (nicht feature branches)
3. **Logs sofort prüfen** nach deploy
4. **Bei Fehlern: Logs prüfen → Fixen → Bauen → Deployen**

---

## FAQ

**Q: Warum nicht einfach `yes n` pipen?**
A: Funktioniert nicht zuverlässig. Forge CLI startet Analytics-Prompt vor dem pipe.

**Q: Kann ich mehrere Environments deployen?**
A: Ja, mit `forge deploy --environment=production` (statt `development`).

**Q: Wie finde ich die App ID?**
A: In `jira-plugin/manifest.yml` unter `app.id`.
