import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import Cookies from "js-cookie";
import axios from 'axios';
import { ProfileContext } from "../../../context/ProfileContext";
import { styled } from "@mui/material/styles";
import GeneralInformationTab from "../../../subscreen/projects/GeneralInformationTab";
import MembersTab from "../../../subscreen/projects/MembersTab";
import ColumnsTab from "../../../subscreen/projects/ColumnTab";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const ProjectDetail = () => {
    const { profile } = useContext(ProfileContext);
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    const fetchProject = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axios.get(`http://localhost:8080/project/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setProject(response.data.data);
            setMembers(response.data.data.members);
            setColumns(response.data.data.columnResponses);
        } catch (error) {
            console.error('Error fetching project details', error);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (!project) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <BackgroundContainer>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
                <Tab label="General Information" />
                <Tab label="Members" />
                <Tab label="Columns" />
            </Tabs>
            {tabValue === 0 && (
                <GeneralInformationTab project={project} setProject={setProject} />
            )}
            {tabValue === 1 && (
                <MembersTab projectId={id} members={members} setMembers={setMembers} fetchProject={fetchProject} />
            )}
            {tabValue === 2 && (
                <ColumnsTab projectId={id} columns={columns} setColumns={setColumns} fetchProject={fetchProject} projectStatus={project.status} />
            )}
        </BackgroundContainer>
    );
};

export default ProjectDetail;

