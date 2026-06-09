sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
  "use strict";

  return Controller.extend("sepur.home.controller.home", {
    onInit: function () {
      const sUser = localStorage.getItem("sepur.user");
      let role = "SUPERVISEUR";
      let fullName = "Utilisateur SEPUR";

      if (sUser) {
        try {
          const oUser = JSON.parse(sUser);
          role = oUser.role || role;
          fullName = oUser.fullName || fullName;
        } catch (e) {
          // ignore invalid local storage payload
        }
      }

      const isSupervisor = role === "SUPERVISEUR";
      const isPlanner = role === "PLANIFICATEUR";

      const tiles = [];

      if (isSupervisor) {
        tiles.push(
          {
            title: "Dashboard Superviseur",
            subTitle: "Vue globale et statistiques",
            icon: "sap-icon://business-objects-experience",
            target: "/supervisor-dashboard/webapp/index.html"
          }
        );
      }

      if (isPlanner) {
        tiles.push(
          {
            title: "Dashboard Planificateur",
            subTitle: "Suivi des tournées et roadmaps",
            icon: "sap-icon://manager-insight",
            target: "/planner-dashboard/webapp/index.html"
          }
        );
      }

      tiles.push(
        {
          title: "Master Data",
          subTitle: "Clients, véhicules et chauffeurs",
          icon: "sap-icon://database",
          target: "#"
        },
        {
          title: "Settings and Configuration",
          subTitle: "Paramètres de l'application",
          icon: "sap-icon://action-settings",
          target: "#"
        }
      );

      const oModel = new JSONModel({
        title: isSupervisor ? "SEPUR Supervision Overview" : "SEPUR Planning Overview",
        roleLabel: isSupervisor ? "SUPERVISEUR" : "PLANIFICATEUR",
        welcomeTitle: "Bienvenue " + fullName,
        welcomeSubtitle: isSupervisor
          ? "Accédez rapidement aux dashboards, aux tournées à valider et aux roadmaps à contrôler."
          : "Accédez rapidement à la création des tournées, au suivi des roadmaps et au dashboard de planification.",
        initials: isSupervisor ? "SS" : "PL",
        tiles: tiles
      });

      this.getView().setModel(oModel, "home");
    },

    onTilePress: function (oEvent) {
      const target = oEvent.getSource().data("target");

      if (!target || target === "#") {
        MessageToast.show("Module en cours de préparation.");
        return;
      }

      window.location.href = target;
    },

    onLogout: function () {
      localStorage.removeItem("sepur.user");
      sessionStorage.clear();
      window.location.href = "/login/webapp/index.html";
    }
  });
});