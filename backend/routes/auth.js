const router = require('express').Router();
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/token');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// ─── Helper: generate random hex token ───
const generateCryptoToken = () => crypto.randomBytes(32).toString('hex');

// ─────────────────────────────────────────────────────────────
// @POST /api/auth/register — with email verification
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, sellerInfo } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Input validation
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ success: false, message: 'Name must be 2-50 characters' });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ success: false, message: 'Password must be 6-100 characters' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Duplicate check
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    // Generate verification token
    const verificationToken = generateCryptoToken();

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      sellerInfo: role === 'seller' ? sellerInfo : undefined,
      isEmailVerified: false,           // New users must verify
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't fail registration if email fails — user can resend
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true,
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @GET /api/auth/verify-email/:token
// ─────────────────────────────────────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @POST /api/auth/resend-verification
// ─────────────────────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = generateCryptoToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.json({ success: true, message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpiry');
    if (!user) {
      // Don't reveal whether user exists or not (security)
      return res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const resetToken = generateCryptoToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry +password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    }

    user.password = password;  // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @POST /api/auth/login
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        sellerInfo: user.sellerInfo,
      },
      token,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @GET /api/auth/me
// ─────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address,
      sellerInfo: req.user.sellerInfo,
      isActive: req.user.isActive,
      isEmailVerified: req.user.isEmailVerified,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @PUT /api/auth/profile — update user profile
// ─────────────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    // Update name
    if (req.body.name) user.name = req.body.name;

    // Update phone
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    // Update address
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street || '',
        city: req.body.address.city || user.address?.city || '',
        state: req.body.address.state || user.address?.state || '',
        pincode: req.body.address.pincode || user.address?.pincode || '',
      };
    }

    // Change password (requires current password)
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      if (req.body.newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      user.password = req.body.newPassword;
    }

    // Seller info
    if (req.body.sellerInfo) {
      user.sellerInfo = req.body.sellerInfo;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        sellerInfo: user.sellerInfo,
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;