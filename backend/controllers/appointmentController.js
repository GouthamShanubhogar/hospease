// appointmentController.js
module.exports = {
  listAppointments: async (req, res) => {
    res.json({ message: 'list appointments placeholder' });
  },
  createAppointment: async (req, res) => {
    res.status(201).json({ message: 'create appointment placeholder' });
  }
};
