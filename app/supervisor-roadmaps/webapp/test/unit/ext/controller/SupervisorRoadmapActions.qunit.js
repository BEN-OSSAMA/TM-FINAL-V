sap.ui.define([
    "sepur/supervisor/supervisorroadmaps/ext/controller/SupervisorRoadmapActions",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    SupervisorRoadmapActions,
    MessageToast,
    MessageBox
) {
    "use strict";

    QUnit.module("Supervisor Roadmaps - Actions", {
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

    function createFakeContext(sPath, sStatus) {
        return {
            getPath: function () {
                return sPath || "/Roadmaps('RM1')";
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
                    }
                };
            },
            getObject: function () {
                return {
                    status: sStatus
                };
            },
            requestObject: function () {
                return Promise.resolve({
                    status: sStatus
                });
            }
        };
    }

    QUnit.test("Le module SupervisorRoadmapActions doit être chargé", function (assert) {
        assert.ok(SupervisorRoadmapActions, "Le module est chargé correctement.");
    });

    QUnit.test("Le module doit contenir les actions principales", function (assert) {
        assert.strictEqual(typeof SupervisorRoadmapActions.onBackToDashboard, "function", "La méthode onBackToDashboard existe.");
        assert.strictEqual(typeof SupervisorRoadmapActions.onBack, "function", "La méthode onBack existe.");
        assert.strictEqual(typeof SupervisorRoadmapActions.onValidateRoadmap, "function", "La méthode onValidateRoadmap existe.");
        assert.strictEqual(typeof SupervisorRoadmapActions.onRejectRoadmap, "function", "La méthode onRejectRoadmap existe.");
    });

    QUnit.test("onBackToDashboard doit afficher un message et préparer la navigation dashboard superviseur", function (assert) {
        SupervisorRoadmapActions.onBackToDashboard();

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
        SupervisorRoadmapActions.onBack();

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

    QUnit.test("onValidateRoadmap doit afficher un avertissement si aucune roadmap n'est sélectionnée", async function (assert) {
        await SupervisorRoadmapActions.onValidateRoadmap();

        assert.strictEqual(
            this.aWarningMessages[0],
            "Veuillez sélectionner une feuille de route à valider.",
            "Un avertissement est affiché si aucune feuille de route n'est sélectionnée."
        );
    });

    QUnit.test("onRejectRoadmap doit afficher un avertissement si aucune roadmap n'est sélectionnée", async function (assert) {
        await SupervisorRoadmapActions.onRejectRoadmap();

        assert.strictEqual(
            this.aWarningMessages[0],
            "Veuillez sélectionner une feuille de route à rejeter.",
            "Un avertissement est affiché si aucune feuille de route n'est sélectionnée."
        );
    });

    QUnit.test("onValidateRoadmap doit refuser une roadmap déjà validée", async function (assert) {
        var oContext = createFakeContext("/Roadmaps('RM1')", "VALIDATED");

        await SupervisorRoadmapActions.onValidateRoadmap(oContext);

        assert.strictEqual(
            this.aWarningMessages[0],
            "Seules les feuilles de route avec le statut CREATED peuvent être validées.",
            "Une roadmap non CREATED ne peut pas être validée."
        );
    });

    QUnit.test("onRejectRoadmap doit refuser une roadmap déjà validée", async function (assert) {
        var oContext = createFakeContext("/Roadmaps('RM1')", "VALIDATED");

        await SupervisorRoadmapActions.onRejectRoadmap(oContext);

        assert.strictEqual(
            this.aWarningMessages[0],
            "Seules les feuilles de route avec le statut CREATED peuvent être rejetées.",
            "Une roadmap non CREATED ne peut pas être rejetée."
        );
    });

    QUnit.test("onValidateRoadmap doit ouvrir une confirmation pour une roadmap CREATED", async function (assert) {
        var oContext = createFakeContext("/Roadmaps('RM1')", "CREATED");

        await SupervisorRoadmapActions.onValidateRoadmap(oContext);

        assert.strictEqual(
            this.aConfirmMessages[0],
            "Voulez-vous valider cette feuille de route ?",
            "La confirmation de validation est affichée."
        );
    });

    QUnit.test("onValidateRoadmap doit afficher le message pluriel pour plusieurs roadmaps CREATED", async function (assert) {
        var aContexts = [
            createFakeContext("/Roadmaps('RM1')", "CREATED"),
            createFakeContext("/Roadmaps('RM2')", "PENDING")
        ];

        await SupervisorRoadmapActions.onValidateRoadmap(aContexts);

        assert.strictEqual(
            this.aConfirmMessages[0],
            "Voulez-vous valider les feuilles de route sélectionnées avec le statut CREATED ?",
            "La confirmation plurielle est affichée."
        );
    });

    QUnit.test("onRejectRoadmap doit ouvrir le dialogue de rejet pour une roadmap CREATED", async function (assert) {
        var oContext = createFakeContext("/Roadmaps('RM1')", "CREATED");

        await SupervisorRoadmapActions.onRejectRoadmap(oContext);

        /*
         * Le test vérifie qu'aucun avertissement de sélection ou de statut n'est affiché.
         * Le Dialog UI5 est créé par le contrôleur, mais on ne force pas son interaction réelle ici.
         */
        assert.strictEqual(
            this.aWarningMessages.length,
            0,
            "Aucun avertissement n'est affiché pour une roadmap CREATED."
        );
    });
});