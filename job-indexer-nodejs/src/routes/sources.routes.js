const router = require("express").Router();
const controller = require("../controllers/sources.controller");

router.get("/", controller.listSources);
router.post("/", controller.createSource);
router.patch("/:id", controller.updateSource);
router.delete("/:id", controller.deleteSource);
router.post("/:id/sync", controller.syncOne);

module.exports = router;
