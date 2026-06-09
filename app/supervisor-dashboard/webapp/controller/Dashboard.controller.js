sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/MessageStrip",
    "sap/m/Button",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format"
], function (
    Controller,
    MessageToast,
    Popover,
    VBox,
    Text,
    MessageStrip,
    Button,
    ChartFormatter,
    Format
) {
    "use strict";

    return Controller.extend("sepur.supervisor.controller.Dashboard", {

        onInit: function () {
            Format.numericFormatter(ChartFormatter.getInstance());

            this._loadDashboard();

            setTimeout(function () {
                this._applyOverviewChartDesign();
            }.bind(this), 500);

            this._notificationInterval = setInterval(function () {
                this._loadNotifications();
            }.bind(this), 30000);
        },

        onExit: function () {
            if (this._notificationInterval) {
                clearInterval(this._notificationInterval);
                this._notificationInterval = null;
            }

            if (this._notificationPopover) {
                this._notificationPopover.destroy();
                this._notificationPopover = null;
            }
        },

        _loadDashboard: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            viewModel.setProperty("/busy", true);

            try {
                await Promise.all([
                    this._loadTourStats(),
                    this._loadRoadmapStats(),
                    this._loadSalesOrderStats(),
                    this._loadHistoryStats(),
                    this._loadNotifications()
                ]);

                this._prepareOverviewCharts();

                setTimeout(function () {
                    this._applyOverviewChartDesign();
                }.bind(this), 200);

            } catch (e) {
                console.error(e);
                MessageToast.show("Impossible de charger toutes les statistiques.");
            } finally {
                viewModel.setProperty("/busy", false);
            }
        },

        _prepareOverviewCharts: function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            const t = viewModel.getProperty("/tourStats") || {};
            const r = viewModel.getProperty("/roadmapStats") || {};

            viewModel.setProperty("/tourDonutData", [
                {
                    label: "En attente",
                    value: t.pendingTours || 0
                },
                {
                    label: "Acceptées",
                    value: t.acceptedTours || 0
                },
                {
                    label: "Rejetées",
                    value: t.rejectedTours || 0
                }
            ]);

            viewModel.setProperty("/roadmapBarData", [
                {
                    label: "Brouillon",
                    value: r.draftRoadmaps || 0
                },
                {
                    label: "Active",
                    value: r.activeRoadmaps || 0
                },
                {
                    label: "Terminée",
                    value: r.completedRoadmaps || 0
                },
                {
                    label: "Annulée",
                    value: r.cancelledRoadmaps || 0
                }
            ]);
        },

        _applyOverviewChartDesign: function () {
            const oDonut = this.byId("supervisorTourDonutChart");
            const oBar = this.byId("supervisorRoadmapBarChart");

            if (oDonut) {
                oDonut.setVizProperties({
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: true,
                        position: "right"
                    },
                    plotArea: {
                        dataLabel: {
                            visible: true,
                            type: "percentage"
                        },
                        colorPalette: [
                            "#E9730C",
                            "#107E3E",
                            "#BB0000"
                        ],
                        background: {
                            color: "transparent"
                        }
                    },
                    general: {
                        background: {
                            color: "transparent"
                        }
                    }
                });
            }

            if (oBar) {
                oBar.setVizProperties({
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: false
                    },
                    valueAxis: {
                        title: {
                            visible: true,
                            text: "Nombre"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: true,
                            text: "Statut"
                        }
                    },
                    plotArea: {
                        dataLabel: {
                            visible: true
                        },
                        colorPalette: [
                            "#0A6ED1"
                        ],
                        background: {
                            color: "transparent"
                        }
                    },
                    general: {
                        background: {
                            color: "transparent"
                        }
                    }
                });
            }
        },

        _loadTourStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            try {
                const oModel = this.getView().getModel();
                const oCtx = oModel.bindContext("/getSupervisorStats(...)");

                await oCtx.execute();

                const stats = oCtx.getBoundContext().getObject() || {};

                viewModel.setProperty("/tourStats", {
                    totalTours: stats.totalTours || 0,
                    pendingTours: stats.pendingValidation || 0,
                    acceptedTours: stats.acceptedTours || 0,
                    rejectedTours: stats.rejectedTours || 0
                });

            } catch (e) {
                console.error(e);

                viewModel.setProperty("/tourStats", {
                    totalTours: 0,
                    pendingTours: 0,
                    acceptedTours: 0,
                    rejectedTours: 0
                });
            }
        },

        _loadRoadmapStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            try {
                const response = await fetch("/odata/v4/route-management/Roadmaps?$top=500");

                if (!response.ok) {
                    throw new Error("Erreur chargement roadmaps");
                }

                const data = await response.json();
                const roadmaps = data.value || [];

                const draft = roadmaps.filter(function (r) {
                    return r.status === "DRAFT" || r.status === "PENDING" || !r.status;
                }).length;

                const active = roadmaps.filter(function (r) {
                    return r.status === "ACTIVE";
                }).length;

                const completed = roadmaps.filter(function (r) {
                    return r.status === "COMPLETED";
                }).length;

                const cancelled = roadmaps.filter(function (r) {
                    return r.status === "CANCELLED" || r.status === "REJECTED";
                }).length;

                viewModel.setProperty("/roadmapStats", {
                    totalRoadmaps: roadmaps.length,
                    draftRoadmaps: draft,
                    activeRoadmaps: active,
                    completedRoadmaps: completed,
                    cancelledRoadmaps: cancelled
                });

            } catch (e) {
                console.error(e);

                viewModel.setProperty("/roadmapStats", {
                    totalRoadmaps: 0,
                    draftRoadmaps: 0,
                    activeRoadmaps: 0,
                    completedRoadmaps: 0,
                    cancelledRoadmaps: 0
                });
            }
        },

        _loadSalesOrderStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            try {
                const response = await fetch("/odata/v4/route-management/SalesOrders?$top=1&$count=true");

                if (!response.ok) {
                    viewModel.setProperty("/salesOrderStats", {
                        totalSalesOrders: 0
                    });
                    return;
                }

                const data = await response.json();

                viewModel.setProperty("/salesOrderStats", {
                    totalSalesOrders: data["@odata.count"] || 0
                });

            } catch (e) {
                console.error(e);

                viewModel.setProperty("/salesOrderStats", {
                    totalSalesOrders: 0
                });
            }
        },

        _loadHistoryStats: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            try {
                const response = await fetch("/odata/v4/route-management/DecisionHistories?$top=500");

                if (!response.ok) {
                    throw new Error("Erreur chargement historique");
                }

                const data = await response.json();
                const rows = data.value || [];

                viewModel.setProperty("/historyStats", {
                    totalDecisions: rows.length,
                    acceptedDecisions: rows.filter(function (d) {
                        return d.decision === "ACCEPTED";
                    }).length,
                    rejectedDecisions: rows.filter(function (d) {
                        return d.decision === "REJECTED";
                    }).length
                });

            } catch (e) {
                console.error(e);

                viewModel.setProperty("/historyStats", {
                    totalDecisions: 0,
                    acceptedDecisions: 0,
                    rejectedDecisions: 0
                });
            }
        },

        _loadNotifications: async function () {
            const viewModel = this.getOwnerComponent().getModel("view");
            const notifications = [];

            try {
                const pendingToursResponse = await fetch(
                    "/odata/v4/route-management/Tours?$filter=status eq 'PENDING'&$orderby=createdAt desc&$top=100"
                );

                if (pendingToursResponse.ok) {
                    const pendingToursData = await pendingToursResponse.json();
                    const pendingTours = pendingToursData.value || [];

                    if (pendingTours.length > 0) {
                        notifications.push({
                            type: "Warning",
                            title: pendingTours.length + " tournée(s) en attente de validation",
                            description: "Des tournées créées ou soumises par le planificateur attendent une décision."
                        });
                    }

                    pendingTours.slice(0, 3).forEach(function (tour) {
                        notifications.push({
                            type: "Warning",
                            title: "Tournée à valider : " + (tour.tourCode || "-"),
                            description: "Zone : " + (tour.zone || "-") + " | Type : " + (tour.collectionType || "-")
                        });
                    });
                }
            } catch (e) {
                console.error("Erreur notifications tournées PENDING", e);
            }

            try {
                const roadmapsResponse = await fetch(
                    "/odata/v4/route-management/Roadmaps?$orderby=createdAt desc&$top=100"
                );

                if (roadmapsResponse.ok) {
                    const roadmapsData = await roadmapsResponse.json();
                    const roadmaps = roadmapsData.value || [];

                    const roadmapsToValidate = roadmaps.filter(function (roadmap) {
                        return roadmap.status === "DRAFT" ||
                            roadmap.status === "PENDING" ||
                            !roadmap.status;
                    });

                    if (roadmapsToValidate.length > 0) {
                        notifications.push({
                            type: "Information",
                            title: roadmapsToValidate.length + " roadmap(s) à vérifier",
                            description: "Des roadmaps sont en brouillon ou en attente de validation."
                        });
                    }

                    roadmapsToValidate.slice(0, 3).forEach(function (roadmap) {
                        notifications.push({
                            type: "Information",
                            title: "Roadmap à vérifier : " + (roadmap.roadmapCode || "-"),
                            description: "Statut actuel : " + (roadmap.status || "DRAFT")
                        });
                    });
                }
            } catch (e) {
                console.error("Erreur notifications roadmaps", e);
            }

            viewModel.setProperty("/notifications", {
                count: notifications.length,
                items: notifications,
                lastSync: new Date().toLocaleString("fr-FR")
            });
        },

        onOpenNotifications: async function (oEvent) {
            await this._loadNotifications();

            const viewModel = this.getOwnerComponent().getModel("view");
            const notifications = viewModel.getProperty("/notifications/items") || [];
            const lastSync = viewModel.getProperty("/notifications/lastSync") || "-";

            if (this._notificationPopover) {
                this._notificationPopover.destroy();
                this._notificationPopover = null;
            }

            const content = new VBox({
                width: "28rem",
                class: "notificationPopoverContent"
            });

            content.addItem(new Text({
                text: "Dernière synchronisation : " + lastSync,
                class: "notificationSyncText"
            }));

            if (!notifications.length) {
                content.addItem(new MessageStrip({
                    text: "Aucune notification pour le moment.",
                    type: "Success",
                    showIcon: true
                }));
            } else {
                notifications.forEach(function (notification) {
                    content.addItem(new MessageStrip({
                        text: notification.title + " — " + notification.description,
                        type: notification.type,
                        showIcon: true,
                        class: "notificationItem"
                    }));
                });
            }

            content.addItem(new Button({
                text: "Actualiser les notifications",
                icon: "sap-icon://refresh",
                width: "100%",
                class: "sapUiSmallMarginTop",
                press: async function () {
                    await this._loadNotifications();
                    MessageToast.show("Notifications synchronisées avec la base de données.");
                    this._notificationPopover.close();
                }.bind(this)
            }));

            this._notificationPopover = new Popover({
                title: "Notifications",
                placement: "Bottom",
                contentWidth: "29rem",
                content: content
            });

            this.getView().addDependent(this._notificationPopover);
            this._notificationPopover.openBy(oEvent.getSource());
        },

        onSelectSalesOrders: function () {
            MessageToast.show("Total Sales Orders : " + (this.getOwnerComponent().getModel("view").getProperty("/salesOrderStats/totalSalesOrders") || 0));
        },

        onSelectHistory: function () {
            const s = this.getOwnerComponent().getModel("view").getProperty("/historyStats") || {};
            MessageToast.show("Décisions : " + (s.totalDecisions || 0) + " | Acceptées : " + (s.acceptedDecisions || 0) + " | Rejetées : " + (s.rejectedDecisions || 0));
        },

        onDashboard: function () {
            this._loadDashboard();
        },

        onRefresh: async function () {
            await this._loadDashboard();
            MessageToast.show("Statistiques actualisées.");
        },

        onOpenTours: function () {
            window.location.href = "/supervisor-tours/webapp/index.html";
        },

        onOpenRoadmaps: function () {
            window.location.href = "/supervisor-roadmaps/webapp/index.html";
        },

        onLogout: function () {
            localStorage.removeItem("sepur.user");
            window.location.href = "/login/webapp/index.html";
        }
    });
});