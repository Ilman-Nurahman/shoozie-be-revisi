import express from "express";
import cors from "cors";

import {
  loginUser,
  getProduct,
  getUsers,
  getUser,
  addUser,
  updateUserName,
  updateUserAddress,
  updateUserPhone,
  updateUserGender,
  updateUserBirthdate,
  getProductsByBrand,
  getProductsByUser,
  getBrands,
  addProduct,
  updateProductStatus,
  deleteProduct,
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavoriteProducts,
} from "./database.js";

const app = express();

// ✅ Tambahkan CORS
app.use(cors());

app.use(express.json());

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    res.status(200).json({
      message: "Login berhasil",
      user: user,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// get product
app.get("/product", async (req, res) => {
  const { id_brand } = req.query;
  const products = await getProductsByBrand(id_brand);
  res.json(products);
});

app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const product = await getProduct(id);
  res.send(product);
});

// post product
app.post("/product", async (req, res) => {
  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json({
      message: "Product berhasil ditambahkan",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Gagal menambahkan product" });
  }
});

// PATCH product status by id_product
app.patch("/product/:id/status", async (req, res) => {
  const id_product = req.params.id;
  const { product_status } = req.body;
  try {
    const result = await updateProductStatus(id_product, product_status);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product tidak ditemukan atau tidak terupdate" });
    }
    res.json({ success: true, message: "Product status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE product by id_product
app.delete("/product/:id", async (req, res) => {
  const id_product = req.params.id;
  try {
    const result = await deleteProduct(id_product);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product tidak ditemukan atau sudah dihapus" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// brands
app.get("/brands", async (req, res) => {
  try {
    const brands = await getBrands();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data brand" });
  }
});

// Get products by user ID
app.get("/products/user/:id_user", async (req, res) => {
  const id_user = req.params.id_user;
  try {
    const products = await getProductsByUser(id_user);
    res.json({
      success: true,
      data: products,
      message: "Products berhasil diambil"
    });
  } catch (error) {
    console.error("Error getting products by user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Gagal mengambil data products" 
    });
  }
});

// get users
app.get("/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  res.send(user);
});

app.post("/users", async (req, res) => {
  try {
    const newUser = await addUser(req.body);
    res.status(201).json({
      message: "User berhasil ditambahkan",
      user: newUser,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Gagal menambahkan user" });
  }
});

// patch user
app.patch("/users/:id", async (req, res) => {
  const id = req.params.id;
  const { username, address, contact, gender, birthday } = req.body;
  try {
    let result;
    if (username !== undefined) {
      result = await updateUserName(id, username);
    }
    if (address !== undefined) {
      result = await updateUserAddress(id, address);
    }
    if (contact !== undefined) {
      result = await updateUserPhone(id, contact);
    }
    if (gender !== undefined) {
      result = await updateUserGender(id, gender);
    }
    if (birthday !== undefined) {
      result = await updateUserBirthdate(id, birthday);
    }
    if (!result || result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "User tidak ditemukan atau tidak terupdate",
      });
    }
    res.send({ success: true, message: "User updated" });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

// Tambah ke favorit
app.post("/favorite", async (req, res) => {
  const { id_user, id_product } = req.body;
  try {
    await addFavorite(id_user, id_product);
    res.status(201).json({ success: true, message: "Ditambahkan ke favorit" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Hapus dari favorit
app.delete("/favorite", async (req, res) => {
  const { id_user, id_product } = req.body;
  try {
    await removeFavorite(id_user, id_product);
    res.json({ success: true, message: "Dihapus dari favorit" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cek status favorit
app.get("/favorite", async (req, res) => {
  const { id_user, id_product } = req.query;
  try {
    const fav = await isFavorite(id_user, id_product);
    res.json({ isFavorite: fav });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all favorite products for a user
app.get("/favorites", async (req, res) => {
  const { id_user } = req.query;
  try {
    const favorites = await getFavoriteProducts(id_user);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke 💩");
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server is running on port 8080");
});
