import roleController from "../controllers/roleController.js"
import express  from "express";


const router = express.Router();

router.get("/role", roleController.getAllRole)
router.get("/roles/:id", roleController.getRoleById)
router.post("/role", roleController.addRole)
router.delete("/role/:id", roleController.deleteRole)



export default router