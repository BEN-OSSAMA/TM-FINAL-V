# SEPUR — Gestion des tournées de collecte et roadmaps

Application **SAP CAP / Fiori** pour la digitalisation des tournées de collecte et la gestion des roadmaps (PFE I59).

## Prérequis

- Node.js 18+
- `@sap/cds-dk` (installé via `npm install`)

## Démarrage local (SQLite)

```bash
npm install
npm add @cap-js/sqlite -D
cds deploy --to sqlite
cds watch
```

> **Windows :** si `better-sqlite3` échoue au déploiement, exécutez `npm rebuild better-sqlite3` (nécessite les outils C++ Visual Studio) ou utilisez **SAP Business Application Studio**, où SQLite est préconfiguré.

Applications disponibles (après `cds watch`) :

| Application | URL |
|-------------|-----|
| Connexion | http://localhost:4004/login/webapp/index.html |
| Dashboard Planificateur | http://localhost:4004/planner-dashboard/webapp/index.html |
| Dashboard Superviseur | http://localhost:4004/supervisor-dashboard/webapp/index.html |
| Tournées (Fiori Elements) | http://localhost:4004/tours/webapp/index.html |
| Roadmaps (Fiori Elements) | http://localhost:4004/roadmaps/webapp/index.html |
| API OData | http://localhost:4004/odata/v4/route-management/ |

## Comptes de test

| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| `planificateur` | `plan123` | PLANIFICATEUR |
| `superviseur` | `sup123` | SUPERVISEUR |

## Architecture

```
db/          Modèle CDS + données CSV
srv/         RouteManagementService (CDS + logique métier JS)
app/         login, planner-dashboard, supervisor-dashboard, tours, roadmaps
```

## Production BTP (futur)

- `mta.yaml` et `xs-security.json` conservés pour déploiement Cloud Foundry
- Basculer `cds.requires.db.kind` vers `hana` en production
- Remplacer l’action `login` par **XSUAA** et rôles IAS
