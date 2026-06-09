# Cursor Implementation Tasks - SEPUR Fiori CAP Application I59

## 1. Project objective

Implement a role-based SAPUI5/Fiori-style CAP application for SEPUR with two main dashboards:

- Planner dashboard: create and manage Tours and RoadMaps.
- Supervisor dashboard: validate or reject Tours and RoadMaps, with ability to review and adjust RoadMap assignments before validation.

The implementation must follow the business rules from the I59 specification:

- Tours are created by the SEPUR Planner.
- RoadMaps are monthly and client-based.
- A RoadMap groups existing validated Tours for the same client and same month.
- Only validated RoadMaps are eligible for CPI extraction.
- CPI creates one SAP Sales Order per validated RoadMap.
- Tours inside a RoadMap are grouped by material for Sales Order item creation.

## 2. Functional rules to respect

### 2.1 Tour rules

Implement the following Tour creation rules:

- TOUR-001: A Tour must be assigned to one client.
- TOUR-002: A Tour must have one collection date.
- TOUR-003: A Tour must have one material to be collected.
- TOUR-004: Quantity must be greater than zero.
- TOUR-005: Selected material should exist in a valid SAP contract for the selected client. If SAP contract validation is not yet implemented, keep a TODO placeholder service.
- TOUR-006: Tour quantity must not exceed available contract quantity. If not yet implemented, keep a TODO validation hook.
- TOUR-007: Human and material resource categories must come from predefined value lists.
- TOUR-008: A Tour can only be added to a RoadMap if it has a valid/validated status.

### 2.2 RoadMap rules

Implement the following RoadMap rules:

- RM-001: A RoadMap must be created for one client and one month/year.
- RM-002: Only existing Tours can be added to a RoadMap.
- RM-003: Only Tours for the same client can be added.
- RM-004: Only Tours with collectionDate inside the selected RoadMap month/year can be selected.
- RM-005: A Tour can only belong to one validated RoadMap.
- RM-006: Actual human resources must be selected from HumanResources.
- RM-007: Actual material resources must be selected from MaterialResources.
- RM-008: A RoadMap must be validated before CPI extraction.
- RM-009: Once integrated successfully, a RoadMap must not be changed unless a controlled correction process exists.

### 2.3 Resource rules

- During Tour creation, the planner may define required categories or assign actual resources.
- During RoadMap creation, the planner must be able to assign one or multiple actual human resources and one or multiple actual material resources from available resources.
- Resource value lists must be filtered by availability status AVAILABLE when possible.

### 2.4 Supervisor rules

- Supervisor can view all created Tours and RoadMaps.
- Supervisor validates or rejects Tours.
- Rejection requires a reason.
- Supervisor can review RoadMaps, assigned Tours and resources.
- Supervisor can modify RoadMap assignments and resource assignments before validation.
- Supervisor validates or rejects RoadMaps.
- Rejection requires a reason.

## 3. UI architecture to implement

Do not navigate to separate dashboard pages when clicking sidebar buttons. Keep the sidebar and header fixed, and replace only the central content area.

### 3.1 Required layout

For both planner and supervisor dashboards:

- Fixed left sidebar.
- Fixed top header.
- Scrollable main content area.
- The red-marked body area in the screenshot must become a dynamic content container.
- Sidebar buttons change the central content only.

### 3.2 Suggested UI structure

Use one root dashboard view per role:

- app/planner-dashboard/webapp/view/Dashboard.view.xml
- app/supervisor-dashboard/webapp/view/Dashboard.view.xml

Inside each dashboard body, use a dynamic container:

```xml
<VBox id="dynamicContent" class="dynamicContentArea" />
```

The controller should render/switch content by state:

- Planner states:
  - dashboard
  - tours
  - roadmaps
  - rejectedTours

- Supervisor states:
  - dashboard
  - toursValidation
  - roadmapsValidation
  - salesOrders
  - history

Use JSONModel property:

```js
/currentSection
```

or create/destroy fragments inside `dynamicContent`.

## 4. Planner dashboard requirements

### 4.1 Sidebar actions

Planner sidebar:

- Dashboard: show KPI cards and charts.
- Tournées: show Tour list in the central content area.
- Roadmaps: show RoadMap list and creation flow in the central content area.
- Tournées rejetées: show rejected Tours only.
- Accueil: return to home or dashboard.
- Actualiser: refresh current section.
- Déconnexion: logout.

### 4.2 Planner Tours section

When planner clicks Tournées:

Display inside the central body:

- Header: "Tournées de collecte".
- Toolbar:
  - Créer
  - Supprimer
  - Actualiser
