import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '../../axiosConfig';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';

const AssignRFID = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rfid, setRfid] = useState('');
  const [clientData, setClientData] = useState(location.state || {});
  const [openDialog, setOpenDialog] = useState(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    navigate('/list-clients');
  };

  const handleSaveRFID = async () => {
    if (rfid) {
      try {
        await createClient({ ...clientData, rfid });
        alert('RFID assigned successfully');
        navigate('/list-clients', { state: { refresh: true } }); // Change state to trigger re-fetch
        handleCloseDialog();
      } catch (error) {
        alert('Failed to assign RFID');
      }
    }
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>Assign RFID</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="RFID"
          fullWidth
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSaveRFID} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRFID;
