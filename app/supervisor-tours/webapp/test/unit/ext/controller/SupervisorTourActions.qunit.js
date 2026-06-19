sap.ui.define([
    "sepur/supervisor/supervisortours/ext/controller/SupervisorTourActions",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    SupervisorTourActions,
    MessageToast,
    MessageBox
) {
    "use strict";

    QUnit.module("Supervisor Tours - Actions", {
        beforeEach: function () {
            this.fnOriginalToastShow = MessageToast.show;
            this.fnOriginalWarning = MessageBox.warning;
            this.fnOriginalError = MessageBox.error;
            this.fnOriginalConfirm = MessageBox.confirm;
            this.fnOriginalSetTimeout = window.setTimeout;

            this.aToastMessages = [];
            this.aWarningMessages = [];
            this.aErrorMessages = [];
            this.aConfirmMessages = [];
            this.aTimeouts = [];

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
        },

        afterEach: function () {
            MessageToast.show = this.fnOriginalToastShow;
            MessageBox.warning = this.fnOriginalWarning;
            MessageBox.error = this.fnOriginalError;
            MessageBox.confirm = this.fnOriginalConfirm;
            window.setTimeout = this.fnOriginalSetTimeout;

            this.aToastMessages = null;
            this.aWarningMessages = null;
            this.aErrorMessages = null;
            this.aConfirmMessages = null;
            this.aTimeouts = null;
        }
    });

    function createFakeContext(sPath) {
        return {
            getPath: function () {
                return sPath || "/Tours('T1')";
            },
            getModel: function () {
                return {
                    bindContext: function () {
                        return {
                            setParameter: function () {},
                            execute: function () {
                                return Promise.resolve();
                            }
                        };
                    },
                    refresh: function () {}
                };
            }
        };
    }

    QUnit.test("Le module SupervisorTourActions doit être chargé", function (assert) {
        assert.ok(SupervisorTourActions, "Le module est chargé correctement.");
    });

    QUnit.test("Le module doit contenir les actions principales", function (assert) {
        assert.strictEqual(typeof SupervisorTourActions.onBackToDashboard, "function", "La méthode onBackToDashboard existe.");
        assert.strictEqual(typeof SupervisorTourActions.onBack, "function", "La méthode onBack existe.");
        assert.strictEqual(typeof SupervisorTourActions.onValidateTour, "function", "La méthode onValidateTour existe.");
        assert.strictEqual(typeof SupervisorTourActions.onRejectTour, "function", "La méthode onRejectTour existe.");
    });

    QUnit.test("onBackToDashboard doit afficher un message et préparer la navigation dashboard superviseur", function (assert) {
        SupervisorTourActions.onBackToDashboard();

        assert.strictEqual(
            this.aToastMessages[0],
            "Retour au dashboard superviseur...",
            "Le message Toast de retour dashboard superviseur est affiché."
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
        SupervisorTourActions.onBack();

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

    QUnit.test("onValidateTour doit afficher un avertissement si aucune tournée n'est sélectionnée", async function (assert) {
        await SupervisorTourActions.onValidateTour();

        assert.strictEqual(
            this.aWarningMessages[0],
            "Veuillez sélectionner une tournée à valider.",
            "Un avertissement est affiché si aucune tournée n'est sélectionnée."
        );
    });

    QUnit.test("onRejectTour doit afficher un avertissement si aucune tournée n'est sélectionnée", function (assert) {
        SupervisorTourActions.onRejectTour();

        assert.strictEqual(
            this.aWarningMessages[0],
            "Veuillez sélectionner une tournée à rejeter.",
            "Un avertissement est affiché si aucune tournée n'est sélectionnée."
        );
    });

    QUnit.test("onValidateTour doit ouvrir une confirmation si une tournée est sélectionnée", async function (assert) {
        var oContext = createFakeContext("/Tours('T1')");

        await SupervisorTourActions.onValidateTour(oContext);

        assert.strictEqual(
            this.aConfirmMessages[0],
            "Voulez-vous valider cette tournée ?",
            "La boîte de confirmation de validation est affichée."
        );
    });

    QUnit.test("onRejectTour doit ouvrir le dialogue de rejet si une tournée est sélectionnée", function (assert) {
        var oContext = createFakeContext("/Tours('T1')");

        SupervisorTourActions.onRejectTour(oContext);

        /*
         * Le dialogue UI5 est ouvert par le contrôleur.
         * Ici on vérifie surtout qu'aucun message d'erreur de sélection n'est affiché.
         */
        assert.strictEqual(
            this.aWarningMessages.length,
            0,
            "Aucun avertissement n'est affiché lorsque la tournée est sélectionnée."
        );
    });

    QUnit.test("onValidateTour doit accepter un contexte transmis depuis un event UI5", async function (assert) {
        var oContext = createFakeContext("/Tours('T2')");

        var oFakeEvent = {
            getSource: function () {
                return {
                    getBindingContext: function () {
                        return oContext;
                    }
                };
            }
        };

        await SupervisorTourActions.onValidateTour(oFakeEvent);

        assert.strictEqual(
            this.aConfirmMessages[0],
            "Voulez-vous valider cette tournée ?",
            "Le contexte est récupéré depuis l'événement UI5."
        );
    });

    QUnit.test("onValidateTour doit accepter une sélection sous forme de tableau", async function (assert) {
        var aContexts = [
            createFakeContext("/Tours('T3')")
        ];

        await SupervisorTourActions.onValidateTour(aContexts);

        assert.strictEqual(
            this.aConfirmMessages[0],
            "Voulez-vous valider cette tournée ?",
            "Le contexte est récupéré depuis un tableau de sélection."
        );
    });
});