- Table of Tours with columns:
  - N° tournée / tourNumber
  - Date de collecte / collectionDate
  - Client
  - Matériau
  - Quantité
  - Unité
  - Ressource(s) humaine(s)
  - Ressource(s) matérielle(s)
  - Statut
  - Remarques

Delete button:

- Disabled until one or more rows are selected.
- On delete, ask confirmation.
- Delete selected Tours only if status is DRAFT, CREATED or REJECTED.
- Do not allow deletion of VALIDATED, ASSIGNED, INTEGRATED or RoadMap-linked Tours.

### 4.3 Planner Tour creation dialog

On Créer:

Open a Dialog in the center of the page with a clean SAP/Fiori style form.

Fields:

- tourNumber: generated automatically; read-only.
- collectionDate: DatePicker.
- client: Select/ComboBox loaded from Clients.
- material: Select/ComboBox loaded from Materials.
- quantity: Input type Number.
- unitOfMeasure: Select or auto-filled from selected Material.
- required human resource category or assignedHumanResources: MultiComboBox from HumanResources filtered by AVAILABLE.
- required material resource category or assignedMaterialResources: MultiComboBox from MaterialResources filtered by AVAILABLE.
- remarks: TextArea.

Buttons:

- Save Draft: creates or updates Tour with status DRAFT/CREATED depending on backend model. If DRAFT enum is not available, use CREATED and add draft flag if needed.
- Créer: enabled only when mandatory fields are filled and quantity > 0.
- Annuler.

Validation:

- client required.
- collectionDate required.
- material required.
- quantity > 0.
- unitOfMeasure required.
- Show MessageToast or MessageBox for errors.

### 4.4 Planner rejected Tours section

Display only rejected Tours.

Planner can:

- Open a rejected Tour.
- See rejection reason.
- Modify business fields.
- Re-submit the Tour by setting status back to CREATED.

## 5. Planner RoadMaps section

### 5.1 RoadMap list

When planner clicks Roadmaps:

Display inside central body:

- Header: "Feuilles de route".
- Toolbar:
  - Créer RoadMap
  - Supprimer
  - Télécharger feuille de route
  - Actualiser
- Table columns:
  - N° feuille de route / roadmapNumber
  - Client
  - Mois
  - Année
  - Statut
  - Statut intégration
  - Commande SAP
  - Date intégration
  - Message intégration

Delete RoadMap rules:

- Can delete DRAFT/CREATED only.
- Cannot delete VALIDATED, INTEGRATED or Integration Error without controlled action.

### 5.2 RoadMap creation flow

On Créer RoadMap, open a dialog/wizard.

Step 1 - Header selection:

- client: Select/ComboBox loaded from Clients.
- month: Select 1-12.
- year: Select current year +/- needed range.

After selecting client/month/year:

- Load only Tours that satisfy all conditions:
  - same client.
  - collectionDate inside selected month/year.
  - status = VALIDATED.
  - not already assigned to a validated RoadMap.

Step 2 - Tour assignment:

- Show selectable table of eligible Tours.
- Columns:
  - tourNumber
  - collectionDate
  - material
  - quantity
  - unitOfMeasure
  - current resources
  - status
- Allow multi-selection.

Step 3 - resource assignment:

For each selected Tour:

- Allow assigning one or many HumanResources from available resources.
- Allow assigning one or many MaterialResources from available resources.
- Persist assignments.

Step 4 - review:

- Show RoadMap summary.
- Show grouped quantities by material.
- Show selected Tours.
- Show assigned resources.

Buttons:

- Save Draft
- Créer RoadMap
- Annuler

### 5.3 RoadMap document generation

After RoadMap creation, generate a printable RoadMap document.

Document content:

- SEPUR logo.
- RoadMap number.
- Client information.
- Month/year.
- Creation date.
- List of assigned Tours:
  - tourNumber
  - collectionDate
  - material
  - quantity
  - unitOfMeasure
  - assigned human resources
  - assigned material resources
- Summary grouped by material:
  - material
  - total quantity
  - unit
- Signature/validation section.

Implementation option:

- First iteration: HTML print preview with `window.print()`.
- Later: PDF generation.

## 6. Supervisor dashboard requirements

### 6.1 Sidebar actions

Supervisor sidebar:

- Dashboard: show KPI cards and charts.
- Tournées: show Tours requiring validation.
- Roadmaps: show RoadMaps requiring validation.
- Sales Orders: show Sales Order/integration status list.
- Historique: show validation/rejection history.
- Actualiser.
- Déconnexion.

### 6.2 Supervisor Tours section

