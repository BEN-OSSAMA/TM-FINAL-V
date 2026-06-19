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

        _normalizeStatus: function (sStatus) {
            return String(sStatus || "")
                .trim()
                .toUpperCase();
        },

        _prepareOverviewCharts: function () {
            const viewModel = this.getOwnerComponent().getModel("view");

            const t = viewModel.getProperty("/tourStats") || {};
            const r = viewModel.getProperty("/roadmapStats") || {};

            viewModel.setProperty("/tourDonutData", [
                {
                    label: "Créées",
                    value: t.pendingTours || 0
                },
                {
                    label: "Validées",
                    value: t.acceptedTours || 0
                },
                {
                    label: "Rejetées",
                    value: t.rejectedTours || 0
                }
            ]);

            viewModel.setProperty("/roadmapBarData", [
                {
                    label: "Créées",
                    value: r.createdRoadmaps || 0
                },
                {
                    label: "Validées",
                    value: r.validatedRoadmaps || 0
                },
                {
                    label: "Rejetées",
                    value: r.rejectedRoadmaps || 0
                },
                {
                    label: "Intégrées",
                    value: r.integratedRoadmaps || 0
                }
            ]);

            if (viewModel.updateBindings) {
                viewModel.updateBindings(true);
            }
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

                let created = 0;
                let validated = 0;
                let rejected = 0;
                let integrated = 0;

                roadmaps.forEach(function (roadmap) {
                    const status = String(roadmap.status || "")
                        .trim()
                        .toUpperCase();

                    const integrationStatus = String(roadmap.integrationStatus || "")
                        .trim()
                        .toUpperCase();

                    if (integrationStatus === "INTEGRATED") {
                        integrated += 1;
                        return;
                    }

                    if (
                        status === "CREATED" ||
                        status === "DRAFT" ||
                        status === "PENDING" ||
                        !status
                    ) {
                        created += 1;
                        return;
                    }

                    if (
                        status === "VALIDATED" ||
                        status === "ACTIVE" ||
                        status === "COMPLETED"
                    ) {
                        validated += 1;
                        return;
                    }

                    if (
                        status === "REJECTED" ||
                        status === "CANCELLED"
                    ) {
                        rejected += 1;
                        return;
                    }

                    created += 1;
                });

                viewModel.setProperty("/roadmapStats", {
                    totalRoadmaps: roadmaps.length,

                    createdRoadmaps: created,
                    validatedRoadmaps: validated,
                    rejectedRoadmaps: rejected,
                    integratedRoadmaps: integrated,

                    draftRoadmaps: created,
                    activeRoadmaps: validated,
                    completedRoadmaps: integrated,
                    cancelledRoadmaps: rejected
                });

                viewModel.setProperty("/roadmapBarData", [
                    {
                        label: "Créées",
                        value: created
                    },
                    {
                        label: "Validées",
                        value: validated
                    },
                    {
                        label: "Rejetées",
                        value: rejected
                    },
                    {
                        label: "Intégrées",
                        value: integrated
                    }
                ]);

                if (viewModel.updateBindings) {
                    viewModel.updateBindings(true);
                }

            } catch (e) {
                console.error(e);

                viewModel.setProperty("/roadmapStats", {
                    totalRoadmaps: 0,

                    createdRoadmaps: 0,
                    validatedRoadmaps: 0,
                    rejectedRoadmaps: 0,
                    integratedRoadmaps: 0,

                    draftRoadmaps: 0,
                    activeRoadmaps: 0,
                    completedRoadmaps: 0,
                    cancelledRoadmaps: 0
                });

                viewModel.setProperty("/roadmapBarData", [
                    {
                        label: "Créées",
                        value: 0
                    },
                    {
                        label: "Validées",
                        value: 0
                    },
                    {
                        label: "Rejetées",
                        value: 0
                    },
                    {
                        label: "Intégrées",
                        value: 0
                    }
                ]);

                if (viewModel.updateBindings) {
                    viewModel.updateBindings(true);
                }
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
                        const decision = String(d.decision || "")
                            .trim()
                            .toUpperCase();

                        return decision === "ACCEPTED" || decision === "VALIDATED";
                    }).length,
                    rejectedDecisions: rows.filter(function (d) {
                        const decision = String(d.decision || "")
                            .trim()
                            .toUpperCase();

                        return decision === "REJECTED";
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
                const toursResponse = await fetch(
                    "/odata/v4/route-management/Tours?$orderby=createdAt desc&$top=100"
                );

                if (toursResponse.ok) {
                    const toursData = await toursResponse.json();
                    const tours = toursData.value || [];

                    const toursToValidate = tours.filter(function (tour) {
                        const status = String(tour.status || "")
                            .trim()
                            .toUpperCase();

                        return status === "CREATED" ||
                            status === "DRAFT" ||
                            status === "PENDING" ||
                            !status;
                    });

                    if (toursToValidate.length > 0) {
                        notifications.push({
                            type: "Warning",
                            title: toursToValidate.length + " tournée(s) en attente de validation",
                            description: "Des tournées créées par le planificateur attendent une décision."
                        });
                    }

                    toursToValidate.slice(0, 3).forEach(function (tour) {
                        notifications.push({
                            type: "Warning",
                            title: "Tournée à valider : " + (tour.tourCode || "-"),
                            description: "Zone : " + (tour.zone || "-") + " | Type : " + (tour.collectionType || "-")
                        });
                    });
                }
            } catch (e) {
                console.error("Erreur notifications tournées", e);
            }

            try {
                const roadmapsResponse = await fetch(
                    "/odata/v4/route-management/Roadmaps?$orderby=createdAt desc&$top=100"
                );

                if (roadmapsResponse.ok) {
                    const roadmapsData = await roadmapsResponse.json();
                    const roadmaps = roadmapsData.value || [];

                    const roadmapsToValidate = roadmaps.filter(function (roadmap) {
                        const status = String(roadmap.status || "")
                            .trim()
                            .toUpperCase();

                        return status === "CREATED" ||
                            status === "DRAFT" ||
                            status === "PENDING" ||
                            !status;
                    });

                    if (roadmapsToValidate.length > 0) {
                        notifications.push({
                            type: "Information",
                            title: roadmapsToValidate.length + " feuille(s) de route à vérifier",
                            description: "Des roadmaps créées par le planificateur attendent une décision."
                        });
                    }

                    roadmapsToValidate.slice(0, 3).forEach(function (roadmap) {
                        notifications.push({
                            type: "Information",
                            title: "Roadmap à vérifier : " + (roadmap.roadmapCode || "-"),
                            description: "Statut actuel : " + (roadmap.status || "CREATED")
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
            MessageToast.show(
                "Total Sales Orders : " +
                (this.getOwnerComponent().getModel("view").getProperty("/salesOrderStats/totalSalesOrders") || 0)
            );
        },

        onSelectHistory: function () {
            const s = this.getOwnerComponent().getModel("view").getProperty("/historyStats") || {};

            MessageToast.show(
                "Décisions : " +
                (s.totalDecisions || 0) +
                " | Acceptées : " +
                (s.acceptedDecisions || 0) +
                " | Rejetées : " +
                (s.rejectedDecisions || 0)
            );
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
            localStorage.removeItem("currentUser");
            localStorage.removeItem("sepurUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("sepurUser");

            window.location.href = "/login/webapp/index.html";
        }
    });
});