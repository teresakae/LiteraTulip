    // server.js

    // Load environment variables from .env file
    require("dotenv").config();

    const express = require("express");
    const mongoose = require("mongoose");
    const cors = require("cors");
    const sessionMiddleware = require("./middlewares/session");
    const bodyParser = require("body-parser");
    const http = require("http");
    const socketIo = require("socket.io");
    const path = require("path");

    // Models (pastikan jalur ini benar berdasarkan struktur folder Anda)
    const Message = require("./models/message");
    const CustomerServiceMessage = require("./models/customer-service");
    const User = require('./models/user');
    const Admin = require('./models/admin');

    // Gemini AI Integration
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    // Pastikan API Key tersedia
    if (!process.env.GEMINI_API_KEY) {
        console.error("ERROR: GEMINI_API_KEY tidak diatur di file .env Anda.");
        console.error("Pastikan Anda membuat file .env di root proyek dan mengisinya dengan kunci API yang valid.");
        process.exit(1); // Keluar dari aplikasi jika API Key tidak ada
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // MENGGUNAKAN MODEL 'gemini-2.0-flash' SECARA LANGSUNG
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


    const app = express();
    const server = http.createServer(app);
    const PORT = process.env.PORT || 3000;

    // Configure CORS for Express and Socket.IO
    const corsOptions = {
      origin: `http://localhost:${PORT}`, // Atau domain frontend Anda
      credentials: true
    };

    const io = socketIo(server, { cors: corsOptions });

    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, "public")));

    // Middleware untuk sesi
    app.use(sessionMiddleware);

    // Middleware untuk melampirkan user dari sesi ke req (untuk rute HTTP)
    const attachUser = async (req, res, next) => {
      if (req.session.userId && !req.session.isAdmin) {
        try {
          req.user = await User.findById(req.session.userId).select("-password");
        } catch (error) {
          console.error("Error fetching user from session:", error);
        }
      }
      next();
    };
    app.use(attachUser);

    // Helper function to format messages
    function formatMessage(username, message, userId, timestamp = new Date(), isAI = false) { // <-- TAMBAHKAN isAI
      return {
        username,
        message,
        userId,
        timestamp: timestamp.toISOString(),
        isAI // <-- TAMBAHKAN isAI
      };
    }

    // Function to handle AI queries
    async function handleAiQuery(query, room = null) {
      try {
        const prompt = query.replace("@ai", "").trim();
        if (!prompt) {
            // Jika prompt kosong, kirim pesan error ke klien
            const errorMessage = formatMessage("Asisten AI", "Mohon berikan pertanyaan setelah @ai. Contoh: @ai rekomendasikan buku fiksi.", "ai-bot-id", new Date(), true); // <-- isAI true
            if (room) {
                io.to(room).emit("chat message", errorMessage);
            } else {
                io.emit("chat message", errorMessage);
            }
            return;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const aiBotName = "Asisten AI";
        const aiBotId = "ai-bot-id"; // ID yang konsisten untuk bot AI

        // --- PERUBAHAN DI SINI: SIMPAN RESPON AI KE DATABASE ---
        const aiMessage = new Message({
            username: aiBotName,
            message: text,
            userId: aiBotId, // Gunakan ID khusus untuk AI
            isAI: true // <-- Tandai sebagai pesan AI
        });
        await aiMessage.save(); // Simpan pesan AI ke database

        // Kirim pesan AI yang sudah disimpan ke semua klien
        io.emit("chat message", formatMessage(aiMessage.username, aiMessage.message, aiMessage.userId, aiMessage.timestamp, aiMessage.isAI));
        // --- AKHIR PERUBAHAN ---

        console.log(`Respons AI untuk "${query}": ${text}`);
      } catch (error) {
        console.error("Error saat menghasilkan respons AI:", error);
        // Kirim pesan error ke klien jika ada masalah dengan AI
        const errorMessage = formatMessage("Asisten AI", "Maaf, saya tidak bisa memproses permintaan Anda saat ini. Error: " + error.message, "ai-bot-id", new Date(), true); // <-- isAI true
        if (room) {
            io.to(room).emit("chat message", errorMessage);
        } else {
            io.emit("chat message", errorMessage);
        }
      }
    }

    // === Public Group Chat ===

    // PENTING: Lampirkan middleware sesi ke instance Socket.IO utama
    io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    io.on("connection", async (socket) => {
      // Verifikasi sesi setelah middleware sesi dilewatkan
      const session = socket.request.session;
      
      if (!session || !session.userId || !session.username) {
        console.warn("Koneksi Obrolan Publik: Tidak ada sesi yang valid ditemukan. Pengguna mungkin belum login. Mereka dapat melihat obrolan tetapi tidak dapat mengirim pesan yang disimpan/diatribusikan kepada mereka.");
      }

      try {
        const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
        // Format timestamp untuk pesan lama juga
        const formattedMessages = messages.map(msg => ({ 
            username: msg.username,
            message: msg.message,
            userId: msg.userId ? msg.userId.toString() : null,
            timestamp: new Date(msg.timestamp).toLocaleString(),
            isAI: msg.isAI || false // <-- Pastikan isAI disertakan
        }));
        socket.emit("chat history", formattedMessages);
      } catch (error) {
        console.error("Error saat memuat riwayat obrolan publik:", error);
        socket.emit("chat history", []);
      }

      socket.on("chat message", async (msg) => {
        const currentSession = socket.request.session;
        
        if (currentSession && currentSession.userId && currentSession.username) {
          // Selalu simpan dan siarkan pesan pengguna
          const newMessage = new Message({ 
              username: currentSession.username, 
              message: msg, 
              userId: currentSession.userId,
              isAI: false // <-- Pesan pengguna bukan AI
          });
          await newMessage.save();
          
          // Kirim pesan pengguna ke semua klien yang terhubung ke namespace utama
          io.emit("chat message", formatMessage(newMessage.username, newMessage.message, newMessage.userId, newMessage.timestamp, newMessage.isAI));

          // Jika pesan ditujukan untuk AI, panggil handleAiQuery SETELAH pesan pengguna disiarkan
          if (msg.trim().toLowerCase().startsWith("@ai")) {
            handleAiQuery(msg.trim());
          }
        } else {
          console.warn("Upaya untuk mengirim pesan obrolan publik tanpa sesi yang valid.");
          socket.emit("chat message", formatMessage("Sistem", "Anda harus login untuk mengirim pesan.", "system-bot-id", new Date(), false)); // <-- isAI false
        }
      });

      socket.on("disconnect", () => {
        const currentSession = socket.request.session;
        if (currentSession && currentSession.username) {
            console.log(`Pengguna ${currentSession.username} terputus dari obrolan publik.`);
        } else {
            console.log('Pengguna anonim terputus dari obrolan publik.');
        }
      });
    });

    // === Obrolan Layanan Pelanggan (Customer Service Chat) ===
    const csChat = io.of("/customer-service");
    const connectedUsers = {};
    const adminSockets = new Set();
    const ADMIN_ROOM = 'admins_on_duty'; 

    csChat.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    csChat.on("connection", (socket) => {
      const session = socket.request.session;
      
      if (!session || !session.userId) {
        console.error("Koneksi Obrolan CS ditolak: Tidak ada sesi atau userId ditemukan.");
        return socket.disconnect();
      }

      const { userId, username, isAdmin } = session;
      
      if (isAdmin) {
        adminSockets.add(socket.id);
        socket.join(ADMIN_ROOM);
        console.log(`✅ Admin ${username || userId} terhubung ke obrolan CS.`);
        socket.emit("user list", Object.values(connectedUsers));
      } else {
        const userData = { socketId: socket.id, username, userId };
        connectedUsers[userId] = userData;
        console.log(`Pengguna ${username} terhubung ke obrolan CS.`);
        csChat.to(ADMIN_ROOM).emit("user connected", userData);
        socket.join(`room_${userId}`);
      }

      socket.on("load chat history", async ({ targetUserId }) => {
        const idToLoad = isAdmin ? targetUserId : userId;
        if (!idToLoad) return;
        try {
          const messages = await CustomerServiceMessage.find({
            $or: [
              { sender: idToLoad, receiverModel: isAdmin ? 'User' : { $exists: true } },
              { receiver: idToLoad, senderModel: isAdmin ? 'User' : { $exists: true } }
            ],
          }).sort({ timestamp: 1 }).populate('sender', 'username').populate('receiver', 'username');
          socket.emit("chat history", messages);
        } catch (err) {
          console.error("Error saat memuat riwayat obrolan:", err);
        }
      });

      socket.on("private message", async (data) => {
        const { receiverId, content } = data;
        try {
          let savedMessage;
          if (isAdmin && receiverId) {
            savedMessage = new CustomerServiceMessage({ sender: userId, senderModel: 'Admin', receiver: receiverId, receiverModel: 'User', content });
            await savedMessage.save();
            const populatedMessage = await CustomerServiceMessage.findById(savedMessage._id).populate(['sender', 'receiver']);
            csChat.to(`room_${receiverId}`).emit("private message", populatedMessage);
            csChat.to(ADMIN_ROOM).emit("private message", populatedMessage);
          } else if (!isAdmin) {
            savedMessage = new CustomerServiceMessage({ sender: userId, senderModel: 'User', receiver: null, receiverModel: 'Admin', content });
            await savedMessage.save();
            const populatedMessage = await CustomerServiceMessage.findById(savedMessage._id).populate('sender');
            socket.emit("private message", populatedMessage);
            csChat.to(ADMIN_ROOM).emit("private message", populatedMessage);
          }
        } catch (err) {
          console.error("Gagal menyimpan atau mengirim pesan pribadi:", err);
        }
      });

      socket.on("disconnect", () => {
        if (isAdmin) {
          adminSockets.delete(socket.id);
          console.log(`Admin ${username || userId} terputus dari obrolan CS.`);
        } else if (userId) {
          csChat.to(ADMIN_ROOM).emit("user disconnected", { userId: userId });
          delete connectedUsers[userId];
          console.log(`Pengguna ${username} terputus dari obrolan CS.`);
        }
      });
    });


    // === Pengaturan Server ===
    mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uts_pbw")
      .then(() => console.log("Terhubung ke MongoDB"))
      .catch((err) => console.error("Error MongoDB:", err));

    // Routes
    const adminRoutes = require("./routes/admin");
    const userRoutes = require("./routes/user");
    const authRoutes = require("./routes/auth");
    const productRoutes = require("./routes/product");
    const transaksiRoutes = require("./routes/transaksi");
    const webRoutes = require("./routes/web");

    app.use("/api", adminRoutes);
    app.use("/api", userRoutes);
    app.use("/api", authRoutes);
    app.use("/api", productRoutes);
    app.use("/api", transaksiRoutes);
    app.use("/", webRoutes);

    app.get("/", (req, res) => res.send("API sedang berjalan"));

    server.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
    