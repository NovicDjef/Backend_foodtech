import { verify } from 'jsonwebtoken'

function checkAuth(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = verify(token, 'secret')
    req.userData = decodedToken
    next()
  } catch (e) {
    return res.status(401).json({
      message: 'Invalid or Expired Token provided !',
      error: e,
    })
  }
}

export default checkAuth
