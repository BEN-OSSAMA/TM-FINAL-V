sap.ui.define([
    "ns/roadmaps/ext/controller/RoadmapActions",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    RoadmapActions,
    MessageToast,
    MessageBox
) {
    "use strict";

    QUnit.module("Roadmaps - RoadmapActions", {
        beforeEach: function () {
            this.fnOriginalToastShow = MessageToast.show;
            this.fnOriginalWarning = MessageBox.warning;
            this.fnOriginalError = MessageBox.error;
            this.fnOriginalConfirm = MessageBox.confirm;
            this.fnOriginalSetTimeout = window.setTimeout;
            this.fnOriginalOpen = window.open;

            this.aToastMessages = [];
            this.aWarningMessages = [];
            this.aErrorMessages = [];
            this.aConfirmMessages = [];
            this.aTimeouts = [];
            this.oOpenedWindow = null;

            MessageToast.show = function (sMessage) {
                this.aToastMessages.push(sMessage);
            }.bind(this);

            MessageBox.warning = function (sMessage) {
                this.aWarningMessages.push(sMessage);
            }.bind(this);

            MessageBox.error = function (sMessage) {
                this.aErrorMessages.push(sMessage);
            }.bind(this);

            MessageBox.confirm = function (sMessage, oOptions) {
                this.aConfirmMessages.push(sMessage);

                if (oOptions && typeof oOptions.onClose === "function") {
                    oOptions.onClose(MessageBox.Action.CANCEL);
                }
            }.bind(this);

            window.setTimeout = function (fnCallback, iDelay) {
                this.aTimeouts.push({
                    callback: fnCallback,
                    delay: iDelay
                });

                return 1;
            }.bind(this);

            window.open = function () {
                this.oOpenedWindow = {
                    document: {
                        open: function () {},
                        write: function () {},
                        close: function () {}
                    }
                };

                return this.oOpenedWindow;
            }.bind(this);
        },

        afterEach: function () {
            MessageToast.show = this.fnOriginalToastShow;
            MessageBox.warning = this.fnOriginalWarning;
            MessageBox.error = this.fnOriginalError;
            MessageBox.confirm = this.fnOriginalConfirm;
            window.setTimeout = this.fnOriginalSetTimeout;
            window.open = this.fnOriginalOpen;

            this.aToastMessages = null;
            this.aWarningMessages = null;
            this.aErrorMessages = null;
            this.aConfirmMessages = null;
            this.aTimeouts = null;
            this.oOpenedWindow = null;
        }
    });

    QUnit.test("Le module RoadmapActions doit être chargé", function (assert) {
        assert.ok(RoadmapActions, "Le module est chargé correctement.");
    });

    QUnit.test("Le module doit contenir les actions principales", function (assert) {
        assert.strictEqual(typeof RoadmapActions.onBackToDashboard, "function", "La méthode onBackToDashboard existe.");
        assert.strictEqual(typeof RoadmapActions.onBack, "function", "La méthode onBack existe.");
        assert.strictEqual(typeof RoadmapActions.onAutoAssignTours, "function", "La méthode onAutoAssignTours existe.");
        assert.strictEqual(typeof RoadmapActions.onGenerateRoadmapSheet, "function", "La méthode onGenerateRoadmapSheet existe.");
    });

    QUnit.test("onBackToDashboard doit afficher un message et préparer la navigation dashboard", function (assert) {
        RoadmapActions.onBackToDashboard();

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
            "Le délai de navigation est de 300 ms."
        );
    });

    QUnit.test("onBack doit afficher un message et préparer le retour navigateur", function (assert) {
        RoadmapActions.onBack();

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

    QUnit.test("onAutoAssignTours doit afficher un avertissement si aucune roadmap n'est trouvée", function (assert) {
        RoadmapActions.onAutoAssignTours();

        assert.strictEqual(
            this.aWarningMessages[0],
            "Roadmap introuvable.",
            "Un message d'avertissement est affiché si aucun contexte n'est fourni."
        );
    });

    QUnit.test("onGenerateRoadmapSheet doit afficher un avertissement si aucune roadmap n'est trouvée", async function (assert) {
        await RoadmapActions.onGenerateRoadmapSheet();

        assert.strictEqual(
            this.aWarningMessages[0],
            "Roadmap introuvable.",
            "Un message d'avertissement est affiché si aucun contexte n'est fourni."
        );
    });

    QUnit.test("onAutoAssignTours doit ouvrir une confirmation si un contexte roadmap existe", function (assert) {
        var oFakeContext = {
            getPath: function () {
                return "/Roadmaps('RM1')";
            },
            getModel: function () {
                return {};
            }
        };

        RoadmapActions.onAutoAssignTours(oFakeContext);

        assert.strictEqual(
            this.aConfirmMessages[0],
            "Voulez-vous affecter automatiquement les tournées du même client et du même mois ?",
            "La boîte de confirmation est affichée."
        );
    });

    QUnit.test("onGenerateRoadmapSheet doit appeler l'action de génération avec un contexte valide", async function (assert) {
        assert.expect(4);

        var bExecuteCalled = false;
        var sBindAction = "";

        var oFakeAction = {
            execute: function () {
                bExecuteCalled = true;
                return Promise.resolve();
            },
            getBoundContext: function () {
                return {
                    getObject: function () {
                        return {
                            value: "<html><body>Feuille de route</body></html>"
                        };
                    }
                };
            }
        };

        var oFakeModel = {
            bindContext: function (sActionName) {
                sBindAction = sActionName;
                return oFakeAction;
            }
        };

        var oFakeContext = {
            getPath: function () {
                return "/Roadmaps('RM1')";
            },
            getModel: function () {
                return oFakeModel;
            }
        };

        await RoadmapActions.onGenerateRoadmapSheet(oFakeContext);

        assert.strictEqual(
            sBindAction,
            "RouteManagementService.generateRoadmapSheetHtml(...)",
            "L'action CAP de génération est appelée."
        );

        assert.strictEqual(
            bExecuteCalled,
            true,
            "L'action est exécutée."
        );

        assert.ok(
            this.oOpenedWindow,
            "Une nouvelle fenêtre est préparée pour afficher la feuille de route."
        );

        assert.strictEqual(
            this.aWarningMessages.length,
            0,
            "Aucun avertissement n'est affiché."
        );
    });
});