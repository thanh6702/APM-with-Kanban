import React, { useState, useEffect } from 'react';
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Cookies from 'js-cookie';

const BurnDownChart = () => {
    const [data, setData] = useState([]);
    const [releases, setReleases] = useState([]);
    const [selectedRelease, setSelectedRelease] = useState('');
    const [loading, setLoading] = useState(true);
    const [releaseLoading, setReleaseLoading] = useState(false);

    // Fetch releases
    useEffect(() => {
        const fetchReleases = async () => {
            setReleaseLoading(true);
            const savedProject = Cookies.get('currentProject');
            const project = JSON.parse(savedProject);
            try {
                const token = Cookies.get('token');
                const response = await axios.get('http://localhost:8080/release', {
                    params: { projectId: project.id },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReleases(response.data.data);
            } catch (error) {
                console.error('Error fetching releases', error);
            } finally {
                setReleaseLoading(false);
            }
        };

        fetchReleases();
    }, []);

    // Fetch burn down data based on selected release
    useEffect(() => {
        const fetchBurnDownData = async () => {
            if (!selectedRelease) return;

            setLoading(true);
            try {
                const token = Cookies.get('token');
                const response = await axios.get(`http://localhost:8080/project/${selectedRelease}/point`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { totalPoint, sprints } = response.data.data;
                let remainingPoints = totalPoint;

                const formattedData = sprints.map((sprint, index) => {
                    remainingPoints -= sprint.totalPoint;
                    return {
                        sprint: `Sprint #${index + 1}`,
                        totalPoint: remainingPoints,
                    };
                });

                // Push initial totalPoint as the first data point
                formattedData.unshift({ sprint: "Initial", totalPoint });

                setData(formattedData);
            } catch (error) {
                console.error('Error fetching burn down data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBurnDownData();
    }, [selectedRelease]);

    const handleReleaseChange = (event) => {
        setSelectedRelease(event.target.value);
    };

    return (
        <Paper sx={{ p: 3, backgroundColor: '#f4f6f8', border: '1px solid #ddd' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Burn Down Chart
            </Typography>
            <FormControl variant="outlined" fullWidth sx={{ mb: 3 }}>
                <InputLabel id="release-select-label">Select Release</InputLabel>
                <Select
                    labelId="release-select-label"
                    value={selectedRelease}
                    onChange={handleReleaseChange}
                    label="Select Release"
                >
                    {releaseLoading ? (
                        <MenuItem disabled>
                            <CircularProgress size={24} />
                            Loading...
                        </MenuItem>
                    ) : (
                        releases.map(release => (
                            <MenuItem key={release.id} value={release.id}>
                                {release.name}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>
            {loading ? (
                <CircularProgress />
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="sprint" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalPoint" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

export default BurnDownChart;
