import React, {useState, useEffect, useContext} from 'react';
import {
    Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import ReleaseDialog from './ReleaseDialog';
import ReleaseList from './ReleaseList';
import Grid from "@mui/material/Grid";
import {ProfileContext} from "../../../context/ProfileContext";

// Define the list of statuses
const releaseStatuses = [
    'New',
    'On_Going',
    'In_Progress',
    'Pending',
    'Completed',
];

const ReleasePage = () => {
    const [open, setOpen] = useState(false);
    const [releases, setReleases] = useState([]);
    const [selectedRelease, setSelectedRelease] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const { profile } = useContext(ProfileContext);

    useEffect(() => {
        fetchReleases();
    }, [searchName, selectedStatus]);

    const fetchReleases = async () => {
        try {
            const token = Cookies.get('token');
            const currentProject = Cookies.get('currentProject');
            const projectObject = currentProject ? JSON.parse(currentProject) : null;

            const response = await axios.get('http://localhost:8080/release', {
                params: {
                    name: searchName,
                    projectId: projectObject?.id || null,
                    status: selectedStatus || null,
                },
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setReleases(response.data.data);
        } catch (error) {
            console.error('Error fetching releases', error);
        }
    };

    const handleOpen = () => {
        setSelectedRelease(null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (releaseData) => {
        try {
            const token = Cookies.get('token');
            if (selectedRelease) {
                await axios.put(`http://localhost:8080/release/${selectedRelease.id}`, releaseData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                await axios.post('http://localhost:8080/release', releaseData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
            fetchReleases();
            setOpen(false);
        } catch (error) {
            console.error('Error saving release', error);
        }
    };

    const handleUpdate = (release) => {
        setSelectedRelease(release);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/release/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchReleases();
        } catch (error) {
            console.error('Error deleting release', error);
        }
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchName(event.target.value);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Release Management
            </Typography>
            <Typography variant="body1" gutterBottom>
                This is the Release Management page. Here, you can manage releases.
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                    <TextField
                        variant="outlined"
                        label="Search by Name"
                        fullWidth
                        value={searchName}
                        onChange={handleSearchChange}
                    />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            label="Filter by Status"
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            {releaseStatuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status.replace('_', ' ')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                {profile.roles[0].code === 'PM' &&
                    <Button variant="contained" color="primary" onClick={handleOpen}>
                        Add Release
                    </Button>
                }
            </Box>
            <ReleaseList releases={releases} onUpdate={handleUpdate} onDelete={handleDelete} />
            <ReleaseDialog open={open} onClose={handleClose} onSubmit={handleSubmit} release={selectedRelease} />
        </Box>
    );
};

export default ReleasePage;
