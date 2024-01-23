declare const data: {
    html: string;
    location: {
        begin: number;
        end: number;
    };
    enrichments: ({
        location: {
            begin: number;
            end: number;
        };
        text: string;
        attributes: never[];
        categories: {
            label: string;
            provenance_ids: string[];
        }[];
        types: never[];
        __type: string;
        type?: undefined;
    } | {
        location: {
            begin: number;
            end: number;
        };
        text: string;
        attributes: {
            type: string;
            text: string;
            location: {
                begin: number;
                end: number;
            };
        }[];
        categories: never[];
        types: {
            label: {
                nature: string;
                party: string;
            };
            provenance_ids: string[];
        }[];
        __type: string;
        type?: undefined;
    } | {
        type: string;
        text: string;
        location: {
            begin: number;
            end: number;
        };
        __type: string;
        attributes?: undefined;
        categories?: undefined;
        types?: undefined;
    })[];
}[];
export default data;
