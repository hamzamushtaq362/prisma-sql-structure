const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Response = require("./Response");

class Requests extends Response {
  // Create user
  createRequests = async (req, res) => {
    try {
      const {
        material_name,
        unit,
        released_qty,
        comments,
        status,
        current_department,
        siteId,
        qa_dept,
        account_dept,
        purchaser_dept,
        supervisor_dept,
        dept_history,
      } = req.body;

      // Check if the site exists
      const siteExists = await prisma.site.findUnique({
        where: { id: siteId },
      });

      if (!siteExists) {
        return this.sendResponse(req, res, {
          status: 404,
          message: "Site not found",
          data: null,
        });
      }

      // If the site exists, create the request
      const newRequest = await prisma.request.create({
        data: {
          material_name,
          unit,
          released_qty,
          comments,
          status,
          current_department,
          siteId,
          qa_dept: qa_dept ? { create: qa_dept } : undefined,
          account_dept: account_dept ? { create: account_dept } : undefined,
          purchaser_dept: purchaser_dept
            ? { create: purchaser_dept }
            : undefined,
          supervisor_dept: supervisor_dept
            ? { create: supervisor_dept }
            : undefined,
          dept_history: dept_history
            ? {
                create: dept_history.map((item) => ({
                  department_id: item.department_id,
                  user_id: item.user_id,
                  received_at: item.received_at,
                  forward_at: item.forward_at,
                })),
              }
            : undefined,
        },
      });

      return this.sendResponse(req, res, {
        status: 201,
        message: "Request created successfully",
        data: newRequest,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 400,
        message: "Failed to create request",
        error: error.message,
      });
    }
  };

  // Get all
  getRequests = async (req, res) => {
    try {
      const users = await prisma.request.findMany({
        include: {
          site: true, // Include related site
          qa_dept: true,
          account_dept: true,
          purchaser_dept: true,
          supervisor_dept: true,
          dept_history: true,
        },
      });

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

  // Get by ID
  getRequestById = async (req, res) => {
    try {
      const { id } = req.params;
      const request = await prisma.request.findUnique({
        where: { id: parseInt(id) },
        include: {
          site: true, // Include related site
          qa_dept: true,
          account_dept: true,
          purchaser_dept: true,
          supervisor_dept: true,
          dept_history: true,
        },
      });

      if (!request) {
        return this.sendResponse(req, res, {
          status: 404,
          message: "Request not found",
        });
      }

      return this.sendResponse(req, res, {
        status: 200,
        data: request,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        status: 500,
        message: "Error retrieving request",
        error: error.message,
      });
    }
  };

  // Update request
  updateRequest = async (req, res) => {
    try {
      const { id } = req.params;
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid requestId" });
      }

      // Check if the request exists
      const existingRequest = await prisma.request.findUnique({
        where: { id: requestId },
      });

      if (!existingRequest) {
        return res.status(404).json({ error: "Request not found for given ID" });
      }

      const {
        material_name,
        unit,
        released_qty,
        comments,
        status,
        current_department,
        siteId,
        qa_dept,
        account_dept,
        purchaser_dept,
        supervisor_dept,
        dept_history,
      } = req.body;

      const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: {
          material_name,
          unit,
          released_qty,
          comments,
          status,
          current_department,
          siteId,
          qa_dept: qa_dept ? { update: qa_dept } : undefined,
          account_dept: account_dept ? { update: account_dept } : undefined,
          purchaser_dept: purchaser_dept
            ? { update: purchaser_dept }
            : undefined,
          supervisor_dept: supervisor_dept
            ? { update: supervisor_dept }
            : undefined,
          dept_history: dept_history
            ? {
                create: dept_history.map((item) => ({
                  department_id: item.department_id,
                  user_id: item.user_id,
                  received_at: item.received_at,
                  forward_at: item.forward_at,
                })),
              }
            : undefined,
        },
      });

      return this.sendResponse(req, res, {
        status: 200,
        message: "Request updated",
        data: updatedRequest,
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

  // Delete request
  deleteRequest = async (req, res) => {
    try {
      const { id } = req.params;
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid requestId" });
      }

      // Check if the request exists
      const existingRequest = await prisma.request.findUnique({
        where: { id: requestId },
      });

      if (!existingRequest) {
        return res.status(404).json({ error: "Request not found for given ID" });
      }

      // First, delete related departments (if any)
      await prisma.qADept.deleteMany({ where: { requestId } });
      await prisma.accountDept.deleteMany({ where: { requestId } });
      await prisma.purchaserDept.deleteMany({ where: { requestId } });
      await prisma.supervisorDept.deleteMany({ where: { requestId } });
      await prisma.departmentHistory.deleteMany({ where: { requestId } });

      // Now delete the request
      const deletedRequest = await prisma.request.delete({
        where: { id: requestId },
      });

      return this.sendResponse(req, res, {
        status: 200,
        message: "Request deleted",
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
}

module.exports = Requests;
