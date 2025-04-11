const { Sites } = require('../handlers');
const authenticateJWT = require("../middleware/auth");

const router = require('express').Router();
const handler = new Sites();

router.post("/", authenticateJWT, handler.create);
router.get("/", handler.getAll);
router.get("/:id", handler.getById);
router.put("/:id", handler.update);
router.delete("/:id", handler.delete);

module.exports = router;
