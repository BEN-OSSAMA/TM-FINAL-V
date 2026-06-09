sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("sepur.planner.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            const sUser = localStorage.getItem("sepur.user");

            if (!sUser) {
                window.location.href = "/login/webapp/index.html";
                return;
            }

            try {
                const oUser = JSON.parse(sUser);

                if (!oUser.role || oUser.role !== "PLANIFICATEUR") {
                    window.location.href = "/login/webapp/index.html";
                    return;
                }

                this.setModel(new JSONModel({
                    user: oUser
                }), "session");

            } catch (e) {
                window.location.href = "/login/webapp/index.html";
            }
        }
    });
});