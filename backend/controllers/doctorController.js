// doctorController.js
module.exports = {
  listDoctors: async (req, res) => {
    res.json({ message: 'list doctors placeholder' });
  },
  createDoctor: async (req, res) => {
    res.status(201).json({ message: 'create doctor placeholder' });
  }
};
