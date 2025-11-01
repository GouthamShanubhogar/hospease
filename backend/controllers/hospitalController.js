// hospitalController.js
module.exports = {
  listHospitals: async (req, res) => {
    res.json({ message: 'list hospitals placeholder' });
  },
  createHospital: async (req, res) => {
    res.status(201).json({ message: 'create hospital placeholder' });
  }
};
