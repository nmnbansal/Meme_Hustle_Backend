const mockAuth = (req, res, next) => {
  console.log('Applying mockAuth, setting user_id: cyberpunk420');
  req.user = { id: 'cyberpunk420' };
  next();
};

module.exports = { mockAuth };