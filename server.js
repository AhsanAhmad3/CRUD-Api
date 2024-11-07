const express = require('express');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;
const dataFile = './data.json';

app.use(express.json());

// Helper function to read data from JSON file
async function readData() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return [];
    }
}

// Helper function to write data to JSON file
async function writeData(data) {
    try {
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
        console.log("Data saved successfully.");
    } catch (err) {
        console.error("Error writing data:", err);
    }
}

// Create a new user
app.post('/users', async (req, res) => {
    const newUser = req.body;
    const data = await readData();
    data.push(newUser);
    await writeData(data);
    res.status(201).send(newUser);
});

// Get all users
app.get('/users', async (req, res) => {
    const data = await readData();
    res.send(data);
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const updatedFields = req.body;
    const data = await readData();
    const index = data.findIndex(user => user.id === userId);

    if (index !== -1) {
        data[index] = { ...data[index], ...updatedFields };
        await writeData(data);
        res.send(data[index]);
    } else {
        res.status(404).send({ message: `User with ID ${userId} not found.` });
    }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const data = await readData();
    const newData = data.filter(user => user.id !== userId);

    if (newData.length !== data.length) {
        await writeData(newData);
        res.send({ message: `User with ID ${userId} deleted.` });
    } else {
        res.status(404).send({ message: `User with ID ${userId} not found.` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
