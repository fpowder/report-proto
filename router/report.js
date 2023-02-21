import express from 'express';

import path from 'path';
import fs from 'fs';

import { isMatch } from 'date-fns';

const __dirname = path.resolve();

const yearPattern = 'yyyy';
const monthPattern = 'M';

const reportRouter = express.Router();
reportRouter.get('/list', async(req, res) => {
    if(!(req.query.year || req.query.month)) {
        res.status(400).send({
            message: `year and month param must be included`
        });
        return;
    }

    const year = req.query.year;
    const month = req.query.month;

    if(!(isMatch(year, yearPattern) || isMatch(month, monthPattern))) {
        res.status(400).send({
            message: `year or month pattern is not valid.`
        });
        return;
    }

    if(!fs.existsSync(path.resolve(__dirname, `./xlsx/${year}`))) {
        fs.mkdirSync(path.resolve(__dirname, `./xlsx/${year}`));
    }

    if (!fs.existsSync(path.resolve(__dirname, `./xlsx/${year}/${month}`))) {
      fs.mkdirSync(path.resolve(__dirname, `./xlsx/${year}/${month}`));
    }

    const fileList = fs.readdirSync(path.resolve(__dirname, `./xlsx/${year}/${month}`));

    res.status(200).send({
        fileList: fileList
    });
});

reportRouter.get('/download', async(req, res) => {
    if(!req.query.filename) {
        res.status(400).send({
            message: 'filename parameter is must be included'
        });
        return;
    }

    if (!(req.query.year || req.query.month)) {
      res.status(400).send({
        message: `year and month param must be included`,
      });
      return;
    }

    const year = req.query.year;
    const month = req.query.month;

    if (!(isMatch(year, yearPattern) || isMatch(month, monthPattern))) {
      res.status(400).send({
        message: `year or month pattern is not valid.`,
      });
      return;
    }

    const filename = req.query.filename;
    if(filename.indexOf('.xlsx') < 0) {
        res.status(400).send({
            message: 'file is xlsx format'
        });
        return;
    }

    res.status(200).download(`${__dirname}/xlsx/${year}/${month}/${filename}`);
});

export default reportRouter;

// (() => {
//     const fileList = fs.readdirSync(path.resolve(__dirname, `./xlsx/2023/1`));
//     console.log(fileList);
// })();

