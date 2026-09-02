# E-Commerce App

A modern, responsive e-commerce web application for browsing products, discovering new items, and managing an online store through an admin dashboard.

## ✨ Features

### 🛍️ Shopping Experience

* Browse products
* Search products
* Filter and sort products
* Browse product categories
* View product details
* View product images, prices, and descriptions
* Save favorite products
* Responsive shopping experience

### 🎥 Product Feed

A short-form video feed for discovering products through engaging content.

* Browse product videos
* Discover new products
* View product information from feed content
* Scroll through videos in a reels-style experience

### 🧠 Prompt Library

A built-in collection of AI prompts that can help create better product images and marketing content.

Prompts can be organized into categories and managed through the admin dashboard.

### 🔐 Admin Dashboard

The admin dashboard provides control over the application's content and products.

Administrators can manage:

* Products
* Categories
* Product images
* Prices
* Availability
* Feed posts
* Videos
* Prompt Library
* Store content

The goal is for the application to be **fully manageable through the admin dashboard instead of relying on hardcoded content.**

---

## 🏗️ Tech Stack

* **React**
* **TypeScript**
* **Supabase**
* **PostgreSQL**
* **Supabase Auth**
* **Supabase Storage**
* **Tailwind CSS**

---

## 📁 Main Features

```text
E-Commerce App
│
├── 🏠 Home
├── 🛍️ Products
├── 🔎 Search
├── 🗂️ Categories
├── ❤️ Favorites
├── 🎥 Feed
├── 🧠 Prompt Library
├── 📦 Product Details
└── ⚙️ Admin
    ├── Products
    ├── Categories
    ├── Feed
    ├── Prompt Library
    └── Store Management
```

---

## 🔑 Admin

The admin panel is accessible through:

```text
/login
```

The admin dashboard is used to manage the application's products and content.

All important customer-facing data should ultimately come from the database so that administrators can update the storefront without modifying the source code.

---

## 🗄️ Database

Supabase is used as the application's backend and database.

The database stores application data such as:

* Products
* Categories
* Feed posts
* Prompt Library content
* Store information
* User and authentication data

Row Level Security (RLS) is used to protect sensitive operations and administrative data.

---

## 📱 Responsive Design

The application is designed to work across:

* Mobile
* Tablet
* Desktop

The interface focuses on a clean, modern shopping experience with fast product discovery and intuitive navigation.

---

## 🚧 Project Status

The application is currently under active development.

Current development focuses on:

* Completing the e-commerce experience
* Connecting all features to Supabase
* Improving the admin dashboard
* Making all storefront content manageable from the admin panel
* Polishing the UI and responsive experience
* Improving product discovery and the video feed

---

## 🎯 Goal

Build a modern, simple, and engaging e-commerce experience where customers can easily discover products and administrators can manage the entire store from one place.

---

## 📄 License

This project is currently private and under development.
