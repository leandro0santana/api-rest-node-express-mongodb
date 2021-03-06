const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth')

const User = require('../models/user');

const router = express.Router();

//Função para gerar tokens de autenticação
function generateToken(params = {}){
  return jwt.sign(
    params, 
    authConfig.secret, {
    expiresIn: 86400,
  })
}

//Rota para Registrar um novo usuário
router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
    if(await User.findOne({ email }))
      return res.status(400).send({ error: 'User already exists'});
    
    
    const user = await User.create(req.body);

    user.password = undefined;
    
    return res.send({ 
      user,
      token: generateToken({ id: user.id }),
    });

  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
});

//Rota para autenticação de usuário quando é feito o login
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return res.status(400).send({ error: 'User not found' });
  
  if(!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: 'Invalid password' });

  user.password = undefined;
  
  res.send({ 
    user, 
    token: generateToken({ id: user.id }),
  });
});

// Rota para Envio de token para usuário que esqueceu a senha
router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try{
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        passwordResetToken: token,
        passwordResetExpires: now,
      }
    }, 
    { 
      new: true, 
      useFindAndModify: false,
    });

    mailer.sendMail({
      to: email,
      from: 'leandro.c.santana01@gmail.com',
      template: 'auth/forgot_password',
      context: { token },
    }, (err) => {
      if(err)
        return res.status(400).send({ error: 'Cannot send forgot password, try again' });

      return res.send(200);
    })

  } catch (err) {
    res.status(400).send({ erro: 'Erro on forgot password, try again' });
  }

});

//Rota para atualização de senha aparti do token envia para o e-mail
router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordResetExpires');
    
    if (!user)
      return res.status(400).send({ error: 'User not found' });
    
    if(token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Token invalid' });

    const now = new Date();
    
    if(token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Token expired, generate a new one' });

    user.password = password;

    await user.save();

    res.send();

  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again' });
  }
});

module.exports = app => app.use('/auth',router);