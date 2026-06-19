sap.ui.define([
    "ns/tours/ext/controller/ListReportActions",
    "sap/m/MessageToast"
], function (ListReportActions, MessageToast) {
    "use strict";

    QUnit.module("Tours - ListReportActions", {
        beforeEach: function () {
            this.fnOriginalToastShow = MessageToast.show;
            this.fnOriginalSetTimeout = window.setTimeout;

            this.aToastMessages = [];
            this.aTimeouts = [];

            MessageToast.show = function (sMessage) {
                this.aToastMessages.push(sMessage);
            }.bind(this);

            window.setTimeout = function (fnCallback, iDelay) {
                this.aTimeouts.push({
                    callback: fnCallback,
                    delay: iDelay
                });

                return 1;
            }.bind(this);
        },

        afterEach: function () {
            MessageToast.show = this.fnOriginalToastShow;
            window.setTimeout = this.fnOriginalSetTimeout;

            this.aToastMessages = null;
            this.aTimeouts = null;
        }
    });

    QUnit.test("Le module ListReportActions doit être chargé", function (assert) {
        assert.ok(ListReportActions, "Le module est chargé correctement.");
    });

    QUnit.test("Le module doit contenir les actions principales", function (assert) {
        assert.strictEqual(typeof ListReportActions.onBackToDashboard, "function", "La méthode onBackToDashboard existe.");
        assert.strictEqual(typeof ListReportActions.onBack, "function", "La méthode onBack existe.");
    });

    QUnit.test("onBackToDashboard doit afficher un message et préparer la navigation dashboard", function (assert) {
        ListReportActions.onBackToDashboard();

        assert.strictEqual(
            this.aToastMessages[0],
            "Retour au dashboard...",
            "Le message Toast de retour dashboard est affiché."
        );

        assert.strictEqual(
            this.aTimeouts.length,
            1,
            "Une navigation différée est préparée."
        );

        assert.strictEqual(
            this.aTimeouts[0].delay,
            300,
            "Le délai de navigation dashboard est de 300 ms."
        );
    });

    QUnit.test("onBack doit afficher un message et préparer le retour navigateur", function (assert) {
        ListReportActions.onBack();

        assert.strictEqual(
            this.aToastMessages[0],
            "Retour...",
            "Le message Toast de retour est affiché."
        );

        assert.strictEqual(
            this.aTimeouts.length,
            1,
            "Un retour différé est préparé."
        );

        assert.strictEqual(
            this.aTimeouts[0].delay,
            200,
            "Le délai de retour est de 200 ms."
        );
    });
});