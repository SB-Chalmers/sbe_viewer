import React, { useEffect, useState } from 'react';
import MapViewer from './components/MapViewer';

const basePath = process.env.REACT_APP_BASE_PATH || '';
const App: React.FC = () => {
  return (
    <div id="app-container">
      <MapViewer />      
    </div>
  );
};

export default App;