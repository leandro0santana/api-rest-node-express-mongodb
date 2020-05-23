const express = require('express');
//Middleware
const authMiddleware = require('../middleware/auth');

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

//Rota para listagem de todos os projetos e tarefas.
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('user');

    return res.send({ projects });
  } catch (err) {
    return res.status(400).send({ error: 'Error loading projects' });
  }
});

//Rota para listagem de projetos e tarefas por id de usuário
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('user');

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: 'Error loading project' });
  }
});

//Rota para criação de projetos e tarefas
router.post('/', async (req, res) => {
  try {
    const project = await Project.create({...req.body, user: req.userId });

    return res.send({ project });

  } catch (err) {
    return res.status(400).send({ error: 'Error creating new project' });
  }
});

//Rota para atualização de projetos e tarefas
router.put('/:projectId', async (req, res) => {
  res.send({ user: req.userId });
});

//Rota para deleta projetos e tarefas
router.delete('/:projectId', async (req, res) => {
  try {
    await Project.findByIdAndRemove(
      req.params.projectId, 
      { 
        new: true, 
        useFindAndModify: false,
    });

    return res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Error deleting project' });
  }
});

module.exports = app => app.use('/projects', router);