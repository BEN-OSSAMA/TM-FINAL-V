sap.ui.define([
    "home/controller/App.controller"
], function (AppController) {
    "use strict";

    QUnit.module("App Controller");

    QUnit.test("Le contrôleur App doit être chargé", function (assert) {
        assert.ok(AppController, "Le contrôleur App est chargé correctement.");
    });

    QUnit.test("Le contrôleur App doit contenir la méthode onInit", function (assert) {
        assert.strictEqual(
            typeof AppController.prototype.onInit,
            "function",
            "La méthode onInit existe."
        );
    });
});