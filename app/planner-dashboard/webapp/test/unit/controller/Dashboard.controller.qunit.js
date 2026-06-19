sap.ui.define([
    "sepur/planner/controller/Dashboard.controller",
    "sap/ui/model/json/JSONModel"
], function (DashboardController, JSONModel) {
    "use strict";

    QUnit.module("Planner Dashboard Controller", {
        beforeEach: function () {
            localStorage.removeItem("sepur.user");
            localStorage.removeItem("sepur.planner.readNotifications");

            this.oController = new DashboardController();

            this.oModel = new JSONModel({
                stats: {},
                tourChartData: [],
                roadmapChartData: [],
                notifications: {
                    unreadCount: 0,
                    totalCount: 0,
                    items: [],
                    lastSync: "-"
                }
            });

            this.oController.getView = function () {
                return {
                    getModel: function () {
                        return this.oModel;
                    }.bind(this),
                    setModel: function (oModel) {
                        this.oModel = oModel;
                    }.bind(this),
                    addDependent: function () {}
                };
            }.bind(this);

            this.oController.byId = function () {
                return null;
            };
        },

        afterEach: function () {
            localStorage.removeItem("sepur.user");
            localStorage.removeItem("sepur.planner.readNotifications");

            if (this.oController && this.oController.onExit) {
                this.oController.onExit();
            }

            this.oController = null;
            this.oModel = null;
        }
    });

    QUnit.test("Le contrôleur Planner Dashboard doit être chargé", function (assert) {
        assert.ok(DashboardController, "Le contrôleur Planner Dashboard est chargé correctement.");
    });

    QUnit.test("Le contrôleur doit contenir les méthodes principales", function (assert) {
        assert.strictEqual(typeof DashboardController.prototype.onInit, "function", "La méthode onInit existe.");
        assert.strictEqual(typeof DashboardController.prototype.onExit, "function", "La méthode onExit existe.");
        assert.strictEqual(typeof DashboardController.prototype.loadDashboardData, "function", "La méthode loadDashboardData existe.");
        assert.strictEqual(typeof DashboardController.prototype._loadTours, "function", "La méthode _loadTours existe.");
        assert.strictEqual(typeof DashboardController.prototype._loadRoadmaps, "function", "La méthode _loadRoadmaps existe.");
        assert.strictEqual(typeof DashboardController.prototype._calculateStatistics, "function", "La méthode _calculateStatistics existe.");
        assert.strictEqual(typeof DashboardController.prototype._buildNotifications, "function", "La méthode _buildNotifications existe.");
    });

    QUnit.test("getInitials doit retourner les initiales correctes", function (assert) {
        assert.strictEqual(this.oController.getInitials("Planificateur SEPUR"), "PS", "Les initiales PS sont retournées.");
        assert.strictEqual(this.oController.getInitials("Jean Dupont"), "JD", "Les initiales JD sont retournées.");
        assert.strictEqual(this.oController.getInitials("Planner"), "P", "Une seule initiale est retournée.");
        assert.strictEqual(this.oController.getInitials(""), "PL", "La valeur par défaut PL est retournée.");
        assert.strictEqual(this.oController.getInitials(null), "PL", "La valeur par défaut PL est retournée si le nom est nul.");
    });

    QUnit.test("normalizeStatus doit regrouper les statuts métier correctement", function (assert) {
        assert.strictEqual(this.oController.normalizeStatus("DRAFT"), "CREATED", "DRAFT devient CREATED.");
        assert.strictEqual(this.oController.normalizeStatus("PENDING"), "CREATED", "PENDING devient CREATED.");
        assert.strictEqual(this.oController.normalizeStatus("CREATED"), "CREATED", "CREATED reste CREATED.");

        assert.strictEqual(this.oController.normalizeStatus("ACCEPTED"), "VALIDATED", "ACCEPTED devient VALIDATED.");
        assert.strictEqual(this.oController.normalizeStatus("VALIDATED"), "VALIDATED", "VALIDATED reste VALIDATED.");
        assert.strictEqual(this.oController.normalizeStatus("ACTIVE"), "VALIDATED", "ACTIVE devient VALIDATED.");
        assert.strictEqual(this.oController.normalizeStatus("COMPLETED"), "VALIDATED", "COMPLETED devient VALIDATED.");

        assert.strictEqual(this.oController.normalizeStatus("REJECTED"), "REJECTED", "REJECTED reste REJECTED.");
        assert.strictEqual(this.oController.normalizeStatus("CANCELLED"), "REJECTED", "CANCELLED devient REJECTED.");

        assert.strictEqual(this.oController.normalizeStatus("UNKNOWN"), "CREATED", "Un statut inconnu devient CREATED.");
    });

    QUnit.test("_calculateStatistics doit calculer les statistiques des tournées et roadmaps", function (assert) {
        var aTours = [
            { status: "CREATED" },
            { status: "PENDING" },
            { status: "VALIDATED" },
            { status: "ACCEPTED" },
            { status: "REJECTED" }
        ];

        var aRoadmaps = [
            { status: "CREATED" },
            { status: "VALIDATED" },
            { status: "COMPLETED" },
            { status: "REJECTED" }
        ];

        this.oController._calculateStatistics(aTours, aRoadmaps);

        var oStats = this.oModel.getProperty("/stats");
        var aTourChartData = this.oModel.getProperty("/tourChartData");
        var aRoadmapChartData = this.oModel.getProperty("/roadmapChartData");

        assert.strictEqual(oStats.totalTours, 5, "Le total des tournées est correct.");
        assert.strictEqual(oStats.createdTours, 2, "Les tournées créées sont correctes.");
        assert.strictEqual(oStats.validatedTours, 2, "Les tournées validées sont correctes.");
        assert.strictEqual(oStats.rejectedTours, 1, "Les tournées rejetées sont correctes.");

        assert.strictEqual(oStats.totalRoadmaps, 4, "Le total des roadmaps est correct.");
        assert.strictEqual(oStats.createdRoadmaps, 1, "Les roadmaps créées sont correctes.");
        assert.strictEqual(oStats.validatedRoadmaps, 2, "Les roadmaps validées sont correctes.");
        assert.strictEqual(oStats.rejectedRoadmaps, 1, "Les roadmaps rejetées sont correctes.");

        assert.deepEqual(aTourChartData, [
            { status: "Créées", total: 2 },
            { status: "Validées", total: 2 },
            { status: "Rejetées", total: 1 }
        ], "Les données du chart tournées sont correctes.");

        assert.deepEqual(aRoadmapChartData, [
            { status: "Créées", total: 1 },
            { status: "Validées", total: 2 },
            { status: "Rejetées", total: 1 }
        ], "Les données du chart roadmaps sont correctes.");
    });

    QUnit.test("_getReadNotificationIds doit retourner une liste vide si aucune notification n'est lue", function (assert) {
        var aIds = this.oController._getReadNotificationIds();

        assert.deepEqual(aIds, [], "Aucune notification lue n'est trouvée.");
    });

    QUnit.test("_setReadNotificationIds doit stocker les notifications lues", function (assert) {
        this.oController._setReadNotificationIds(["N1", "N2"]);

        var aIds = JSON.parse(localStorage.getItem("sepur.planner.readNotifications"));

        assert.deepEqual(aIds, ["N1", "N2"], "Les identifiants sont bien stockés dans localStorage.");
    });

    QUnit.test("_buildNotifications doit créer les notifications pour les éléments validés et rejetés", function (assert) {
        this.oController._updateNotificationButtonState = function () {};

        var aTours = [
            {
                ID: "T1",
                tourCode: "TOUR-001",
                clientName: "Client A",
                zone: "Paris",
                status: "VALIDATED"
            },
            {
                ID: "T2",
                tourCode: "TOUR-002",
                clientName: "Client B",
                zone: "Lyon",
                status: "REJECTED"
            },
            {
                ID: "T3",
                tourCode: "TOUR-003",
                clientName: "Client C",
                zone: "Nice",
                status: "CREATED"
            }
        ];

        var aRoadmaps = [
            {
                ID: "R1",
                roadmapCode: "RM-001",
                tourCode: "TOUR-001",
                status: "VALIDATED"
            },
            {
                ID: "R2",
                roadmapCode: "RM-002",
                tourCode: "TOUR-002",
                status: "REJECTED"
            },
            {
                ID: "R3",
                roadmapCode: "RM-003",
                tourCode: "TOUR-003",
                status: "CREATED"
            }
        ];

        this.oController._buildNotifications(aTours, aRoadmaps);

        var oNotifications = this.oModel.getProperty("/notifications");

        assert.strictEqual(oNotifications.totalCount, 4, "Quatre notifications sont générées.");
        assert.strictEqual(oNotifications.unreadCount, 4, "Les notifications sont non lues.");
        assert.strictEqual(oNotifications.items[0].title, "Tournée validée", "La notification de tournée validée est correcte.");
        assert.strictEqual(oNotifications.items[1].title, "Tournée rejetée", "La notification de tournée rejetée est correcte.");
        assert.strictEqual(oNotifications.items[2].title, "Roadmap validée", "La notification de roadmap validée est correcte.");
        assert.strictEqual(oNotifications.items[3].title, "Roadmap rejetée", "La notification de roadmap rejetée est correcte.");
    });

    QUnit.test("_markCurrentNotificationsAsRead doit marquer toutes les notifications comme lues", function (assert) {
        this.oController._updateNotificationButtonState = function () {};

        this.oModel.setProperty("/notifications", {
            unreadCount: 2,
            totalCount: 2,
            items: [
                {
                    id: "N1",
                    unread: true
                },
                {
                    id: "N2",
                    unread: true
                }
            ],
            lastSync: "-"
        });

        this.oController._markCurrentNotificationsAsRead();

        var oNotifications = this.oModel.getProperty("/notifications");
        var aReadIds = JSON.parse(localStorage.getItem("sepur.planner.readNotifications"));

        assert.strictEqual(oNotifications.unreadCount, 0, "Le nombre de notifications non lues est remis à zéro.");
        assert.strictEqual(oNotifications.items[0].unread, false, "La première notification est lue.");
        assert.strictEqual(oNotifications.items[1].unread, false, "La deuxième notification est lue.");
        assert.deepEqual(aReadIds, ["N1", "N2"], "Les notifications lues sont stockées.");
    });

    QUnit.test("Le contrôleur doit contenir les méthodes de navigation", function (assert) {
        assert.strictEqual(typeof DashboardController.prototype.onRefresh, "function", "La méthode onRefresh existe.");
        assert.strictEqual(typeof DashboardController.prototype.onCreateTour, "function", "La méthode onCreateTour existe.");
        assert.strictEqual(typeof DashboardController.prototype.onOpenTours, "function", "La méthode onOpenTours existe.");
        assert.strictEqual(typeof DashboardController.prototype.onOpenRoadmaps, "function", "La méthode onOpenRoadmaps existe.");
        assert.strictEqual(typeof DashboardController.prototype.onOpenRejectedTours, "function", "La méthode onOpenRejectedTours existe.");
        assert.strictEqual(typeof DashboardController.prototype.onOpenHome, "function", "La méthode onOpenHome existe.");
        assert.strictEqual(typeof DashboardController.prototype.onLogout, "function", "La méthode onLogout existe.");
        assert.strictEqual(typeof DashboardController.prototype.onOpenNotifications, "function", "La méthode onOpenNotifications existe.");
        assert.strictEqual(typeof DashboardController.prototype.onMarkAllNotificationsRead, "function", "La méthode onMarkAllNotificationsRead existe.");
    });
});