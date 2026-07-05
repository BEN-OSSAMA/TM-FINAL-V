using { route.management as db } from '../db/schema';

service RouteManagementService {

    /* ===================================================== */
    /* ENTITIES                                              */
    /* ===================================================== */

    entity Users as projection on db.Users;

    entity Clients as projection on db.Clients;

    entity Vehicles as projection on db.Vehicles;

entity Drivers as projection on db.Drivers;

entity HumanResources as projection on db.HumanResources;

entity MaterialResources as projection on db.MaterialResources;

entity CollectionPoints as projection on db.CollectionPoints;

entity TourCollectionPoints as projection on db.TourCollectionPoints;

entity TourHumanResources as projection on db.TourHumanResources;

entity TourMaterialResources as projection on db.TourMaterialResources;

entity Materials as projection on db.Materials;

    entity Units as projection on db.Units;

entity Months as projection on db.Months;

entity Years as projection on db.Years;
    @readonly
    @cds.persistence.skip
    entity TourStatusVH {
        key code : String(20);
        label    : String(50);
    }
@readonly
@cds.persistence.skip
entity RoadmapStatusVH {
    key code : String(20);
    label    : String(50);
}

@readonly
@cds.persistence.skip
entity IntegrationStatusVH {
    key code : String(20);
    label    : String(50);
}

    @odata.draft.enabled
    @cds.redirection.target: true
    entity Tours as projection on db.Tours {
        *,
        client.name                  as clientName          : String,
        vehicle.registrationNumber   as vehicleRegistration : String,
        driver.firstName             as driverFirstName     : String,
        driver.lastName              as driverLastName      : String,
        createdByUser.fullName       as createdByName       : String,

        virtual statusCriticality    : Integer,
        virtual canValidate          : Boolean,
        virtual canReject            : Boolean
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
    action autoAssignTours() returns Roadmaps;
    action generateRoadmapSheetHtml() returns LargeString;
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
    tourCode @Core.Computed;
    tourNumber @Core.Computed;
    status @Core.Computed;
    rejectionReason @Core.Computed;
    status @Common.ValueList : {
        CollectionPath : 'TourStatusVH',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : status,
                ValueListProperty : 'code'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'label'
            }
        ]
    };

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
                ValueListProperty : 'customerCode'
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

    collectionType @Common.ValueList : {
        CollectionPath : 'Materials',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : collectionType,
                ValueListProperty : 'description'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'materialCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'unitOfMeasure'
            }
        ]
    };

    collectionType @Common.ValueListWithFixedValues : true;

    material @Common.ValueList : {
        CollectionPath : 'Materials',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : material_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'materialCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'unitOfMeasure'
            }
        ]
    };

    unitOfMeasure @Common.ValueList : {
        CollectionPath : 'Units',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : unitOfMeasure,
                ValueListProperty : 'code'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'label'
            }
        ]
    };

    unitOfMeasure @Common.ValueListWithFixedValues : true;

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
    // {
    //     $Type  : 'UI.ReferenceFacet',
    //     Label  : 'Ressources',
    //     Target : '@UI.FieldGroup#Resources'
    // },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : 'Ressources humaines affectées',
        Target : 'humanResources/@UI.LineItem'
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : 'Ressources matérielles affectées',
        Target : 'materialResources/@UI.LineItem'
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
            Label : 'N° tournée',
            Value : tourCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Zone de collecte',
            Value : zone
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantité à collecter',
            Value : quantity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : client_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date de collecte',
            Value : tourDate
        },
        {
    $Type : 'UI.DataField',
    Label : 'Matériau / Type de déchet',
    Value : collectionType
},
        {
            $Type : 'UI.DataField',
            Label : 'Unité',
            Value : unitOfMeasure
        },
        {
            $Type : 'UI.DataField',
            Label : 'Remarques',
            Value : description
        }
    ]
},

    // UI.FieldGroup #Resources : {
    //     Data : [
    //         {
    //             $Type : 'UI.DataField',
    //             Label : 'Véhicule',
    //             Value : vehicle_ID
    //         },
    //         {
    //             $Type : 'UI.DataField',
    //             Label : 'Chauffeur',
    //             Value : driver_ID
    //         }
    //     ]
    // },

    UI.FieldGroup #Tracking : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Statut',
                Value : status
                // Criticality : statusCriticality,
                // CriticalityRepresentation : #WithIcon
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

