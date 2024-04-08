import multer from 'multer'
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/')
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueFilename)
  },
})

const upload = multer({ storage: storage })




export default upload;