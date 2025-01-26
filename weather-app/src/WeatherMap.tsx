import React, { useEffect, useRef } from "react";
import "ol/ol.css"; // Import OpenLayers styles
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

interface WeatherMapProps {
    latitude: number;
    longitude: number;
    apiKey: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ latitude, longitude, apiKey }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Create a map instance
        const map = new Map({
            target: mapRef.current,
            layers: [
                // OpenWeatherMap Weather Layer
                new TileLayer({
                    source: new XYZ({
                        url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`,
                    }),
                }),
            ],
            view: new View({
                center: fromLonLat([longitude, latitude]), // Center the map on the provided coordinates
                zoom: 10, // Initial zoom level (adjust as needed)
            }),
        });

        // Cleanup on unmount
        return () => {
            map.setTarget(undefined);
        };
    }, [latitude, longitude, apiKey]);

    return (
        <div
            ref={mapRef}
            style={{ width: "100%", height: "400px", border: "1px solid white" }}
        />
    );
};

export default WeatherMap;