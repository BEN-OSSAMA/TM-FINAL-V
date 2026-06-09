sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"sepur/supervisor/supervisortours/test/integration/pages/ToursList",
	"sepur/supervisor/supervisortours/test/integration/pages/ToursObjectPage"
], function (JourneyRunner, ToursList, ToursObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('sepur/supervisor/supervisortours') + '/test/flp.html#app-preview',
        pages: {
			onTheToursList: ToursList,
			onTheToursObjectPage: ToursObjectPage
        },
        async: true
    });

    return runner;
});

