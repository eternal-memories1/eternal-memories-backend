const express = require('express');
const router = express.Router();
const { obtenerUsuarios, actualizarPlan, eliminarUsuario } = require('../controllers/adminController');
const { protegerRuta, isAdmin } = require('../middleware/auth');

router.get('/usuarios', protegerRuta, isAdmin, obtenerUsuarios);
router.put('/usuarios/:userId', protegerRuta, isAdmin, actualizarPlan);
router.delete('/usuarios/:userId', protegerRuta, isAdmin, eliminarUsuario);

module.exports = router;
