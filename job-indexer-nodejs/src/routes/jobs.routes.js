const router = require("express").Router();
const controller = require("../controllers/jobs.controller");

router.get("/", controller.listJobs);
router.get("/:id", controller.getJob);

module.exports = router;