When supervisor clicks Tournées:

Display central content:

- Table of Tours with status CREATED/PENDING.
- Columns:
  - tourNumber
  - collectionDate
  - client
  - material
  - quantity
  - unitOfMeasure
  - assigned resources
  - remarks
  - status
- Actions per row or toolbar:
  - Valider
  - Rejeter
  - Voir détails

Validate Tour:

- Check mandatory fields.
- Check quantity > 0.
- Optional SAP contract validation TODO.
- Set status = VALIDATED.
- Add DecisionHistory ACCEPTED/VALIDATED.

Reject Tour:

- Open dialog requiring reason.
- Set status = REJECTED or CANCELLED depending current enum strategy.
- Store reason in DecisionHistory and rejectionReason/remarks field.

### 6.3 Supervisor RoadMaps section

When supervisor clicks Roadmaps:

Display central content:

- Table of RoadMaps with status CREATED/PENDING.
- Columns:
  - roadmapNumber
  - client
  - month
  - year
  - selected Tours count
  - status
  - integrationStatus
- Actions:
  - Voir détails
  - Modifier assignments/resources
  - Valider
  - Rejeter

Supervisor must be able to:

- Review RoadMap header.
- Review selected Tours.
- Edit selected Tours before validation.
- Edit assigned human/material resources.
- Validate RoadMap.
- Reject RoadMap with reason.

Validation:

- RoadMap must have client, month, year.
- RoadMap must have at least one assigned Tour.
- All assigned Tours must be VALIDATED.
- All assigned Tours must belong to same client.
- All assigned Tours must be inside selected month/year.
- Set RoadMap status = VALIDATED.
- Set integrationStatus = PENDING/Not Integrated.

## 7. Backend CAP tasks

### 7.1 Entities to verify

Check db/schema.cds and srv/route-management-service.cds.

Required entities:

- Users
- Clients
- Materials
- HumanResources
- MaterialResources
- Tours
- Roadmaps or RoadMaps: choose one naming convention and keep it consistent in service and UI.
- RoadMapTourAssignments or RoadmapTours: choose one naming convention and keep it consistent.
- DecisionHistories

### 7.2 Required actions/functions

Add or verify CAP actions:

Tours:

- createTourDraft or normal CREATE Tours.
- submitTour.
- validate/acceptTour.
- reject/rejectTour.
- deleteTour with business rule protection if needed.

RoadMaps:

- getEligibleToursForRoadMap(clientID, month, year).
- createRoadMapWithTours(clientID, month, year, tourIDs, resourceAssignments).
- validateRoadMap.
- rejectRoadMap.
- updateRoadMapAssignments.
- generateRoadMapDocumentData(roadMapID).

Integration:

- roadmapsForIntegration(fromDate, toDate, status, integrationStatus).
- updateRoadMapIntegrationStatus.

### 7.3 Backend validation rules

Implement server-side validation, not only frontend:

- Tour mandatory fields.
- Quantity > 0.
- RoadMap same client.
- RoadMap same month/year.
- RoadMap uses only VALIDATED Tours.
- Tour belongs to only one validated RoadMap.
- Integrated RoadMap cannot be modified.
- Rejection reason required.

## 8. Frontend implementation tasks

### 8.1 Planner files likely to modify

- app/planner-dashboard/webapp/view/Dashboard.view.xml
- app/planner-dashboard/webapp/controller/Dashboard.controller.js
- app/planner-dashboard/webapp/css/style.css
- app/planner-dashboard/webapp/model/models.js if exists
- app/planner-dashboard/webapp/manifest.json if new routes/models are needed

Recommended fragments:

- app/planner-dashboard/webapp/view/fragments/ToursList.fragment.xml
- app/planner-dashboard/webapp/view/fragments/TourDialog.fragment.xml
- app/planner-dashboard/webapp/view/fragments/RoadmapsList.fragment.xml
- app/planner-dashboard/webapp/view/fragments/RoadmapWizard.fragment.xml
- app/planner-dashboard/webapp/view/fragments/RoadmapPrint.fragment.xml

### 8.2 Supervisor files likely to modify

- app/supervisor-dashboard/webapp/view/Dashboard.view.xml
- app/supervisor-dashboard/webapp/controller/Dashboard.controller.js
- app/supervisor-dashboard/webapp/css/style.css

Recommended fragments:

- app/supervisor-dashboard/webapp/view/fragments/ToursValidation.fragment.xml
- app/supervisor-dashboard/webapp/view/fragments/TourValidationDialog.fragment.xml
- app/supervisor-dashboard/webapp/view/fragments/RoadmapsValidation.fragment.xml
- app/supervisor-dashboard/webapp/view/fragments/RoadmapReviewDialog.fragment.xml
- app/supervisor-dashboard/webapp/view/fragments/RejectionDialog.fragment.xml

