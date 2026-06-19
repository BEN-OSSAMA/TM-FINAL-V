sap.ui.define([
    "sepur/login/controller/Login.controller",
    "sap/ui/model/json/JSONModel"
], function (LoginController, JSONModel) {
    "use strict";

    QUnit.module("Login Controller", {
        beforeEach: function () {
            localStorage.removeItem("sepur.user");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("sepurUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("sepurUser");

            this.oController = new LoginController();
        },

        afterEach: function () {
            localStorage.removeItem("sepur.user");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("sepurUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("sepurUser");

            this.oController = null;
        }
    });

    QUnit.test("Le contrôleur Login doit être chargé", function (assert) {
        assert.ok(LoginController, "Le contrôleur Login est chargé correctement.");
    });

    QUnit.test("Le contrôleur doit contenir les méthodes principales", function (assert) {
        assert.strictEqual(typeof LoginController.prototype.onInit, "function", "La méthode onInit existe.");
        assert.strictEqual(typeof LoginController.prototype.onLogin, "function", "La méthode onLogin existe.");
        assert.strictEqual(typeof LoginController.prototype.onForgotPassword, "function", "La méthode onForgotPassword existe.");
        assert.strictEqual(typeof LoginController.prototype.onTogglePasswordVisibility, "function", "La méthode onTogglePasswordVisibility existe.");
    });

    QUnit.test("onInit doit initialiser le modèle avec username et password vides", function (assert) {
        var oModel = null;

        this.oController.getView = function () {
            return {
                setModel: function (model) {
                    oModel = model;
                }
            };
        };

        this.oController.onInit();

        assert.ok(oModel, "Le modèle JSON est créé.");
        assert.ok(oModel instanceof JSONModel, "Le modèle est bien un JSONModel.");
        assert.deepEqual(
            oModel.getData(),
            {
                username: "",
                password: ""
            },
            "Le modèle contient username et password vides."
        );
    });

    QUnit.test("onLogin doit afficher une erreur si username ou password est vide", async function (assert) {
        assert.expect(3);

        var bVisible = false;
        var sMessage = "";

        this.oController.getView = function () {
            return {
                getModel: function () {
                    return {
                        getData: function () {
                            return {
                                username: "",
                                password: ""
                            };
                        }
                    };
                }
            };
        };

        this.oController.byId = function (sId) {
            assert.strictEqual(sId, "msgError", "Le MessageStrip d'erreur est récupéré.");

            return {
                setVisible: function (value) {
                    bVisible = value;
                },
                setText: function (value) {
                    sMessage = value;
                }
            };
        };

        await this.oController.onLogin();

        assert.strictEqual(bVisible, true, "Le message d'erreur est visible.");
        assert.strictEqual(
            sMessage,
            "Veuillez saisir l'adresse e-mail et le mot de passe.",
            "Le message d'erreur est correct."
        );
    });

    QUnit.test("onLogin doit appeler l'action CAP login avec username en minuscule", async function (assert) {
        assert.expect(7);

        var sUsernameParam = "";
        var sPasswordParam = "";

        var oFakeContext = {
            setParameter: function (sKey, sValue) {
                if (sKey === "username") {
                    sUsernameParam = sValue;
                }

                if (sKey === "password") {
                    sPasswordParam = sValue;
                }
            },
            execute: function () {
                return Promise.resolve();
            },
            getBoundContext: function () {
                return {
                    getObject: function () {
                        return {
                            active: true,
                            username: "planner",
                            fullName: "Planificateur SEPUR",
                            role: "PLANIFICATEUR"
                        };
                    }
                };
            }
        };

        this.oController.getView = function () {
            return {
                getModel: function () {
                    return {
                        getData: function () {
                            return {
                                username: "PLANNER@SEPUR.COM",
                                password: "1234"
                            };
                        }
                    };
                }
            };
        };

        this.oController.byId = function () {
            return {
                setVisible: function () {},
                setText: function () {}
            };
        };

        this.oController.getOwnerComponent = function () {
            return {
                getModel: function () {
                    return {
                        bindContext: function (sAction) {
                            assert.strictEqual(sAction, "/login(...)", "L'action CAP login est appelée.");
                            return oFakeContext;
                        }
                    };
                }
            };
        };

        var sOldHref = window.location.href;

        try {
            await this.oController.onLogin();
        } catch (e) {
            /*
             * La redirection peut être bloquée dans QUnit selon le navigateur.
             * Le test reste centré sur la logique de login.
             */
        }

        assert.strictEqual(sUsernameParam, "planner@sepur.com", "Le username est converti en minuscule.");
        assert.strictEqual(sPasswordParam, "1234", "Le mot de passe est transmis.");
        assert.ok(localStorage.getItem("sepur.user"), "L'utilisateur est stocké dans sepur.user.");

        var oStoredUser = JSON.parse(localStorage.getItem("sepur.user"));

        assert.strictEqual(oStoredUser.fullName, "Planificateur SEPUR", "Le nom complet est stocké.");
        assert.strictEqual(oStoredUser.role, "PLANIFICATEUR", "Le rôle est stocké.");
        assert.ok(sOldHref, "La page courante existe avant redirection.");
    });

    QUnit.test("onTogglePasswordVisibility doit passer de Password à Text", function (assert) {
        var sType = "Password";
        var sIcon = "";

        this.oController.byId = function (sId) {
            assert.strictEqual(sId, "inpPassword", "Le champ mot de passe est récupéré.");

            return {
                getType: function () {
                    return sType;
                },
                setType: function (value) {
                    sType = value;
                },
                setValueHelpIconSrc: function (value) {
                    sIcon = value;
                }
            };
        };

        this.oController.onTogglePasswordVisibility();

        assert.strictEqual(sType, "Text", "Le type devient Text.");
        assert.strictEqual(sIcon, "sap-icon://hide", "L'icône devient hide.");
    });

    QUnit.test("onTogglePasswordVisibility doit repasser de Text à Password", function (assert) {
        var sType = "Text";
        var sIcon = "";

        this.oController.byId = function (sId) {
            assert.strictEqual(sId, "inpPassword", "Le champ mot de passe est récupéré.");

            return {
                getType: function () {
                    return sType;
                },
                setType: function (value) {
                    sType = value;
                },
                setValueHelpIconSrc: function (value) {
                    sIcon = value;
                }
            };
        };

        this.oController.onTogglePasswordVisibility();

        assert.strictEqual(sType, "Password", "Le type redevient Password.");
        assert.strictEqual(sIcon, "sap-icon://show", "L'icône devient show.");
    });
});