import mysql from "mysql2";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

// login
export async function loginUser(email, password) {
  const [rows] = await pool.query(`SELECT * FROM user WHERE email = ?`, [
    email,
  ]);
  const user = rows[0];

  if (!user) {
    throw new Error("Email tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Password salah");
  }

  delete user.password_hash;
  return user;
}

// Get Product
export async function getProducts() {
  const [rows] = await pool.query("SELECT * FROM product");
  return rows;
}

export async function getProduct(idProduct) {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM product
  WHERE id_product = ?
  `,
    [idProduct]
  );
  return rows[0];
}

export async function getProductsByBrand(id_brand) {
  if (!id_brand) {
    const [rows] = await pool.query("SELECT * FROM product");
    return rows;
  }
  const [rows] = await pool.query("SELECT * FROM product WHERE id_brand = ?", [
    id_brand,
  ]);
  return rows;
}

// Get User
export async function getUsers() {
  const [rows] = await pool.query("SELECT * FROM user");
  console.log("data user = ", rows);
  return rows;
}

export async function getUser(idUser) {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM user
  WHERE id_user = ?
  `,
    [idUser]
  );
  return rows[0];
}

export async function addUser(user) {
  const { username, gender, birthday, address, contact, email, password } =
    user;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert ke database
  const [result] = await pool.query(
    `
    INSERT INTO user (
      username, gender, birthday,
      address, contact, email, password_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [username, gender, birthday, address, contact, email, hashedPassword]
  );

  return {
    id_user: result.insertId,
    ...user,
    password: undefined,
  };
}

// Update User Name
export async function updateUserName(idUser, username) {
  const [result] = await pool.query(
    `UPDATE user SET username = ? WHERE id_user = ?`,
    [username, idUser]
  );
  return result;
}

// Update User Address
export async function updateUserAddress(idUser, address) {
  const [result] = await pool.query(
    `UPDATE user SET address = ? WHERE id_user = ?`,
    [address, idUser]
  );
  return result;
}

// Update User Phone Number
export async function updateUserPhone(idUser, contact) {
  const [result] = await pool.query(
    `UPDATE user SET contact = ? WHERE id_user = ?`,
    [contact, idUser]
  );
  return result;
}

// Update User Gender
export async function updateUserGender(idUser, gender) {
  const [result] = await pool.query(
    `UPDATE user SET gender = ? WHERE id_user = ?`,
    [gender, idUser]
  );
  return result;
}

// Update User Birthdate
export async function updateUserBirthdate(idUser, birthday) {
  const [result] = await pool.query(
    `UPDATE user SET birthday = ? WHERE id_user = ?`,
    [birthday, idUser]
  );
  return result;
}

// // Tambah ke favorit
// export async function addFavorite(idUser, idProduct) {
//   const [result] = await pool.query(
//     `INSERT INTO favorite (id_user, id_product) VALUES (?, ?)`,
//     [idUser, idProduct]
//   );
//   return result;
// }

// // Hapus dari favorit
// export async function removeFavorite(idUser, idProduct) {
//   const [result] = await pool.query(
//     `DELETE FROM favorite WHERE id_user = ? AND id_product = ?`,
//     [idUser, idProduct]
//   );
//   return result;
// }

// // Ambil semua id_product favorit user
// export async function getFavoriteProductIds(idUser) {
//   const [rows] = await pool.query(
//     `SELECT id_product FROM favorite WHERE id_user = ?`,
//     [idUser]
//   );
//   return rows;
// }

// // Ambil data favorit berdasarkan id_favorite (opsional)
// export async function getFavoriteById(idFavorite) {
//   const [rows] = await pool.query(
//     `SELECT * FROM favorite WHERE id_favorite = ?`,
//     [idFavorite]
//   );
//   return rows[0];
// }
