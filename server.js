const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Change the port to 3001

app.use(cors()); // Enable CORS
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.head('/uploads/demo.glb', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'uploads', 'demo.glb');
    if (fs.existsSync(filePath)) {
        res.status(200).end();
    } else {
        res.status(404).end();
    }
});

app.head('/uploads/tree.glb', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'uploads', 'tree.glb');
    if (fs.existsSync(filePath)) {
        res.status(200).end();
    } else {
        res.status(404).end();
    }
});

app.post('/api/save-glb', (req, res) => {
    console.log('Received request to save GLB file');
    const filePath = path.join(__dirname, 'public', 'uploads', 'demo.glb'); // Save to a separate directory

    if (fs.existsSync(filePath)) {
        console.log('GLB file already exists:', filePath);
        res.json({ filePath: '/uploads/demo.glb' });
        return;
    }

    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    req.on('data', (chunk) => {
        console.log(`Received ${chunk.length} bytes of data.`);
    });

    req.on('end', () => {
        console.log('Request data stream ended.');
    });

    writeStream.on('finish', () => {
        console.log('GLB file saved successfully:', filePath);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Add caching headers
        res.json({ filePath: '/uploads/demo.glb' }); // Return the correct path
    });

    writeStream.on('error', (err) => {
        console.error('Error saving GLB file:', err);
        res.status(500).send('Failed to save GLB file');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
