import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(422).json({
      error: 'validation_error',
      message: 'username and password are required strings'
    });
  }

  if (
    username !== config.demoUser.username ||
    password !== config.demoUser.password
  ) {
    return res.status(401).json({
      error: 'invalid_credentials',
      message: 'Incorrect username or password'
    });
  }

  const token = jwt.sign(
    {
      sub: config.demoUser.id,
      username: config.demoUser.username,
      role: config.demoUser.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return res.status(200).json({
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn
  });
});

export { router as authRouter };