## 9. Styling rules

Keep the same visual language already used in the dashboards:

- White fixed sidebar.
- Fiori SAP font `72`.
- White cards with rounded corners.
- Light shadows.
- Blue selected sidebar item.
- Header fixed at top.
- Body scrollable.
- KPI cards use GenericTile/NumericContent.
- Main tables and forms use sap.m controls.
- Dialogs use Fiori clean form layout.

## 10. Suggested implementation order

1. Stabilize schema and service entity names.
2. Implement backend validation for Tours.
3. Implement planner Tours list in dashboard dynamic area.
4. Implement Tour creation dialog with value helps.
5. Implement delete/re-submit rejected Tour.
6. Implement supervisor Tours validation area.
7. Implement backend RoadMap eligible Tours function.
8. Implement planner RoadMap creation wizard.
9. Implement RoadMap print/preview document.
10. Implement supervisor RoadMap review/validation area.
11. Implement RoadMap integration status fields.
12. Implement roadmapsForIntegration endpoint for CPI.
13. Add tests with sample data.
14. Clean old navigation if no longer needed.

## 11. Cursor prompt to execute

Use the following prompt in Cursor.

---

You are working on a SAP CAP + SAPUI5/Fiori project named SEPUR_TOURS_MANAGEMENT. Implement a role-based dashboard experience for Planner and Supervisor without breaking the existing application.

Business context: SEPUR plans waste collection Tours and groups validated Tours into monthly RoadMaps. Planner creates Tours and RoadMaps. Supervisor validates or rejects Tours and RoadMaps. Only validated RoadMaps are later extracted by CPI to create SAP S/4HANA Sales Orders. Tours in a RoadMap are grouped by material for Sales Order item creation.

Main UI requirement: In both planner-dashboard and supervisor-dashboard, keep the sidebar and top header fixed. When the user clicks a sidebar button, do not navigate away. Replace only the central body content area with the selected section.

Planner sections:
1. Dashboard: keep existing KPI cards and charts.
2. Tournées: display a Tour table with toolbar actions Créer, Supprimer, Actualiser. Create opens a Fiori-style dialog with DatePicker, client ComboBox, material ComboBox, quantity input, unit of measure, MultiComboBox for available human resources, MultiComboBox for available material resources, and remarks. Required fields: client, collectionDate, material, quantity > 0, unitOfMeasure. Delete only DRAFT/CREATED/REJECTED Tours.
3. Roadmaps: display RoadMap table. Create RoadMap opens a wizard: select client, month and year; load only eligible Tours that are VALIDATED, same client, inside selected month/year, and not already assigned to a validated RoadMap; select Tours; assign one or multiple available human/material resources per Tour; review; create RoadMap. Add a print/preview RoadMap document with SEPUR logo, RoadMap details, selected Tours, resources and grouped material quantities.
4. Tournées rejetées: list rejected Tours, show rejection reason, allow correction and resubmission.

Supervisor sections:
1. Dashboard: keep existing KPI cards and charts with same style as planner.
2. Tournées: list Tours awaiting validation. Supervisor can view details, validate, or reject with mandatory reason. Validation checks mandatory fields and quantity > 0.
3. Roadmaps: list RoadMaps awaiting validation. Supervisor can view, modify Tour assignments/resources before validation, validate, or reject with mandatory reason. Validation checks client/month/year, at least one Tour, all Tours VALIDATED, same client, same month/year.
4. Sales Orders: show RoadMap integration status and SAP Sales Order number.
5. Historique: show DecisionHistories.

Backend requirements:
- Ensure server-side validation for all business rules.
- Add or reuse CAP actions/functions: getEligibleToursForRoadMap(clientID, month, year), createRoadMapWithTours, validateRoadMap, rejectRoadMap, updateRoadMapAssignments, roadmapsForIntegration, updateRoadMapIntegrationStatus.
- Keep entity naming consistent. If current code uses Roadmaps but schema uses RoadMaps, choose one and update all affected service/UI references carefully.
- Do not remove existing working dashboard KPI/charts.
- Do not break login.
- Keep existing Fiori styling: SAP 72 font, white cards, rounded corners, fixed sidebar/header, scrollable body.

Please inspect the current files first, then implement incrementally. Start by creating the dynamic central content container and Planner Tournées section. After each major change, check for syntax errors and ensure cds watch can run.

---

