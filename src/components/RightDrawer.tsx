import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import AreaChart from './charts/AreaChart';
import HeightChart from './charts/HeightChart';
import FunctionChart from './charts/FunctionChart';
import '../style/style.css'; // Import the CSS file

interface RightDrawerProps {
  geojsonData: any;
}

const RightDrawer: React.FC<RightDrawerProps> = ({ geojsonData }) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const getSummaryStatistics = (data: any) => {
    if (!data || !data.features || !Array.isArray(data.features)) {
      console.warn('Invalid GeoJSON data');
      return { totalBuildings: 0, totalArea: 0, avgHeight: 0, functionDistribution: {}, areaDistribution: [], heightDistribution: [] };
    }

    const totalBuildings = data.features.length;
    const totalArea = data.features.reduce((sum: number, feature: any) => sum + (feature.properties.area || 0), 0);
    const avgHeight =
      data.features.reduce((sum: number, feature: any) => sum + (feature.properties.height || 0), 0) / totalBuildings;
    const functionDistribution = data.features.reduce((dist: any, feature: any) => {
      const func = feature.properties.function || 'Unknown';
      dist[func] = (dist[func] || 0) + 1;
      return dist;
    }, {});
    const areaDistribution = data.features.map((feature: any) => feature.properties.area || 0);
    const heightDistribution = data.features.map((feature: any) => feature.properties.height || 0);

    return { totalBuildings, totalArea, avgHeight, functionDistribution, areaDistribution, heightDistribution };
  };

  const summaryStats = getSummaryStatistics(geojsonData);

  return (
    <div>
      <IconButton
        className={`chevron ${open ? 'chevron-open' : ''}`}
        onClick={toggleDrawer}
      >
        {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        classes={{ paper: 'drawer-paper' }}
        variant="persistent"
      >
        <div className="drawer-header">
          <Typography variant="h6">Summary Statistics</Typography>
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
        <Box className="content">
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Total Buildings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h5">{summaryStats.totalBuildings}</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Area of Buildings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="chart-container">
                <AreaChart data={summaryStats.areaDistribution} />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Height of Buildings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="chart-container">
                <HeightChart data={summaryStats.heightDistribution} />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Function Distribution</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="chart-container">
                <FunctionChart data={summaryStats.functionDistribution} />
              </div>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Drawer>
    </div>
  );
};

export default RightDrawer;