const { Requests } = require('../handlers');

const router = require('express').Router();
const handler = new Requests();

router.post('/', handler.createRequests);
router.get('/', handler.getRequests);
router.get('/:id', handler.getRequestById);
router.put('/:id', handler.updateRequest);
router.delete('/:id', handler.deleteRequest);

module.exports = router;
