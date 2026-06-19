sap.ui.define([
    "sepur/supervisor/controller/Dashboard.controller"
], function (DashboardController) {
    "use strict";

    QUnit.module("Dashboard Supervisor Controller");

    QUnit.test("Le contrôleur Dashboard doit être chargé", function (assert) {
        assert.ok(DashboardController, "Le contrôleur est chargé correctement.");
    });

    QUnit.test("Le contrôleur doit contenir la méthode onInit", function (assert) {
        assert.strictEqual(
            typeof DashboardController.prototype.onInit,
            "function",
            "La méthode onInit existe."
        );
    });

    QUnit.test("Le contrôleur doit contenir la méthode _loadDashboard", function (assert) {
        assert.strictEqual(
            typeof DashboardController.prototype._loadDashboard,
            "function",
            "La méthode _loadDashboard existe."
        );
    });

    QUnit.test("Le contrôleur doit contenir la méthode _loadRoadmapStats", function (assert) {
        assert.strictEqual(
            typeof DashboardController.prototype._loadRoadmapStats,
            "function",
            "La méthode _loadRoadmapStats existe."
        );
    });

    QUnit.test("Le contrôleur doit contenir les méthodes de navigation", function (assert) {
        assert.strictEqual(
            typeof DashboardController.prototype.onOpenTours,
            "function",
            "La méthode onOpenTours existe."
        );

        assert.strictEqual(
            typeof DashboardController.prototype.onOpenRoadmaps,
            "function",
            "La méthode onOpenRoadmaps existe."
        );

        assert.strictEqual(
            typeof DashboardController.prototype.onLogout,
            "function",
            "La méthode onLogout existe."
        );
    });
});