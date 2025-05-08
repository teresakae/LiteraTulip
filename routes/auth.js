const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

router.get('/check-login', async (req, res) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select('username');
            if (!user) {
                return res.json({ isLoggedIn: true }); 
            }
            return res.json({ isLoggedIn: true, user: { name: user.username } });
        } catch (err) {
            console.error("Error fetching user:", err);
            return res.json({ isLoggedIn: true }); 
        }
    } else {
        return res.json({ isLoggedIn: false });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid'); 
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  
module.exports = router;