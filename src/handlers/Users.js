const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Response = require("./Response");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class Users extends Response {
  // Create user
  createUser = async (req, res) => {
    try {
      const { name, email, password, ...rest } = req.body;
      //
      const hashedPassword = await bcrypt.hash(password, 10);
      
      //
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          ...rest,
        },
      });
      return this.sendResponse(req, res, {
        status: 201,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 400,
        message: "User creation failed",
        error: error.message,
      });
    }
  };

  // Get all users
  getUsers = async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      return this.sendResponse(req, res, {
        status: 200,
        data: users,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 500,
        message: "Could not retrieve users",
        error: error.message,
      });
    }
  };

  // Get single user by ID
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return this.sendResponse(req, res, {
          status: 404,
          message: "User not found",
        });
      }

      return this.sendResponse(req, res, {
        status: 200,
        data: user,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 500,
        message: "Error retrieving user",
        error: error.message,
      });
    }
  };

  // Update user
  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: req.body,
      });

      return this.sendResponse(req, res, {
        status: 200,
        message: "User updated",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 400,
        message: "Update failed",
        error: error.message,
      });
    }
  };

  // Delete user
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      return this.sendResponse(req, res, {
        status: 200,
        message: "User deleted",
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 400,
        message: "Deletion failed",
        error: error.message,
      });
    }
  };

  // Sign in
  signIn = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        return this.sendResponse(req, res, {
          status: 400,
          message: "Email and password are required",
        });
      }

      // Find the user by email
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return this.sendResponse(req, res, {
          status: 401,
          message: "Invalid email or password",
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return this.sendResponse(req, res, {
          status: 401,
          message: "Invalid email or password",
        });
      }

      // Create token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Send response
      return this.sendResponse(req, res, {
        status: 200,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      return this.sendResponse(req, res, {
        status: 500,
        message: "Internal server error",
      });
    }
  };
}

module.exports = Users;
