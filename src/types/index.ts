export interface GISData {
    id: string;
    type: string;
    properties: Record<string, any>;
    geometry: {
        type: string;
        coordinates: number[][] | number[][][];
    };
}

export interface FilterOptions {
    property: string;
    value: any;
}

export interface MapViewerProps {
    data: GISData[];
    onFilterChange: (options: FilterOptions) => void;
}