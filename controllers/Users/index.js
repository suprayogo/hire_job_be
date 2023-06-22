const model = require("../../models");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../../utils/cloudinary");

module.exports = {
  // get users
  getProfile: async (req, res) => {
    try {
      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      const request = await model.users.findOne({
        where: { id },
      });

      res.status(200).json({
        status: "OK",
        messages: "Get profile success",
        data: request,
      });
    } catch (error) {
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
  // edit users
  editProfile: async (req, res) => {
    try {
      const requestBody = req.body;

      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      const payload = {
        fullname: requestBody?.fullname,
        company: requestBody?.company,
        job_title: requestBody?.job_title,
        phone: requestBody?.phone,
        description: requestBody?.description,
        domicile: requestBody?.domicile,
      };

      await model.users.update(payload, {
        where: { id },
      });

      res.status(200).json({
        status: "OK",
        messages: "Edit profile success",
        data: payload,
      });
    } catch (error) {
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
  editProfilePicture: async (req, res) => {
    try {
      const { photo } = req?.files ?? {};

      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      let mimeType = photo.mimetype.split("/")[1];
      let allowFile = ["jpeg", "jpg", "png", "webp"];

      // cari apakah tipe data yang di upload terdapat salah satu dari list yang ada diatas
      if (!allowFile?.find((item) => item === mimeType)) {
        res.status(400).send({
          status: false,
          message: "Only accept jpeg, jpg, png, webp",
        });
      }

      // validate size image
      if (photo.size > 2000000) {
        res.status(400).send({
          status: false,
          message: "File to big, max size 2MB",
        });
      }

      const upload = await cloudinary.uploader.upload(photo.tempFilePath, {
        public_id: new Date().toISOString(),
      });

      const request = await model.users.findOne({
        where: { id },
      });

      const payload = {
        ...request?.dataValues,
        photo: upload?.secure_url,
      };

      await model.users.update(payload, {
        where: { id },
      });

      res.status(200).json({
        status: "OK",
        messages: "Edit photo profile",
        data: payload,
      });
    } catch (error) {
      console.log(error);
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
  // add skills
  addSkills: async (req, res) => {
    try {
      const requestBody = req.body;

      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      const request = await model.users.findOne({
        where: { id },
      });

      const skills = request?.dataValues?.skills ?? [];

      const payload = {
        ...request?.dataValues,
        skills: [...skills, ...requestBody?.skills],
      };

      await model.users.update(payload, {
        where: { id },
      });

      res.status(200).json({
        status: "OK",
        messages: "Add Skills Success",
        data: req.body,
      });
    } catch (error) {
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
  // delete skills
  deleteSkills: async (req, res) => {
    try {
      const deleteId = req.params.id;

      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      const request = await model.users.findOne({
        where: { id },
      });

      if (!request.dataValues.skills[deleteId]) {
        throw {
          message: "Skills id not found",
          code: 400,
        };
      }

      let skills = request.dataValues.skills;

      skills = skills.filter((item, key) => key != deleteId);

      await model.users.update(
        { skills },
        {
          where: { id },
        }
      );

      res.status(200).json({
        status: "OK",
        messages: "Delete Skills Success",
        data: skills,
      });
    } catch (error) {
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
  // add job
  addJob: async (req, res) => {
    try {
      const requestBody = req.body;
      const { photo } = req?.files ?? {};

      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      const request = await model.users.findOne({
        where: { id },
      });

      const job_history = request?.dataValues?.job_history ?? [];

      let mimeType = photo.mimetype.split("/")[1];
      let allowFile = ["jpeg", "jpg", "png", "webp"];

      // cari apakah tipe data yang di upload terdapat salah satu dari list yang ada diatas
      if (!allowFile?.find((item) => item === mimeType)) {
        res.status(400).send({
          status: false,
          message: "Only accept jpeg, jpg, png, webp",
        });
      }

      // validate size image
      if (photo.size > 2000000) {
        res.status(400).send({
          status: false,
          message: "File to big, max size 2MB",
        });
      }

      const upload = await cloudinary.uploader.upload(photo.tempFilePath, {
        public_id: new Date().toISOString(),
      });

      const payload = {
        job_history: [
          ...job_history,
          ...[
            {
              id: uuidv4(),
              logo: upload?.secure_url,
              position: requestBody?.position,
              company: requestBody?.company,
              date: requestBody?.date,
              description: requestBody?.description,
            },
          ],
        ],
      };

      await model.users.update(payload, {
        where: { id },
      });

      res.status(200).json({
        status: "OK",
        messages: "Add new job",
        data: payload?.job_history,
      });
    } catch (error) {
      console.log(error);
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
  // delete job
  deleteJob: async (req, res) => {
    try {
      const deleteId = req.params.id;

      const authorization = req.headers.authorization.slice(6).trim();
      const { id } = jwt.verify(authorization, process.env.APP_SECRET_KEY);

      const request = await model.users.findOne({
        where: { id },
      });

      let job_history = request?.dataValues?.job_history ?? [];

      if (!job_history[deleteId]) {
        throw {
          message: "Job id not found",
          code: 400,
        };
      }

      job_history = job_history.filter((item) => item?.id != deleteId);

      await model.users.update(
        { job_history },
        {
          where: { id },
        }
      );

      res.status(200).json({
        status: "OK",
        messages: "Delete job Success",
        data: job_history,
      });
    } catch (error) {
      res.status(error?.code ?? 500).json({
        status: "ERROR",
        messages: error?.message ?? "Something wrong in our server",
        data: null,
      });
    }
  },
};
