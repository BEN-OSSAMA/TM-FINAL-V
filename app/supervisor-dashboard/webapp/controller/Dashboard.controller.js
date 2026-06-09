sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/MessageStrip",
    "sap/m/Button",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format"
], function (
    Controller,
    Fragment,
    MessageToast,
    MessageBox,
    Popover,
    VBox,
    Text,
    MessageStrip,
    Button,
    ChartFormatter,
    Format
) {
    "use strict";

    const SECTION_FRAGMENTS = {
        dashboard: "sepur.supervisor.view.fragments.SupervisorDashboardHome",
        tours: "sepur.supervisor.view.fragments.ToursValidation",
        roadmaps: "sepur.supervisor.view.fragments.RoadmapsValidation",
        integration: "sepur.supervisor.view.fragments.IntegrationSection",
        history: "sepur.supervisor.view.fragments.HistorySection"
    };

    const MENU_BUTTON_IDS = {
        dashboard: "btnMenuDashboard",
        tours: "btnMenuTours",
        roadmaps: "btnMenuRoadmaps",
        integration: "btnMenuIntegration",
        history: "btnMenuHistory"
    };

    const PENDING_TOUR_STATUSES = new Set(["DRAFT", "PENDING", "CREATED"]);

    return Controller.extend("sepur.supervisor.controller.Dashboard", {

        onInit: function () {
            Format.numericFormatter(ChartFormatter.getInstance());

            const viewModel = this.getOwnerComponent().getModel("view");
            viewModel.setProperty("/currentSection", "dashboard");
            viewModel.setProperty("/toursSection", { items: [], hasSelection: false, selectedTour: null });
            viewModel.setProperty("/roadmapsSection", { items: [], hasSelection: false, selectedRoadmap: null });
            viewModel.setProperty("/integrationSection", { items: [] });
            viewModel.setProperty("/historySection", { items: [] });
            viewModel.setProperty("/rejectionDialog", { reason: "", targetType: "", targetId: "" });

            this._oCurrentFragment = null;
            this._oRejectionDialog = null;

            this._loadDashboard().then(function () {
                this._showSection("dashboard");
            }.bind(this));

            this._notificationInterval = setInterval(function () {
                this._loadNotifications();
            }.bind(this), 30000);
        },

        onExit: function () {
            if (this._notificationInterval) {
                clearInterval(this._notificationInterval);
            }
            if (this._notificationPopover) {
                this._notificationPopover.destroy();
            }
            if (this._oRejectionDialog) {
                this._oRejectionDialog.destroy();
            }
            if (this._oCurrentFragment) {
                this._oCurrentFragment.destroy();
            }
        },

        onNavigateSection: function (oEvent) {
            const sSection = oEvent.getSource().data("section");
            if (sSection) {
                this._showSection(sSection);
            }
        },

        onNavigateToTours: function () { this._showSection("tours"); },
        onNavigateToRoadmaps: function () { this._showSection("roadmaps"); },
        onNavigateToIntegration: function () { this._showSection("integration"); },
        onNavigateToHistory: function () { this._showSection("history"); },

        _showSection: async function (sSection) {
            const viewModel = this.getOwnerComponent().getModel("view");
            viewModel.setProperty("/currentSection", sSection);
            this._updateActiveMenu(sSection);

            const oContainer = this.byId("dynamicContent");
            if (!oContainer) {
                return;
            }

            oContainer.destroyItems();
            if (this._oCurrentFragment) {
                this._oCurrentFragment.destroy();
                this._oCurrentFragment = null;
            }

            try {
                const oFragment = await Fragment.load({
                    id: this.getView().getId() + "--" + sSection,
                    name: SECTION_FRAGMENTS[sSection],
                    controller: this
                });
                this._oCurrentFragment = oFragment;
                oContainer.addItem(oFragment);

                if (sSection === "dashboard") {
                    setTimeout(function () { this._applyOverviewChartDesign(); }.bind(this), 300);
                } else if (sSection === "tours") {
                    await this._loadToursSection();
                } else if (sSection === "roadmaps") {
                    await this._loadRoadmapsSection();
                } else if (sSection === "integration") {
                    await this._loadIntegrationSection();
                } else if (sSection === "history") {
                    await this._loadHistorySection();
                }
            } catch (e) {
                MessageBox.error("Impossible de charger la section.");
            }
        },

        _updateActiveMenu: function (sSection) {
            Object.keys(MENU_BUTTON_IDS).forEach(function (sKey) {
                const oButton = this.byId(MENU_BUTTON_IDS[sKey]);
                if (!oButton) {
                    return;
                }
                if (sKey === sSection) {
                    oButton.addStyleClass("activeMenu");
                } else {
                    oButton.removeStyleClass("activeMenu");
                }
            }.bind(this));
        },

        _loadDashboard: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            viewModel.setProperty("/busy", true);
            try {
                await Promise.all([
                    this._loadTourStats(),
                    this._loadRoadmapStats(),
                    this._loadIntegrationStats(),
                    this._loadHistoryStats(),
                    this._loadNotifications()
                ]);
                this._prepareOverviewCharts();
            } finally {
                viewModel.setProperty("/busy", false);
            }
        },

        _prepareOverviewCharts: function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            const t = viewModel.getProperty("/tourStats") || {};
            const r = viewModel.getProperty("/roadmapStats") || {};

            viewModel.setProperty("/tourDonutData", [
                { label: "En attente", value: t.pendingTours || 0 },
                { label: "Validées", value: t.acceptedTours || 0 },
                { label: "Rejetées", value: t.rejectedTours || 0 }
            ]);

            viewModel.setProperty("/roadmapBarData", [
                { label: "Créées", value: r.createdRoadmaps || 0 },
                { label: "Validées", value: r.validatedRoadmaps || 0 },
                { label: "Rejetées", value: r.rejectedRoadmaps || 0 }
            ]);
        },

        _applyOverviewChartDesign: function () {
            const oDonut = this.byId("supervisorTourDonutChart");
            const oBar = this.byId("supervisorRoadmapBarChart");
            if (oDonut) {
                oDonut.setVizProperties({ title: { visible: false }, legend: { visible: true, position: "right" } });
            }
            if (oBar) {
                oBar.setVizProperties({ title: { visible: false }, legend: { visible: false } });
            }
        },

        _loadTourStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            try {
                const oCtx = this.getView().getModel().bindContext("/getSupervisorStats(...)");
                await oCtx.execute();
                const stats = oCtx.getBoundContext().getObject() || {};
                viewModel.setProperty("/tourStats", {
                    totalTours: stats.totalTours || 0,
                    pendingTours: stats.pendingValidation || 0,
                    acceptedTours: stats.acceptedTours || 0,
                    rejectedTours: stats.rejectedTours || 0
                });
            } catch (e) {
                viewModel.setProperty("/tourStats", { totalTours: 0, pendingTours: 0, acceptedTours: 0, rejectedTours: 0 });
            }
        },

        _loadRoadmapStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            try {
                const response = await fetch("/odata/v4/route-management/Roadmaps?$select=status&$top=500");
                const data = await response.json();
                const roadmaps = data.value || [];
                const normalize = function (s) {
                    if (["DRAFT", "PENDING", "CREATED"].includes(s)) { return "CREATED"; }
                    if (["ACTIVE", "VALIDATED", "COMPLETED"].includes(s)) { return "VALIDATED"; }
                    if (["REJECTED", "CANCELLED"].includes(s)) { return "REJECTED"; }
                    return "CREATED";
                };
                viewModel.setProperty("/roadmapStats", {
                    totalRoadmaps: roadmaps.length,
                    createdRoadmaps: roadmaps.filter(function (r) { return normalize(r.status) === "CREATED"; }).length,
                    validatedRoadmaps: roadmaps.filter(function (r) { return normalize(r.status) === "VALIDATED"; }).length,
                    rejectedRoadmaps: roadmaps.filter(function (r) { return normalize(r.status) === "REJECTED"; }).length
                });
            } catch (e) {
                viewModel.setProperty("/roadmapStats", { totalRoadmaps: 0, createdRoadmaps: 0, validatedRoadmaps: 0, rejectedRoadmaps: 0 });
            }
        },

        _loadIntegrationStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            try {
                const response = await fetch(
                    "/odata/v4/route-management/Roadmaps?$filter=status eq 'VALIDATED'&$select=ID&$top=500"
                );
                const data = await response.json();
                const items = data.value || [];
                const pending = items.filter(function (r) {
                    return !r.integrationStatus || r.integrationStatus === "NOT_INTEGRATED";
                }).length;
                viewModel.setProperty("/integrationStats", { pendingCount: pending, totalValidated: items.length });
            } catch (e) {
                viewModel.setProperty("/integrationStats", { pendingCount: 0, totalValidated: 0 });
            }
        },

        _loadHistoryStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            try {
                const response = await fetch("/odata/v4/route-management/DecisionHistories?$top=500");
                const data = await response.json();
                const rows = data.value || [];
                viewModel.setProperty("/historyStats", {
                    totalDecisions: rows.length,
                    acceptedDecisions: rows.filter(function (d) {
                        return d.decision === "VALIDATED" || d.decision === "ACCEPTED";
                    }).length,
                    rejectedDecisions: rows.filter(function (d) { return d.decision === "REJECTED"; }).length
                });
            } catch (e) {
                viewModel.setProperty("/historyStats", { totalDecisions: 0, acceptedDecisions: 0, rejectedDecisions: 0 });
            }
        },

        _loadNotifications: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            const notifications = [];
            try {
                const response = await fetch("/odata/v4/route-management/Tours?$select=tourCode,zone,collectionType,status&$top=500");
                if (response.ok) {
                    const data = await response.json();
                    const pending = (data.value || []).filter(function (t) {
                        return PENDING_TOUR_STATUSES.has(t.status);
                    });
                    if (pending.length) {
                        notifications.push({
                            type: "Warning",
                            title: pending.length + " tournée(s) à valider",
                            description: "Des tournées attendent votre décision."
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            try {
                const response = await fetch("/odata/v4/route-management/Roadmaps?$select=roadmapCode,status&$top=500");
                if (response.ok) {
                    const data = await response.json();
                    const pending = (data.value || []).filter(function (r) {
                        return ["DRAFT", "PENDING", "CREATED"].includes(r.status) || r.status === "CREATED";
                    });
                    if (pending.length) {
                        notifications.push({
                            type: "Information",
                            title: pending.length + " roadmap(s) à valider",
                            description: "Des roadmaps attendent votre contrôle."
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            viewModel.setProperty("/notifications", {
                count: notifications.length,
                items: notifications,
                lastSync: new Date().toLocaleString("fr-FR")
            });
        },

        _loadToursSection: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            viewModel.setProperty("/busy", true);
            try {
                const response = await fetch(
                    "/odata/v4/route-management/Tours?$select=ID,tourCode,tourDate,status,clientName,materialName,quantity,unitOfMeasure,description,rejectionReason&$top=500"
                );
                const data = await response.json();
                const items = (data.value || []).filter(function (t) {
                    return PENDING_TOUR_STATUSES.has(t.status) || t.status === "CREATED";
                });
                viewModel.setProperty("/toursSection/items", items);
                viewModel.setProperty("/toursSection/hasSelection", false);
                viewModel.setProperty("/toursSection/selectedTour", null);
            } catch (e) {
                MessageBox.error("Impossible de charger les tournées.");
            } finally {
                viewModel.setProperty("/busy", false);
            }
        },

        _loadRoadmapsSection: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            viewModel.setProperty("/busy", true);
            try {
                const response = await fetch(
                    "/odata/v4/route-management/Roadmaps?$select=ID,roadmapCode,status,clientName,month,year&$top=500"
                );
                const data = await response.json();
                const items = (data.value || []).filter(function (r) {
                    return ["DRAFT", "PENDING", "CREATED"].includes(r.status) || r.status === "CREATED";
                });
                viewModel.setProperty("/roadmapsSection/items", items);
                viewModel.setProperty("/roadmapsSection/hasSelection", false);
                viewModel.setProperty("/roadmapsSection/selectedRoadmap", null);
            } catch (e) {
                MessageBox.error("Impossible de charger les roadmaps.");
            } finally {
                viewModel.setProperty("/busy", false);
            }
        },

        _loadIntegrationSection: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            try {
                const response = await fetch(
                    "/odata/v4/route-management/Roadmaps?$filter=status eq 'VALIDATED'&$select=ID,roadmapCode,clientName,month,year,integrationStatus,sapSalesOrderNumber&$top=500"
                );
                const data = await response.json();
                viewModel.setProperty("/integrationSection/items", data.value || []);
            } catch (e) {
                viewModel.setProperty("/integrationSection/items", []);
            }
        },

        _loadHistorySection: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            try {
                const response = await fetch(
                    "/odata/v4/route-management/DecisionHistories?$select=decision,reason,decisionDate,entityType&$orderby=decisionDate desc&$top=500"
                );
                const data = await response.json();
                viewModel.setProperty("/historySection/items", data.value || []);
            } catch (e) {
                viewModel.setProperty("/historySection/items", []);
            }
        },

        onRefreshToursSection: function () { this._loadToursSection(); },
        onRefreshRoadmapsSection: function () { this._loadRoadmapsSection(); },
        onRefreshIntegrationSection: function () { this._loadIntegrationSection(); },
        onRefreshHistorySection: function () { this._loadHistorySection(); },

        onTourSelectionChange: function () {
            const oTable = this.byId("supervisorToursTable");
            const viewModel = this.getOwnerComponent().getModel("view");
            const aSelected = oTable ? oTable.getSelectedItems() : [];
            viewModel.setProperty("/toursSection/hasSelection", aSelected.length > 0);
            viewModel.setProperty("/toursSection/selectedTour", aSelected.length ? aSelected[0].getBindingContext("view").getObject() : null);
        },

        onRoadmapSelectionChange: function () {
            const oTable = this.byId("supervisorRoadmapsTable");
            const viewModel = this.getOwnerComponent().getModel("view");
            const aSelected = oTable ? oTable.getSelectedItems() : [];
            viewModel.setProperty("/roadmapsSection/hasSelection", aSelected.length > 0);
            viewModel.setProperty("/roadmapsSection/selectedRoadmap", aSelected.length ? aSelected[0].getBindingContext("view").getObject() : null);
        },

        onViewTourDetails: function () {
            const oTour = this.getOwnerComponent().getModel("view").getProperty("/toursSection/selectedTour");
            if (!oTour) {
                return;
            }
            MessageBox.information(
                "Client : " + (oTour.clientName || "-") +
                "\nMatériau : " + (oTour.materialName || "-") +
                "\nQuantité : " + (oTour.quantity || "-") + " " + (oTour.unitOfMeasure || "") +
                "\nRemarques : " + (oTour.description || "-")
            );
        },

        onValidateSelectedTour: async function () {
            const oTour = this.getOwnerComponent().getModel("view").getProperty("/toursSection/selectedTour");
            if (!oTour) {
                return;
            }
            await this._invokeBoundAction("Tours", oTour.ID, "validate");
        },

        onRejectSelectedTour: function () {
            const oTour = this.getOwnerComponent().getModel("view").getProperty("/toursSection/selectedTour");
            if (!oTour) {
                return;
            }
            this._openRejectionDialog("TOUR", oTour.ID);
        },

        onValidateSelectedRoadmap: async function () {
            const oRoadmap = this.getOwnerComponent().getModel("view").getProperty("/roadmapsSection/selectedRoadmap");
            if (!oRoadmap) {
                return;
            }
            await this._invokeBoundAction("Roadmaps", oRoadmap.ID, "validateRoadmap");
        },

        onRejectSelectedRoadmap: function () {
            const oRoadmap = this.getOwnerComponent().getModel("view").getProperty("/roadmapsSection/selectedRoadmap");
            if (!oRoadmap) {
                return;
            }
            this._openRejectionDialog("ROADMAP", oRoadmap.ID);
        },

        _openRejectionDialog: async function (sType, sId) {
            if (!this._oRejectionDialog) {
                this._oRejectionDialog = await Fragment.load({
                    id: this.getView().getId() + "--rejection",
                    name: "sepur.supervisor.view.fragments.RejectionDialog",
                    controller: this
                });
                this.getView().addDependent(this._oRejectionDialog);
            }
            this.getOwnerComponent().getModel("view").setProperty("/rejectionDialog", {
                reason: "",
                targetType: sType,
                targetId: sId
            });
            this._oRejectionDialog.open();
        },

        onCancelRejection: function () {
            if (this._oRejectionDialog) {
                this._oRejectionDialog.close();
            }
        },

        onConfirmRejection: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            const oDialog = viewModel.getProperty("/rejectionDialog");
            const sReason = (oDialog.reason || "").trim();

            if (!sReason) {
                MessageBox.error("Le motif de rejet est obligatoire.");
                return;
            }

            if (oDialog.targetType === "TOUR") {
                await this._invokeBoundAction("Tours", oDialog.targetId, "rejectTour", { reason: sReason });
            } else {
                await this._invokeBoundAction("Roadmaps", oDialog.targetId, "rejectRoadmap", { reason: sReason });
            }

            if (this._oRejectionDialog) {
                this._oRejectionDialog.close();
            }
        },

        _invokeBoundAction: async function (sEntity, sId, sAction, oBody) {
            const viewModel = this.getOwnerComponent().getModel("view");
            viewModel.setProperty("/busy", true);
            try {
                const sUrl = "/odata/v4/route-management/" + sEntity + "(" + sId + ")/RouteManagementService." + sAction;
                const response = await fetch(sUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify(oBody || {})
                });
                const oResult = await response.json().catch(function () { return {}; });
                if (!response.ok) {
                    throw new Error(oResult.error?.message || ("HTTP " + response.status));
                }
                MessageToast.show("Décision enregistrée.");
                await this._loadDashboard();
                const sSection = viewModel.getProperty("/currentSection");
                if (sSection === "tours") { await this._loadToursSection(); }
                if (sSection === "roadmaps") { await this._loadRoadmapsSection(); }
            } catch (e) {
                MessageBox.error("Erreur : " + (e.message || ""));
            } finally {
                viewModel.setProperty("/busy", false);
            }
        },

        onOpenNotifications: async function (oEvent) {
            await this._loadNotifications();
            const viewModel = this.getOwnerComponent().getModel("view");
            const notifications = viewModel.getProperty("/notifications/items") || [];
            if (this._notificationPopover) {
                this._notificationPopover.destroy();
            }
            const content = new VBox({ width: "28rem" }).addStyleClass("notificationPopoverContent");
            if (!notifications.length) {
                content.addItem(new MessageStrip({ text: "Aucune notification.", type: "Success", showIcon: true }));
            } else {
                notifications.forEach(function (n) {
                    content.addItem(new MessageStrip({ text: n.title + " — " + n.description, type: n.type, showIcon: true }));
                });
            }
            this._notificationPopover = new Popover({ title: "Notifications", placement: "Bottom", contentWidth: "29rem", content: content });
            this.getView().addDependent(this._notificationPopover);
            this._notificationPopover.openBy(oEvent.getSource());
        },

        onRefresh: async function () {
            await this._loadDashboard();
            const sSection = this.getOwnerComponent().getModel("view").getProperty("/currentSection");
            if (sSection === "tours") { await this._loadToursSection(); }
            if (sSection === "roadmaps") { await this._loadRoadmapsSection(); }
            if (sSection === "integration") { await this._loadIntegrationSection(); }
            if (sSection === "history") { await this._loadHistorySection(); }
            if (sSection === "dashboard") {
                setTimeout(function () { this._applyOverviewChartDesign(); }.bind(this), 300);
            }
            MessageToast.show("Données synchronisées.");
        },

        onLogout: function () {
            localStorage.removeItem("sepur.user");
            window.location.href = "/login/webapp/index.html";
        }
    });
});
