import React, {useState, useEffect, useCallback, useContext} from 'react';
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, TextField, Grid, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import SprintList from './SprintList';
import SprintDialog from './SprintDialog';
import {ProfileContext} from "../../../context/ProfileContext";

const SprintPage = () => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [releases, setReleases] = useState([]);
    const [filterRelease, setFilterRelease] = useState('');
    const [searchName, setSearchName] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentSprint, setCurrentSprint] = useState(null);
    const [isReleaseDisabled, setIsReleaseDisabled] = useState(true);
    const [releaseLoading, setReleaseLoading] = useState(false);
    const {profile} = useContext(ProfileContext);
    const currentProject = useCallback(JSON.parse(Cookies.get('currentProject') || '{}'), []);

    useEffect(() => {
        const fetchReleases = async (projectId) => {
            if (!projectId) return;
            setReleaseLoading(true); // Set loading state for releases
            try {
                const token = Cookies.get('token');
                const response = await axios.get('http://localhost:8080/release', {
                    params: { projectId },
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setReleases(response.data.data);
            } catch (error) {
                console.error('Error fetching releases', error);
            } finally {
                setReleaseLoading(false); // Stop loading after fetch
            }
        };

        if (currentProject && currentProject.id) {
            fetchReleases(currentProject.id);
            setIsReleaseDisabled(false);
        } else {
            setReleases([]);
            setIsReleaseDisabled(true);
        }
    }, [currentProject]);

    const fetchSprints = useCallback(async () => {
        if (!currentProject.id) return;
        setLoading(true); // Set loading state for sprints
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/sprint', {
                params: {
                    name: searchName,
                    projectId: currentProject.id,
                    releaseId: filterRelease || null,
                    status: filterStatus || null,
                },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSprints(response.data.data);
        } catch (error) {
            console.error('Error fetching sprints:', error);
        } finally {
            setLoading(false); // Stop loading after fetch
        }
    }, [searchName, filterRelease, filterStatus, currentProject.id]);

    useEffect(() => {
        fetchSprints();
    }, [filterRelease, searchName, filterStatus, fetchSprints]);

    const handleUpdateSprint = (sprint) => {
        setCurrentSprint(sprint);
        setDialogOpen(true);
    };

    const handleDeleteSprint = async (sprintId) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/sprint/${sprintId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSprints(sprints.filter((sprint) => sprint.id !== sprintId));
        } catch (error) {
            console.error('Error deleting sprint:', error);
        }
    };

    const handleFilterReleaseChange = (event) => {
        setFilterRelease(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchName(event.target.value);
    };

    const handleStatusChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const handleDialogOpen = () => {
        setCurrentSprint(null);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogSubmit = async (sprint) => {
        try {
            const token = Cookies.get('token');
            let response;

            if (currentSprint) {
                response = await axios.put(`http://localhost:8080/sprint/${currentSprint.id}`, sprint, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                response = await axios.post('http://localhost:8080/sprint', sprint, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }

            fetchSprints(); // Refresh the sprints list after adding or updating
            setDialogOpen(false);
            return response; // Return the response to be handled by the caller
        } catch (error) {
            console.error(`Error ${currentSprint ? 'updating' : 'adding'} sprint:`, error);
            throw error; // Re-throw the error so it can be caught by the caller
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Sprint Management
            </Typography>
            <Typography variant="body1" gutterBottom>
                This is the Sprint Management page. Here, you can manage sprints.
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" fullWidth disabled={isReleaseDisabled}>
                        <InputLabel id="release-filter-label">Filter by Release</InputLabel>
                        <Select
                            labelId="release-filter-label"
                            value={filterRelease}
                            onChange={handleFilterReleaseChange}
                            label="Filter by Release"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {releaseLoading ? (
                                <MenuItem value="" disabled>
                                    <CircularProgress size={24} />
                                    Loading...
                                </MenuItem>
                            ) : (
                                releases.map((release) => (
                                    <MenuItem key={release.id} value={release.id}>
                                        {release.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            value={filterStatus}
                            onChange={handleStatusChange}
                            label="Filter by Status"
                        >
                            <MenuItem value=""><em>All</em></MenuItem>
                            <MenuItem value="New">New</MenuItem>
                            <MenuItem value="On_going">On Going</MenuItem>
                            <MenuItem value="In_Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label="Search by Name"
                        fullWidth
                        value={searchName}
                        onChange={handleSearchChange}
                    />
                </Grid>
                {profile.roles[0].code === 'PM' && (
                    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                        <Button variant="contained" color="primary" onClick={handleDialogOpen}>
                            Add New Sprint
                        </Button>
                    </Grid>
                )
                }
            </Grid>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <SprintList
                    sprints={sprints}
                    onUpdate={handleUpdateSprint}
                    onDelete={handleDeleteSprint}
                />
            )}
            <SprintDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onSubmit={handleDialogSubmit}
                sprint={currentSprint}
            />
        </Box>
    );
};

export default SprintPage;
