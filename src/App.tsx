import React, { useEffect, useState } from 'react';
import MapViewer from './components/MapViewer';
import RightDrawer from './components/RightDrawer';

const basePath = process.env.REACT_APP_BASE_PATH || '';
const App: React.FC = () => {
  const [geojsonData, setGeojsonData] = useState<any>(null);

  useEffect(() => {
    // Fetch the GeoJSON data
    fetch(`${basePath}sample-data.geojson`)
      .then(response => response.json())
      .then(data => setGeojsonData(data));
  }, []);

  return (
    <div id="app-container">
      <MapViewer />
      
      {geojsonData && <RightDrawer geojsonData={geojsonData} />}
    </div>
  );
};

export default App;