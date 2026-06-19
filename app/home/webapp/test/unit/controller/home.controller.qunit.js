sap.ui.define([
    "home/controller/home.controller"
], function (HomeController) {
    "use strict";

    QUnit.module("Home Controller", {
        beforeEach: function () {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("sepurUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("sepurUser");

            this.oController = new HomeController();
        },

        afterEach: function () {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("sepurUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("sepurUser");

            this.oController = null;
        }
    });

    QUnit.test("Le contrôleur Home doit être chargé", function (assert) {
        assert.ok(HomeController, "Le contrôleur Home est chargé correctement.");
    });

    QUnit.test("Le contrôleur doit contenir les méthodes principales", function (assert) {
        assert.strictEqual(typeof HomeController.prototype.onInit, "function", "La méthode onInit existe.");
        assert.strictEqual(typeof HomeController.prototype._initHomeModel, "function", "La méthode _initHomeModel existe.");
        assert.strictEqual(typeof HomeController.prototype._getCurrentUser, "function", "La méthode _getCurrentUser existe.");
        assert.strictEqual(typeof HomeController.prototype._normalizeRole, "function", "La méthode _normalizeRole existe.");
        assert.strictEqual(typeof HomeController.prototype._openProtectedService, "function", "La méthode _openProtectedService existe.");
    });

    QUnit.test("La normalisation des rôles doit retourner une valeur en majuscule", function (assert) {
        assert.strictEqual(this.oController._normalizeRole("planificateur"), "PLANIFICATEUR", "Le rôle planificateur est normalisé.");
        assert.strictEqual(this.oController._normalizeRole(" superviseur "), "SUPERVISEUR", "Le rôle superviseur est normalisé.");
        assert.strictEqual(this.oController._normalizeRole("admin"), "ADMIN", "Le rôle admin est normalisé.");
        assert.strictEqual(this.oController._normalizeRole(null), "", "Une valeur vide retourne une chaîne vide.");
    });

    QUnit.test("Aucun utilisateur ne doit être détecté si le stockage est vide", function (assert) {
        var oUser = this.oController._getCurrentUser();

        assert.strictEqual(oUser, null, "Aucun utilisateur connecté n'est trouvé.");
        assert.strictEqual(this.oController._isLoggedIn(), false, "L'utilisateur n'est pas connecté.");
    });

    QUnit.test("Un planificateur stocké dans localStorage doit être reconnu", function (assert) {
        localStorage.setItem("currentUser", JSON.stringify({
            username: "planner",
            fullName: "Planificateur SEPUR",
            role: "PLANIFICATEUR"
        }));

        var oUser = this.oController._getCurrentUser();

        assert.ok(oUser, "L'utilisateur est récupéré depuis localStorage.");
        assert.strictEqual(oUser.username, "planner", "Le username est correct.");
        assert.strictEqual(this.oController._isLoggedIn(), true, "L'utilisateur est connecté.");
        assert.strictEqual(this.oController._isPlanner(), true, "L'utilisateur est reconnu comme planificateur.");
        assert.strictEqual(this.oController._isSupervisor(), false, "L'utilisateur n'est pas superviseur.");
    });

    QUnit.test("Un superviseur stocké dans sessionStorage doit être reconnu", function (assert) {
        sessionStorage.setItem("currentUser", JSON.stringify({
            username: "supervisor",
            fullName: "Superviseur SEPUR",
            role: "SUPERVISEUR"
        }));

        var oUser = this.oController._getCurrentUser();

        assert.ok(oUser, "L'utilisateur est récupéré depuis sessionStorage.");
        assert.strictEqual(oUser.username, "supervisor", "Le username est correct.");
        assert.strictEqual(this.oController._isLoggedIn(), true, "L'utilisateur est connecté.");
        assert.strictEqual(this.oController._isSupervisor(), true, "L'utilisateur est reconnu comme superviseur.");
        assert.strictEqual(this.oController._isPlanner(), false, "L'utilisateur n'est pas planificateur.");
    });

    QUnit.test("Un administrateur doit avoir accès aux rôles planificateur et superviseur", function (assert) {
        localStorage.setItem("currentUser", JSON.stringify({
            username: "admin",
            fullName: "Administrateur",
            role: "ADMIN"
        }));

        assert.strictEqual(this.oController._isPlanner(), true, "L'administrateur est autorisé côté planification.");
        assert.strictEqual(this.oController._isSupervisor(), true, "L'administrateur est autorisé côté supervision.");
    });

    QUnit.test("Le contrôleur doit contenir les méthodes de navigation", function (assert) {
        assert.strictEqual(typeof HomeController.prototype.onLogin, "function", "La méthode onLogin existe.");
        assert.strictEqual(typeof HomeController.prototype.onLogout, "function", "La méthode onLogout existe.");
        assert.strictEqual(typeof HomeController.prototype.onOpenPlanning, "function", "La méthode onOpenPlanning existe.");
        assert.strictEqual(typeof HomeController.prototype.onTours, "function", "La méthode onTours existe.");
        assert.strictEqual(typeof HomeController.prototype.onRoadmaps, "function", "La méthode onRoadmaps existe.");
        assert.strictEqual(typeof HomeController.prototype.onOpenSupervisor, "function", "La méthode onOpenSupervisor existe.");
        assert.strictEqual(typeof HomeController.prototype.onSupervisorTours, "function", "La méthode onSupervisorTours existe.");
        assert.strictEqual(typeof HomeController.prototype.onSupervisorRoadmaps, "function", "La méthode onSupervisorRoadmaps existe.");
        assert.strictEqual(typeof HomeController.prototype.onOpenAppMenu, "function", "La méthode onOpenAppMenu existe.");
        assert.strictEqual(typeof HomeController.prototype.onProfileMenu, "function", "La méthode onProfileMenu existe.");
    });
});