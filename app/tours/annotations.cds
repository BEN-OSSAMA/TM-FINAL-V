using RouteManagementService as service from '../../srv/route-management-service';

/* ===================================================== */
/* ANNOTATIONS - APPLICATION TOURS                       */
/* Version stable basée sur les champs existants          */
/* ===================================================== */

/* ===================================================== */
/* LABELS POUR LES FILTRES ET LES CHAMPS                 */
/* ===================================================== */

annotate service.Tours with {
    tourCode        @title : 'N° tournée';
    tourDate        @title : 'Date de collecte';
    zone            @title : 'Zone de collecte';
    collectionType  @title : 'Matériau / Type de déchet';
    client_ID       @title : 'Client';
    status          @title : 'Statut';
    quantity        @title : 'Quantité à collecter';
    unitOfMeasure   @title : 'Unité';

    driver_ID       @title : 'Ressource humaine';
    vehicle_ID      @title : 'Ressource matérielle';

    driver          @title : 'Ressource humaine';
    vehicle         @title : 'Ressource matérielle';

    description     @title : 'Remarques';
    rejectionReason @title : 'Motif de rejet';
    createdBy       @title : 'Créé par';
};

/* ===================================================== */
/* VALUE HELPS                                           */
/* ===================================================== */

annotate service.Tours with {

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
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'phone'
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
                ValueListProperty : 'status'
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
/* TOURS                                                 */
/* ===================================================== */

annotate service.Tours with @(

    UI.HeaderInfo : {
        TypeName       : 'Tournée',
        TypeNamePlural : 'Management des tournées',
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
    status,
    quantity,
    unitOfMeasure,
    driver_ID,
    vehicle_ID
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'N° tournée',
            Value : tourCode,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date de collecte',
            Value : tourDate,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Zone de collecte',
            Value : zone
        },
        {
            $Type : 'UI.DataField',
            Label : 'Matériau / Type de déchet',
            Value : collectionType,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : clientName,
            ![@UI.Importance] : #High
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
    Label : 'Quantité à collecter',
    Value : quantity
},
{
    $Type : 'UI.DataField',
    Label : 'Unité',
    Value : unitOfMeasure
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
            Label : 'Zone de collecte',
            Value : zone
        },
        {
            $Type : 'UI.DataField',
            Label : 'Matériau / Type de déchet',
            Value : collectionType
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantité à collecter',
            Value : quantity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Unité',
            Value : unitOfMeasure
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : client_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Remarques',
            Value : description
        }
    ]
},

    UI.FieldGroup #Resources : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Ressource matérielle',
                Value : vehicle_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Ressource humaine',
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
                Value : createdBy
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
/* CLIENTS                                               */
/* ===================================================== */

annotate service.Clients with {
    ID           @title : 'Identifiant client';
    customerCode @title : 'Code client';
    code         @title : 'Code client';
    name         @title : 'Nom du client';
    city         @title : 'Ville';
    phone        @title : 'Téléphone';
};

annotate service.Clients with @(

    UI.HeaderInfo : {
        TypeName       : 'Client',
        TypeNamePlural : 'Clients',
        Title          : {
            Value : name
        },
        Description    : {
            Value : customerCode
        }
    },

    UI.SelectionFields : [
        customerCode,
        name,
        city
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code client',
            Value : customerCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Nom du client',
            Value : name
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ville',
            Value : city
        },
        {
            $Type : 'UI.DataField',
            Label : 'Téléphone',
            Value : phone
        }
    ]
);

/* ===================================================== */
/* VEHICLES                                             */
/* ===================================================== */

annotate service.Vehicles with {
    ID                 @title : 'Identifiant véhicule';
    registrationNumber @title : 'Immatriculation';
    type               @title : 'Type de véhicule';
    capacity           @title : 'Capacité';
    status             @title : 'Statut';
    available          @title : 'Disponible';
};

annotate service.Vehicles with @(

    UI.HeaderInfo : {
        TypeName       : 'Ressource matérielle',
        TypeNamePlural : 'Ressources matérielles',
        Title          : {
            Value : registrationNumber
        },
        Description    : {
            Value : type
        }
    },

    UI.SelectionFields : [
        registrationNumber,
        type,
        status,
        available
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Immatriculation',
            Value : registrationNumber
        },
        {
            $Type : 'UI.DataField',
            Label : 'Type',
            Value : type
        },
        {
            $Type : 'UI.DataField',
            Label : 'Capacité',
            Value : capacity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status
        }
    ]
);

/* ===================================================== */
/* DRIVERS                                              */
/* ===================================================== */

annotate service.Drivers with {
    ID        @title : 'Identifiant chauffeur';
    firstName @title : 'Prénom';
    lastName  @title : 'Nom';
    phone     @title : 'Téléphone';
    available @title : 'Disponible';
};

annotate service.Drivers with @(

    UI.HeaderInfo : {
        TypeName       : 'Ressource humaine',
        TypeNamePlural : 'Ressources humaines',
        Title          : {
            Value : lastName
        },
        Description    : {
            Value : firstName
        }
    },

    UI.SelectionFields : [
        firstName,
        lastName,
        phone,
        available
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Prénom',
            Value : firstName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Nom',
            Value : lastName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Téléphone',
            Value : phone
        },
        {
            $Type : 'UI.DataField',
            Label : 'Disponible',
            Value : available
        }
    ]
);