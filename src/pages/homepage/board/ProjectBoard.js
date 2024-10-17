import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material';
import axios from 'axios';
import Cookies from "js-cookie";
import { ProfileContext } from "../../../context/ProfileContext";

const ProjectSelectionPopup = ({ open, onClose, onConfirm }) => {
    const { profile } = useContext(ProfileContext);
    const userRole = profile.roles[0].code;
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/project', {
                params: {
                    tab: userRole === 'ADMIN' ? 'IS_ADMIN' : 'IS_MANAGED',
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setProjects(response.data.data);
        } catch (error) {
            console.error('Error fetching projects', error);
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedProject);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Select Project</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                        labelId="project-select-label"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={handleConfirm} color="primary">OK</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectSelectionPopup;
