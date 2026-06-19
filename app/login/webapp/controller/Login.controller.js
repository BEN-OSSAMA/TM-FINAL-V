sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("sepur.login.controller.Login", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                username: "",
                password: ""
            }));
        },

        onLogin: async function () {
            const oData = this.getView().getModel().getData();
            // const sUser = (oData.username || "").trim();
            const sUser = (oData.username || "").trim().toLowerCase();
            const sPass = oData.password || "";
            const oStrip = this.byId("msgError");

            oStrip.setVisible(false);

            if (!sUser || !sPass) {
                oStrip.setText("Veuillez saisir l'adresse e-mail et le mot de passe.");
                oStrip.setVisible(true);
                return;
            }

            try {
                const oModel = this.getOwnerComponent().getModel();
                const oContext = oModel.bindContext("/login(...)");

                oContext.setParameter("username", sUser);
                oContext.setParameter("password", sPass);

                await oContext.execute();

                const oResult = oContext.getBoundContext().getObject();

                if (!oResult || !oResult.active) {
                    throw new Error("Utilisateur inactif ou introuvable.");
                }

                localStorage.setItem("sepur.user", JSON.stringify(oResult));
                localStorage.setItem("currentUser", JSON.stringify(oResult));
                localStorage.setItem("sepurUser", JSON.stringify(oResult));
                
                MessageToast.show("Bienvenue " + oResult.fullName);

                if (oResult.role === "PLANIFICATEUR") {
                    window.location.href = "/planner-dashboard/webapp/index.html";
                    return;
                }

                if (oResult.role === "SUPERVISEUR") {
                    window.location.href = "/supervisor-dashboard/webapp/index.html";
                    return;
                }

                throw new Error("Rôle utilisateur non reconnu.");

            } catch (e) {
                oStrip.setText(e.message || "Échec de la connexion. Vérifiez vos identifiants.");
                oStrip.setVisible(true);
            }
        },

        onForgotPassword: function () {
            MessageBox.information(
                "Cette option sera disponible après l'intégration de SAP BTP XSUAA.",
                {
                    title: "Mot de passe oublié"
                }
            );
        },

        onTogglePasswordVisibility: function () {
            const oInput = this.byId("inpPassword");
            const sType = oInput.getType();

            if (sType === "Password") {
                oInput.setType("Text");
                oInput.setValueHelpIconSrc("sap-icon://hide");
            } else {
                oInput.setType("Password");
                oInput.setValueHelpIconSrc("sap-icon://show");
            }
        }
    });
});