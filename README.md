# 📚 LiteraTulip - Node.js Book Ordering Web App 🌷
A simple and efficient web application built with Node.js, Express, and MongoDB that allows users to browse, order, and manage books online.
> This web app was developed as a Midterm Project for SFT 208 - Web-based Programming Course by ARKA (Andrew, Runi, Kae, Alexa).

## 🚀 Features
🧾 User registration and login (with session-based authentication)  
📖 Browse available books  
💰 Applied Discounts to Registered Users  
🛒 Add books to cart and place orders  
💳 Payment simulation with order status tracking  
🗂 Admin dashboard to manage books, view orders, view Best-selling Books

## 🛠 Tech Stack
Backend: Node.js, Express.js  
Database: MongoDB + Mongoose  
Frontend: HTML, CSS, Bootstrap  
Authentication: Express-session

## 📂 Folder Structure
├── models/   # Mongoose schemas (User, Admin, Produk, Transaksi)  
├── routes/   # Express routes  
├── controllers/   # Business logic  
├── public/   # Frontend (CSS, JS, images)  
├── app.js    # Main server entry point  
├── package.json

## 🧪 Getting Started
git clone https://github.com/teresakae/LiteraTulip.git OR download and extract UTSPBW - ARKA (Final).zip  
npm init -y  
npm install  
npm start  
Visit http://localhost:3000 to explore the app.

✅ Future Improvements
* More book attributes (descriptions, category, authors, publishers, etc.)  
* Integration with real payment gateways  
* Search features, more dynamic UI, filtering