annotate RouteManagementService.Roadmaps with {
    roadmapCode @Core.Computed;
    roadmapNumber @Core.Computed;
    status @Core.Computed;
    integrationStatus @Core.Computed;
    sapSalesOrder @Core.Computed;
    rejectionReason @Core.Computed;

    roadmapCode @title : 'N° feuille de route';
    startDate   @title : 'Date';

        status @Common.ValueList : {
        CollectionPath : 'RoadmapStatusVH',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : status,
                ValueListProperty : 'code'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'label'
            }
        ]
    };

    status @Common.ValueListWithFixedValues : true;

    integrationStatus @Common.ValueList : {
        CollectionPath : 'IntegrationStatusVH',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : integrationStatus,
                ValueListProperty : 'code'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'label'
            }
        ]
    };

    integrationStatus @Common.ValueListWithFixedValues : true;

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
                ValueListProperty : 'customerCode'
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

    month @Common.ValueList : {
        CollectionPath : 'Months',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : month,
                ValueListProperty : 'code'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name'
            }
        ]
    };

    month @Common.ValueListWithFixedValues : true;

    year @Common.ValueList : {
        CollectionPath : 'Years',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : year,
                ValueListProperty : 'value'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'label'
            }
        ]
    };

    year @Common.ValueListWithFixedValues : true;
};

annotate RouteManagementService.Roadmaps with @(
    UI.HeaderInfo : {
        TypeName       : 'Feuille de route',
        TypeNamePlural : 'Management des feuilles de route',
        Title          : {
            Value : roadmapCode
        },
        Description    : {
            Value : status
        }
    },

    UI.SelectionFields : [
    roadmapCode,
    client_ID,
    startDate,
    status,
    integrationStatus
],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'N° feuille de route',
            Value : roadmapCode,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : client.name,
            ![@UI.Importance] : #High
        },
        {
    $Type : 'UI.DataField',
    Label : 'Date / période',
    Value : startDate
    
},
{
    $Type : 'UI.DataField',
    Label : 'Date / période',
    Value : Date
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
            Label : 'Statut intégration',
            Value : integrationStatus
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
            Label  : 'Tournées affectées',
            Target : 'assignedTours/@UI.LineItem'
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
                Label : 'N° feuille de route',
                Value : roadmapCode
            },
            {
                $Type : 'UI.DataField',
                Label : 'Client',
                Value : client_ID
            },
            {
            $Type : 'UI.DataField',
            Label : 'Date de période',
            Value : startDate
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
                Label : 'Statut intégration',
                Value : integrationStatus
            },
            {
                $Type : 'UI.DataField',
                Label : 'Commande SAP',
                Value : sapSalesOrder
            },
            {
                $Type : 'UI.DataField',
                Label : 'Motif de rejet',
                Value : rejectionReason
            }
        ]
    }
);

annotate RouteManagementService.RoadmapTours with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Séquence',
            Value : sequence
        },
        {
            $Type : 'UI.DataField',
            Label : 'N° tournée',
            Value : tourCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date de collecte',
            Value : tourDate
        },
        {
            $Type : 'UI.DataField',
            Label : 'Matériau / Type de déchet',
            Value : tourCollectionType
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : clientName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Remarque',
            Value : note
        }
    ]
);
annotate RouteManagementService.RoadmapTours with {
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
                ValueListProperty : 'collectionType'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'clientName'
            }
        ]
    };
};
/* ===================================================== */
/* TOUR HUMAN RESOURCES ANNOTATIONS                      */
/* ===================================================== */

annotate RouteManagementService.TourHumanResources with {
    humanResource @Common.ValueList : {
        CollectionPath : 'HumanResources',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : humanResource,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'employeeCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'fullName'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'status'
            }
        ]
    };
};

annotate RouteManagementService.TourHumanResources with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Séquence',
            Value : sequence
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource humaine',
            Value : humanResource
        },
        {
            $Type : 'UI.DataField',
            Label : 'Rôle',
            Value : role
        },
        {
            $Type : 'UI.DataField',
            Label : 'Note',
            Value : note
        }
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataField',
            Label : 'Séquence',
            Value : sequence
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource humaine',
            Value : humanResource
        },
        {
            $Type : 'UI.DataField',
            Label : 'Rôle',
            Value : role
        },
        {
            $Type : 'UI.DataField',
            Label : 'Note',
            Value : note
        }
    ]
);


/* ===================================================== */
/* TOUR MATERIAL RESOURCES ANNOTATIONS                   */
/* ===================================================== */

annotate RouteManagementService.TourMaterialResources with {
    materialResource @Common.ValueList : {
        CollectionPath : 'MaterialResources',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : materialResource,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'equipmentCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'status'
            }
        ]
    };
};

annotate RouteManagementService.TourMaterialResources with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Séquence',
            Value : sequence
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource matérielle',
            Value : materialResource
        },
        {
            $Type : 'UI.DataField',
            Label : 'Usage',
            Value : usage
        },
        {
            $Type : 'UI.DataField',
            Label : 'Note',
            Value : note
        }
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataField',
            Label : 'Séquence',
            Value : sequence
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource matérielle',
            Value : materialResource
        },
        {
            $Type : 'UI.DataField',
            Label : 'Usage',
            Value : usage
        },
        {
            $Type : 'UI.DataField',
            Label : 'Note',
            Value : note
        }
    ]
);