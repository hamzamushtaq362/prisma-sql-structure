const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Response = require("./Response");

class Site extends Response {
  // Create a new site
  create = async (req, res) => {
    try {
      const {
        name,
        address,
        client_name,
        city,
        province,
        plot_size,
        status,
        updated_by,
        supervisors,
        purchasers,
      } = req.body;

      // ✅ Check if the logged-in user is admin
      const requestingUser = await prisma.user.findUnique({
        where: { id: req.user?.id }, // assumes user ID is stored in req.user
      });

      if (!requestingUser || requestingUser.role !== "admin") {
        return this.sendResponse(req, res, {
          message: "Only admins can create sites",
          status: 403,
        });
      }

      const site = await prisma.site.create({
        data: {
          name,
          address,
          client_name,
          city,
          province,
          plot_size,
          status,
          updated_by: requestingUser?.id,
          supervisors: {
            create: supervisors.map((supervisor) => ({
              status: supervisor.status,
              userId: supervisor.ids, // assuming 'ids' is an array of user IDs
            })),
          },
          purchasers: {
            create: purchasers.map((purchaser) => ({
              status: purchaser.status,
              material_type: purchaser.material_type,
              userId: purchaser.ids, // assuming 'ids' is an array of user IDs
            })),
          },
        },
      });

      return this.sendResponse(req, res, {
        message: "Site created successfully",
        status: 201,
        data: site,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        message: "Something went wrong while creating site",
        status: 500,
      });
    }
  };

  // Get all sites
  getAll = async (req, res) => {
    try {
      const sites = await prisma.site.findMany({
        include: {
          supervisors: {
            include: {
              user: true, // to get user details of the supervisor
            },
          },
          purchasers: {
            include: {
              user: true, // to get user details of the purchaser
            },
          },
          updatedByUser: true,
        },
      });

      return this.sendResponse(req, res, {
        message: "Sites fetched successfully",
        status: 200,
        data: sites,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        message: "Failed to fetch sites",
        status: 500,
      });
    }
  };

  // Get site by IDs
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const site = await prisma.site.findUnique({
        where: { id: parseInt(id) },
        include: {
          supervisors: {
            include: {
              user: true, // to get user details of the supervisor
            },
          },
          purchasers: {
            include: {
              user: true, // to get user details of the purchaser
            },
          },
          updatedByUser: true,
        },
      });

      if (!site) {
        return this.sendResponse(req, res, {
          message: "Site not found",
          status: 404,
        });
      }

      return this.sendResponse(req, res, {
        message: "Site fetched successfully",
        status: 200,
        data: site,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        message: "Failed to fetch site",
        status: 500,
      });
    }
  };

  // Update site
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const siteId = parseInt(id, 10);
      const {
        name,
        address,
        client_name,
        city,
        province,
        plot_size,
        status,
        updated_by,
        supervisors,
        purchasers,
      } = req.body;

      // Fetch the site to ensure it exists
      const existingSite = await prisma.site.findUnique({
        where: { id: parseInt(id) },
      });
      if (!existingSite) {
        return this.sendResponse(req, res, {
          message: "Site not found",
          status: 404,
        });
      }

      // Update the site details
      const updatedSite = await prisma.site.update({
        where: { id: parseInt(id) },
        data: {
          name,
          address,
          client_name,
          city,
          province,
          plot_size,
          status,
          updated_by,
          updated_at: new Date(),
        },
      });

      // OPTIONAL: Clear and re-create supervisor relations
      if (supervisors) {
        // Delete old
        await prisma.supervisorOnSite.deleteMany({ where: { siteId } });
        // Create new
        await prisma.supervisorOnSite.createMany({
          data: supervisors.map((s) => ({
            siteId,
            userId: s.userId,
            status: s.status,
          })),
        });
      }

      // OPTIONAL: Clear and re-create purchaser relations
      if (purchasers) {
        await prisma.purchaserOnSite.deleteMany({ where: { siteId } });
        await prisma.purchaserOnSite.createMany({
          data: purchasers.map((p) => ({
            siteId,
            userId: p.userId,
            status: p.status,
            material_type: p.material_type,
          })),
        });
      }

      return this.sendResponse(req, res, {
        message: "Site updated successfully",
        status: 200,
        data: updatedSite,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        message: "Failed to update site",
        status: 500,
      });
    }
  };

  // Delete site
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const siteId = parseInt(id, 10);

      // Delete related supervisors and purchasers first
      await prisma.supervisorOnSite.deleteMany({ where: { siteId } });
      await prisma.purchaserOnSite.deleteMany({ where: { siteId } });

      // Delete the site
      await prisma.site.delete({
        where: { id: parseInt(id) },
      });

      return this.sendResponse(req, res, {
        message: "Site deleted successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        message: "Failed to delete site",
        status: 500,
      });
    }
  };
}

module.exports = Site;
