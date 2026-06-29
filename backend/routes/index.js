const express = require('express');
const router = express.Router();

const editionsRoutes = require('./editions');
const categoriesRoutes = require('./categories');
const schoolsRoutes = require('./schools');
const usersRoutes = require('./users');
const authRoutes = require('./auth');
const recipientTypesRoutes = require('./recipientTypes');
const sponsorsRoutes = require('./sponsors');
const dashboardRoutes = require('./dashboard');
const locationsRoutes = require('./locations');
const applicationsRoutes = require('./applications');
const juryRoutes = require('./jury');

router.use('/editions', editionsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/schools', schoolsRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/recipient-types', recipientTypesRoutes);
router.use('/sponsors', sponsorsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/locations', locationsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/jury', juryRoutes);

module.exports = router;
