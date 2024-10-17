import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Divider, TextField, Button, Snackbar, Alert, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Grid } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const Worklog = ({ taskId, canEdit, taskName }) => {
    const [worklog, setWorklog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editWorklog, setEditWorklog] = useState({ taskId, date: new Date(), startTime: '', endTime: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [totalHours, setTotalHours] = useState(0);
    console.log(canEdit)
    useEffect(() => {
        fetchWorklog();
    }, [taskId]);

    const fetchWorklog = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/work-log/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setWorklog(response.data.data.workLogDetails || []);
            setTotalHours(response.data.data.totalHours || 0);
        } catch (error) {
            console.error('Error fetching worklog:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateWorklog = async () => {
        setSubmitting(true);
        try {
            const token = Cookies.get('token');
            const worklogData = {
                ...editWorklog,
                startDate: moment(`${moment(editWorklog.date).format('MM/DD/YYYY')} ${editWorklog.startTime}`, 'MM/DD/YYYY HH:mm').valueOf(),
                endDate: moment(`${moment(editWorklog.date).format('MM/DD/YYYY')} ${editWorklog.endTime}`, 'MM/DD/YYYY HH:mm').valueOf(),
            };
            if (editWorklog.id) {
                await axios.put(`http://localhost:8080/work-log/${editWorklog.id}`, worklogData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setAlert({ open: true, message: 'Worklog updated successfully', severity: 'success' });
            } else {
                await axios.post(`http://localhost:8080/work-log`, worklogData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setAlert({ open: true, message: 'Worklog added successfully', severity: 'success' });
            }
            setDialogOpen(false);
            fetchWorklog(); // Fetch the updated worklog
        } catch (error) {
            console.error('Error adding/updating worklog:', error);
            setAlert({ open: true, message: 'Failed to add/update worklog', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteWorklog = async (worklogId) => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/work-log/${worklogId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setAlert({ open: true, message: 'Worklog deleted successfully', severity: 'success' });
            fetchWorklog(); // Fetch the updated worklog
        } catch (error) {
            console.error('Error deleting worklog:', error);
            setAlert({ open: true, message: 'Failed to delete worklog', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (worklog = { taskId, date: new Date(), startTime: '', endTime: '', description: '' }) => {
        setEditWorklog({
            ...worklog,
            date: worklog.startDate ? moment(worklog.startDate).toDate() : new Date(),
            startTime: worklog.startDate ? moment(worklog.startDate).format('HH:mm') : '',
            endTime: worklog.endDate ? moment(worklog.endDate).format('HH:mm') : '',
        });
        setDialogOpen(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card sx={{ width: '100%', mx: 'auto', p: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Worklog for Task: {taskName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Total Hours: {totalHours}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {worklog.map(entry => (
                        <Paper key={entry.id} sx={{ p: 2, mb: 2 }} elevation={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        {entry.startDate && entry.endDate
                                            ? `${moment(entry.startDate).format('HH:mm MM/DD/YYYY')} - ${moment(entry.endDate).format('HH:mm MM/DD/YYYY')}`
                                            : 'No start or end date'}
                                    </Typography>
                                    <Typography variant="body1">
                                        {entry.description}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Hours: {entry.hours}
                                    </Typography>
                                </Box>
                                {canEdit && (
                                    <Box>
                                        <IconButton onClick={() => openDialog(entry)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteWorklog(entry.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    ))}
                    {canEdit && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => openDialog()}
                            startIcon={<AddIcon />}
                        >
                            Add Worklog
                        </Button>
                    )}
                </CardContent>
            </Card>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editWorklog.id ? 'Edit Worklog' : 'Add Worklog'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <DatePicker
                                selected={editWorklog.date}
                                onChange={(date) => setEditWorklog({ ...editWorklog, date })}
                                dateFormat="MM/dd/yyyy"
                                customInput={<TextField label="Date" fullWidth variant="outlined" />}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Start Time"
                                type="time"
                                fullWidth
                                value={editWorklog.startTime}
                                onChange={(e) => setEditWorklog({ ...editWorklog, startTime: e.target.value })}
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="End Time"
                                type="time"
                                fullWidth
                                value={editWorklog.endTime}
                                onChange={(e) => setEditWorklog({ ...editWorklog, endTime: e.target.value })}
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={editWorklog.description}
                                onChange={(e) => setEditWorklog({ ...editWorklog, description: e.target.value })}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={handleAddOrUpdateWorklog} color="primary" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Worklog;
