sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"sepur/supervisor/supervisorroadmaps/test/integration/pages/RoadmapsList",
	"sepur/supervisor/supervisorroadmaps/test/integration/pages/RoadmapsObjectPage"
], function (JourneyRunner, RoadmapsList, RoadmapsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('sepur/supervisor/supervisorroadmaps') + '/test/flp.html#app-preview',
        pages: {
			onTheRoadmapsList: RoadmapsList,
			onTheRoadmapsObjectPage: RoadmapsObjectPage
        },
        async: true
    });

    return runner;
});

