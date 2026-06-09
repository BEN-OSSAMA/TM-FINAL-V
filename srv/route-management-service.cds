using { route.management as db } from '../db/schema';

service RouteManagementService {

    /* ===================================================== */
    /* ENTITIES                                              */
    /* ===================================================== */

    entity Users as projection on db.Users;

    entity Clients as projection on db.Clients;

    entity Vehicles as projection on db.Vehicles;

    entity Drivers as projection on db.Drivers;

    entity CollectionPoints as projection on db.CollectionPoints;

    entity Materials as projection on db.Materials;

    @cds.redirection.target
    entity HumanResources as projection on db.HumanResources;

    @cds.redirection.target
    entity MaterialResources as projection on db.MaterialResources;

    @readonly
    entity AvailableHumanResources as projection on db.AvailableHumanResources;

    @readonly
    entity AvailableMaterialResources as projection on db.AvailableMaterialResources;

    entity TourCollectionPoints as projection on db.TourCollectionPoints;

    entity TourHumanResources as projection on db.TourHumanResources {
        *,
        humanResource.fullName as humanResourceName : String,
        driver.lastName        as driverLastName      : String
    };

    entity TourMaterialResources as projection on db.TourMaterialResources {
        *,
        materialResource.name              as materialResourceName : String,
        vehicle.registrationNumber         as vehicleRegistration  : String
    };

    @odata.draft.enabled
    @cds.redirection.target: true
    entity Tours as projection on db.Tours {
        *,
        tourCode                     as tourNumber          : String,
        tourDate                     as collectionDate      : Date,
        client.name                  as clientName          : String,
        material.description         as materialName        : String,
        material.materialCode        as materialCode        : String,
        vehicle.registrationNumber   as vehicleRegistration : String,
        driver.firstName             as driverFirstName     : String,
        driver.lastName              as driverLastName      : String,
        createdByUser.fullName       as createdByName       : String,

        virtual statusCriticality    : Integer,
        virtual canValidate          : Boolean,
        virtual canReject            : Boolean,
        virtual humanResourcesLabel  : String,
        virtual materialResourcesLabel : String
    }
    actions {
        action validate() returns Tours;
        action reject(reason : String) returns Tours;
    };

    @odata.draft.enabled
    @cds.redirection.target: true
    entity Roadmaps as projection on db.Roadmaps {
        *,
        tour.tourCode                   as tourCode                 : String,
        tour.tourDate                   as tourDate                 : Date,
        tour.zone                       as tourZone                 : String,
        tour.collectionType             as tourCollectionType       : String,
        tour.client.name                as tourClientName           : String,
        tour.driver.firstName           as tourDriverFirstName      : String,
        tour.driver.lastName            as tourDriverLastName       : String,
        tour.vehicle.registrationNumber as tourVehicleRegistration  : String,

        virtual statusCriticality       : Integer,
        virtual canValidate             : Boolean,
        virtual canReject               : Boolean
    }
    actions {
        action validateRoadmap() returns Roadmaps;
        action rejectRoadmap(reason : String) returns Roadmaps;
    };

    entity RoadmapTours as projection on db.RoadmapTours {
        *,
        roadmap.roadmapCode             as roadmapCode         : String,
        tour.tourCode                   as tourCode            : String,
        tour.tourDate                   as tourDate            : Date,
        tour.zone                       as tourZone            : String,
        tour.collectionType             as tourCollectionType  : String,
        tour.client.name                as clientName          : String,
        tour.driver.firstName           as driverFirstName     : String,
        tour.driver.lastName            as driverLastName      : String,
        tour.vehicle.registrationNumber as vehicleRegistration : String
    }
    actions {
        action updateResources(
            clientID  : UUID,
            driverID  : UUID,
            vehicleID : UUID
        ) returns RoadmapTours;
    };

    entity RoadmapSteps as projection on db.RoadmapSteps;

    entity DecisionHistories as projection on db.DecisionHistories;

    @readonly
    @Aggregation.ApplySupported: {
        Transformations: [
            'aggregate',
            'groupby',
            'filter',
            'search'
        ],
        GroupableProperties: [
            status
        ],
        AggregatableProperties: [
            {
                Property: total
            }
        ]
    }
    entity TourStatusAnalytics as projection on db.TourStatusAnalytics;

    @readonly
    @Aggregation.ApplySupported: {
        Transformations: [
            'aggregate',
            'groupby',
            'filter',
            'search'
        ],
        GroupableProperties: [
            status
        ],
        AggregatableProperties: [
            {
                Property: total
            }
        ]
    }
    entity RoadmapStatusAnalytics as projection on db.RoadmapStatusAnalytics;

    /* ===================================================== */
    /* TYPES                                                 */
    /* ===================================================== */

    type LoginResult {
        ID       : UUID;
        email    : String;
        username : String;
        fullName : String;
        role     : String;
        active   : Boolean;
    }

    type PlannerStats {
        totalTours    : Integer;
        draftTours    : Integer;
        pendingTours  : Integer;
        acceptedTours : Integer;
        rejectedTours : Integer;
        totalRoadmaps : Integer;
    }

    type SupervisorStats {
        totalTours         : Integer;
        pendingValidation  : Integer;
        acceptedTours      : Integer;
        rejectedTours      : Integer;
        activeRoadmaps     : Integer;
        totalRoadmaps      : Integer;
    }

    type TourDetails {
        tourID              : UUID;
        tourCode            : String;
        tourDate            : Date;
        zone                : String;
        collectionType      : String;
        description         : LargeString;
        status              : String;
        rejectionReason     : LargeString;
        clientName          : String;
        vehicleRegistration : String;
        driverName          : String;
        roadmapCode         : String;
        roadmapStatus       : String;
        decisionsCount      : Integer;
        tourPointsCount     : Integer;
    }

    /* ===================================================== */
    /* ACTIONS & FUNCTIONS                                   */
    /* ===================================================== */

    action login(email : String, username : String, password : String) returns LoginResult;

    action submitTour(tourID : UUID) returns Tours;

    action acceptTour(tourID : UUID, supervisorID : UUID) returns Tours;

    action rejectTour(tourID : UUID, supervisorID : UUID, reason : String) returns Tours;

    action createRoadmapFromTour(tourID : UUID) returns Roadmaps;

    function getPlannerStats(userID : UUID) returns PlannerStats;

    function getSupervisorStats() returns SupervisorStats;

    function getPendingTours() returns many Tours;

    function getTourDetails(tourID : UUID) returns TourDetails;
}

