const express = require('express');
//Middleware
const authMiddleware = require('../middleware/auth');

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

//Rota para listagem de todos os projetos e tarefas.
router.get('/', async (req, res) => {
  res.send({ user: req.userId });
});

//Rota para listagem de projetos e tarefas por id de usuário
router.get('/:projectId', async (req, res) => {
  res.send({ user: req.userId });
});

//Rota para criação de projetos e tarefas
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body);

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
  res.send({ user: req.userId });
});

module.exports = app => app.use('/projects', router);