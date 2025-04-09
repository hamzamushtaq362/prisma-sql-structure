const { Users } = require('../handlers');

const router = require('express').Router();
const handler = new Users();

router.post('/', handler.createUser);
router.get('/', handler.getUsers);
router.get('/:id', handler.getUserById);
router.put('/:id', handler.updateUser);
router.delete('/:id', handler.deleteUser);

module.exports = router;
