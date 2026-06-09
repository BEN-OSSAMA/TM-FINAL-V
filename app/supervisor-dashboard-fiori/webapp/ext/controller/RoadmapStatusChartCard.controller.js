sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("sepur.supervisor.supervisordashboardfiori.ext.controller.RoadmapStatusChartCard", {
    onInit: function () {
      this.getView().setModel(new JSONModel({
        items: []
      }), "chart");

      this._loadData();
    },

    _loadData: async function () {
      try {
        const response = await fetch("/odata/v4/route-management/RoadmapStatusAnalytics");
        const data = await response.json();

        const items = (data.value || []).map(function (item) {
          return {
            status: item.status,
            total: Number(item.total || 0)
          };
        });

        this.getView().getModel("chart").setProperty("/items", items);
        this._configureChart();
      } catch (error) {
        console.error("Erreur chargement RoadmapStatusAnalytics", error);
      }
    },

    _configureChart: function () {
      const chart = this.byId("roadmapStatusChart");

      if (!chart) {
        return;
      }

      chart.setVizProperties({
        plotArea: {
          dataLabel: {
            visible: true,
            type: "percentage"
          },
          colorPalette: [
            "#E9730C",
            "#107E3E",
            "#BB0000"
          ]
        },
        title: {
          visible: false
        },
        legend: {
          visible: true
        }
      });
    }
  });
});