const express = require("express");
const connection = require("../connection");
const checkRole = require("../services/checkRole");
const router = express.Router();
var auth = require("../services/authentication");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  const product = req.body;
  query =
    "insert into product (name, categoryId, description, price, status) values(?, ?,? ,?, 'true')";
  connection.query(
    query,
    [product.name, product.categoryId, product.description, product.price],
    (err, results, next) => {
      if (!err) {
        return res.status(200).json({ message: "Product added successfully" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

router.get("/get", auth.authenticateToken, (req, res) => {
  var query =
    "select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    }
    return res.status(500).json(err);
  });
});

router.get("/getByCategory/:id", auth.authenticateToken, (req, res) => {
  let category = req.params.id;
  console.log(category);

  query = "select id,name from product where categoryId=? and status = 'true'";
  connection.query(query, [category], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/getById/:id", auth.authenticateToken, (req, res) => {
  const id = req.params.id;
  query = "select id,name,description, price from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(500).json(200);
    }
  });
});

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const product = req.body;
    console.log(product);
    
    query =
      "update product set name=?,categoryId=?,description=?,price=? where id=?";
    connection.query(
      query,
      [
        product.name,
        product.categoryId,
        product.description,
        product.price,
        product.id,
      ],
      (err, results) => {
        if (!err) {
          if (results.affectedRows == 0) {
            return res.status(404).json({ message: "id does not found" });
          }
          return res
            .status(200)
            .json({ message: "product updated successfully" });
        } else {
          return res.status(500).json(err);
        }
      }
    );
  }
);

router.delete(
  "/delete/:id",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res, next) => {
    const id = req.params.id;
    query = "delete from product where id=?";
    connection.query(query, [id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Id not found" });
        }
        return res.status(200).json({ message: "data deleted successfully!" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.patch('/updateStatus', auth.authenticateToken, (req, res)=>{
    let updateStatusData = req.body
    query = "update product set status=? where id=?";
    connection.query(query, [updateStatusData.status, updateStatusData.id], (err, results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({ message: 'product id does not found'});
            }
             return res.status(200).json({message: 'status updated successfully'});
        }else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;
