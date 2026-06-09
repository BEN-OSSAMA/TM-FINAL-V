sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("sepur.supervisor.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            const raw = localStorage.getItem("sepur.user");

            if (!raw) {
                window.location.href = "/login/webapp/index.html";
                return;
            }

            const user = JSON.parse(raw);

            if (user.role !== "SUPERVISEUR") {
                window.location.href = "/login/webapp/index.html";
                return;
            }

            this.setModel(new JSONModel({
                busy: false,

                user: user,
                userInitials: this._getInitials(user.fullName),

                tourStats: {
                    totalTours: 0,
                    pendingTours: 0,
                    acceptedTours: 0,
                    rejectedTours: 0
                },

                roadmapStats: {
                    totalRoadmaps: 0,
                    draftRoadmaps: 0,
                    activeRoadmaps: 0,
                    completedRoadmaps: 0,
                    cancelledRoadmaps: 0
                },

                integrationStats: {
                    pendingCount: 0,
                    totalValidated: 0
                },

                salesOrderStats: {
                    totalSalesOrders: 0
                },

                historyStats: {
                    totalDecisions: 0,
                    acceptedDecisions: 0,
                    rejectedDecisions: 0
                },

                tourDonutData: [],
                roadmapBarData: [],

                notifications: {
                    count: 0,
                    items: [],
                    lastSync: "-"
                }
            }), "view");
        },

        _getInitials: function (name) {
            if (!name) {
                return "SU";
            }

            return name
                .split(" ")
                .map(function (part) {
                    return part.charAt(0);
                })
                .join("")
                .substring(0, 2)
                .toUpperCase();
        }
    });
});