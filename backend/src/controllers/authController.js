import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/email.js';
import { generateVerificationCode } from '../utils/helper.js';

class AuthController {
  async signup(req, res) {
    try {
      const { email, firstName, lastName } = req.body;

      // Validate email is provided
      if (!email) {
        return res.status(400).json({ error: 'Email là bắt buộc' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email không hợp lệ' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email đã được đăng ký' });
      }

      const verificationCode = generateVerificationCode();
      // Mã xác thực hết hạn sau 24 giờ (thay vì 10 phút)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        verificationCode,
        codeExpiresAt: expiresAt.toISOString()
      });

      // Send email asynchronously - don't block the response
      sendVerificationEmail(email, verificationCode).catch(err => {
        console.error('Failed to send verification email:', err.message);
      });

      res.status(201).json({
        message: 'Mã xác thực đã được gửi đến email của bạn',
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message || 'Lỗi server khi đăng ký' });
    }
  }

  async signin(req, res) {
    try {
      const { email, verificationCode } = req.body;

      if (!email || !verificationCode) {
        return res.status(400).json({ error: 'Email và mã xác thực là bắt buộc' });
      }

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Email không tồn tại' });
      }

      // Kiểm tra hết hạn TRƯỚC kiểm tra mã
      const now = new Date();
      const expiresAt = new Date(user.codeExpiresAt);

      console.log(`[AUTH] Signin attempt - Email: ${email}`);
      console.log(`[AUTH] Current: ${now.toISOString()}, Expires: ${expiresAt.toISOString()}`);

      if (now > expiresAt) {
        console.warn(`[AUTH] ✗ Code expired for ${email}`);
        return res.status(401).json({ error: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã.' });
      }

      if (user.verificationCode !== verificationCode) {
        console.warn(`[AUTH] ✗ Invalid code for ${email}`);
        return res.status(401).json({ error: 'Mã xác thực không chính xác' });
      }

      await User.update(user.id, {
        verified: true,
        lastLogin: new Date().toISOString()
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
    }
  }

  async resendCode(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Email không tồn tại' });
      }

      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await User.update(user.id, {
        verificationCode,
        codeExpiresAt: expiresAt.toISOString()
      });

      await sendVerificationEmail(email, verificationCode);

      res.json({ message: 'Mã xác thực mới đã được gửi' });
    } catch (error) {
      console.error('Resend code error:', error);
      res.status(500).json({ error: 'Lỗi server khi gửi lại mã' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({ error: 'User không tồn tại' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
      }

      const user = await User.update(userId, updateData);

      res.json({
        message: 'Cập nhật hồ sơ thành công',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Lỗi server khi cập nhật hồ sơ' });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User không tồn tại' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }
}

export default new AuthController();