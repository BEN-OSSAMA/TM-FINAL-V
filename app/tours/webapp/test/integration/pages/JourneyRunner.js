sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"ns/tours/test/integration/pages/ToursList",
	"ns/tours/test/integration/pages/ToursObjectPage"
], function (JourneyRunner, ToursList, ToursObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('ns/tours') + '/test/flp.html#app-preview',
        pages: {
			onTheToursList: ToursList,
			onTheToursObjectPage: ToursObjectPage
        },
        async: true
    });

    return runner;
});