/* ===================================================== */
/* VALUE HELPS                                           */
/* ===================================================== */

annotate RouteManagementService.Tours with {
    client @Common.ValueList : {
        CollectionPath : 'Clients',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : client_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'code'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'city'
            }
        ]
    };

    vehicle @Common.ValueList : {
        CollectionPath : 'Vehicles',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : vehicle_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'registrationNumber'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'type'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'capacity'
            }
        ]
    };

    driver @Common.ValueList : {
        CollectionPath : 'Drivers',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : driver_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'firstName'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'lastName'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'phone'
            }
        ]
    };
};

annotate RouteManagementService.Roadmaps with {
    tour @Common.ValueList : {
        CollectionPath : 'Tours',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : tour_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'tourCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'tourDate'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'zone'
            }
        ]
    };
};

/* ===================================================== */
/* TOURS ANNOTATIONS                                     */
/* ===================================================== */

annotate RouteManagementService.Tours with @(
    UI.HeaderInfo : {
        TypeName       : 'Tournée',
        TypeNamePlural : 'Tournées',
        Title          : {
            Value : tourCode
        },
        Description    : {
            Value : status
        }
    },

    UI.SelectionFields : [
        tourCode,
        tourDate,
        zone,
        collectionType,
        client_ID,
        vehicle_ID,
        driver_ID,
        status
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code tournée',
            Value : tourCode,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date',
            Value : tourDate,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Zone',
            Value : zone
        },
        {
            $Type : 'UI.DataField',
            Label : 'Type de collecte',
            Value : collectionType
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : clientName,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Véhicule',
            Value : vehicleRegistration
        },
        {
            $Type : 'UI.DataField',
            Label : 'Chauffeur',
            Value : driverLastName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status,
            Criticality : statusCriticality,
            CriticalityRepresentation : #WithIcon,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Motif de rejet',
            Value : rejectionReason
        }
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataField',
            Label : 'Code tournée',
            Value : tourCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date',
            Value : tourDate
        },
        {
            $Type : 'UI.DataField',
            Label : 'Zone',
            Value : zone
        },
        {
            $Type : 'UI.DataField',
            Label : 'Type de collecte',
            Value : collectionType
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : client_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Véhicule',
            Value : vehicle_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Chauffeur',
            Value : driver_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status,
            Criticality : statusCriticality,
            CriticalityRepresentation : #WithIcon
        },
        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : description
        },
        {
            $Type : 'UI.DataField',
            Label : 'Motif de rejet',
            Value : rejectionReason
        }
    ],

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : 'Informations générales',
            Target : '@UI.FieldGroup#General'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : 'Ressources',
            Target : '@UI.FieldGroup#Resources'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : 'Suivi',
            Target : '@UI.FieldGroup#Tracking'
        }
    ],

    UI.FieldGroup #General : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Code tournée',
                Value : tourCode
            },
            {
                $Type : 'UI.DataField',
                Label : 'Date',
                Value : tourDate
            },
            {
                $Type : 'UI.DataField',
                Label : 'Zone',
                Value : zone
            },
            {
                $Type : 'UI.DataField',
                Label : 'Type de collecte',
                Value : collectionType
            },
            {
                $Type : 'UI.DataField',
                Label : 'Client',
                Value : client_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Description',
                Value : description
            }
        ]
    },

    UI.FieldGroup #Resources : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Véhicule',
                Value : vehicle_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Chauffeur',
                Value : driver_ID
            }
        ]
    },

    UI.FieldGroup #Tracking : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Statut',
                Value : status,
                Criticality : statusCriticality,
                CriticalityRepresentation : #WithIcon
            },
            {
                $Type : 'UI.DataField',
                Label : 'Motif de rejet',
                Value : rejectionReason
            },
            {
                $Type : 'UI.DataField',
                Label : 'Créé par',
                Value : createdByName
            },
            {
                $Type : 'UI.DataField',
                Label : 'Dernière modification',
                Value : updatedAt
            }
        ]
    }
);

/* ===================================================== */
/* ROADMAPS ANNOTATIONS                                  */
/* ===================================================== */

annotate RouteManagementService.Roadmaps with @(
    UI.HeaderInfo : {
        TypeName       : 'Roadmap',
        TypeNamePlural : 'Roadmaps',
        Title          : {
            Value : roadmapCode
        },
        Description    : {
            Value : status
        }
    },

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code roadmap',
            Value : roadmapCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date début',
            Value : startDate
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date fin',
            Value : endDate
        },
        {
            $Type : 'UI.DataField',
            Label : 'Tournée',
            Value : tourCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status,
            Criticality : statusCriticality,
            CriticalityRepresentation : #WithIcon
        }
    ]
);