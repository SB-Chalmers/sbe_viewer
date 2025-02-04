import React from 'react';
import { Popup } from 'react-map-gl';
import './PopupComponent.css'; // Import the CSS file

interface PopupComponentProps {
    longitude: number;
    latitude: number;
    properties: { [key: string]: any };
    onClose: () => void;
}

const predefinedAttributes = [
    'name',          // Building or feature name
    'type',          // Type of feature (e.g., building, landmark)
    'status',        // Status (e.g., active, under construction)
    'height',        // Height of the feature in meters
    'function',      // Building function (e.g., Residential, Office)
    'floors',        // Number of floors
    'floor_height',  // Average height of each floor in meters
    'roof_type',     // Type of roof (e.g., Flat, Gabled)
    'EPC_class',     // Energy Performance Certificate class
    'annual_energy', // Annual energy usage in kWh
    'area'           // Area of the feature in square meters
];

const PopupComponent: React.FC<PopupComponentProps> = ({ longitude, latitude, properties, onClose }) => {
    return (
        <Popup
            className="custom-popup"
            longitude={longitude}
            latitude={latitude}
            closeButton={true}
            closeOnClick={false}
            onClose={onClose}
            anchor="top"
        >
            <div className="popup-content">
                <h3 className="popup-title">{properties.name || 'Details'}</h3>
                <ul className="popup-list">
                    {predefinedAttributes.map((attr) => (
                        <li key={attr} className="popup-list-item">
                            <span className="popup-attr-name">{attr}:</span>
                            <span className="popup-attr-value">
                                {properties[attr] !== undefined ? properties[attr] : 'Not available'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </Popup>
    );
};

export default PopupComponent;
