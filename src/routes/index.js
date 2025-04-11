const router = require("express").Router();
const user = require("./user");
const site = require("./site");
const request = require("./request");

router.use("/user", user);
router.use("/site", site);
router.use("/request", request);
module.exports = router;