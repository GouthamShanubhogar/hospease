import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const LoadingSkeleton = () => (
  <>
    {[1, 2, 3].map((row) => (
      <TableRow key={row}>
        {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
          <TableCell key={cell}>
            <Skeleton animation="wave" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const AppointmentList = ({
  appointments = [],
  onEdit,
  onDelete,
  onStatusChange,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  userRole
}) => {
  const canManage = ['admin', 'staff', 'doctor'].includes(userRole);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id} hover>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>{appointment.department}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(appointment.time), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  {canManage && (
                    <TableCell align="right">
                      {appointment.status === 'scheduled' && (
                        <>
                          <Tooltip title="Mark Complete">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                onStatusChange(appointment.id, 'completed')
                              }
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel Appointment">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                onStatusChange(appointment.id, 'cancelled')
                              }
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(appointment.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {!loading && appointments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 7 : 6}
                  align="center"
                  sx={{ py: 3 }}
                >
                  No appointments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};

export default AppointmentList;