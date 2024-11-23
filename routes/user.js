const express = require("express");
const connection = require("../connection");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/signup", (req, res) => {
  let user = req.body;  
  query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], (err, result) => {
    if (!err) {
      if (result.length <= 0) {
        query =
          "insert into user(name, contactNumber, email, password, status, role) values(?, ?, ?, ?, 'false', 'user')";
        connection.query(
          query,
          [
            user.name,
            user.contactNumber,
            user.email,
            user.password,
            user.status,
            user.role,
          ],
          (err, result) => {
            if (!err) {
              return res.status(200).json({
                message: "Successfully Registered!",
              });
            } else {
              return res.status(404).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Email is already exits!" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;
  query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res.status(401).json({
          message: "incorrect username or password",
        });
      } else if (results[0].status === "false") {
        return res.status(401).json({ message: "Wait for admin approval" });
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ accessToken });
      } else {
        return res
          .status(400)
          .json({ message: "something went wrong. Please try again" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  query = "select email, password from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        res
          .status(200)
          .json({ message: "Password sent successfully to your email" });
      } else {
        var mailOption = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Password by cafe Management System",
          html:
            "<p><b> Your login details for cafe management system</b><br> <b>Email:</b>" +
            results[0].email +
            "<br><b>Password:</b>" +
            results[0].password +
            "</p>",
        };
        transporter.sendMail(mailOption, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent:" + info.response);
          }
        });
        res
          .status(200)
          .json({ message: "Password sent successfully to your email" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  var query =
    "select id, name, contactNumber, email, status from user where role = 'user'";
  connection.query(query, (err, result) => {
    if (!err) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const user = req.body;
    const query = "UPDATE user SET status = ? WHERE id = ?";
    connection.query(query, [user.status, user.id], (err, result) => {
      if (!err) {
        if (results.affectedRow == 0) {
          return res.status(404).json({ message: "status is not updated" });
        }
        return res.status(200).json({ message: "status updated" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  query = "select * from user where email=? and password=?";
  connection.query(query, [email, user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Incorrect old password" });
      } else if (results[0].password == user.oldPassword) {
        query = "update user set password=? where email=?";
        connection.query(query, [user.newPassword, email], (err, results) => {
          if (!err) {
            return res
              .status(200)
              .json({ message: "password updated successfully" });
          } else {
            return res.status(500).json(err);
          }
        });
      } else {
        return res.status(400).json("something went wrong");
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
