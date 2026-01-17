const vendorService = require('../services/vendor.service');

class VendorController {
  async create(req, res, next) {
    try {
      const userId = req.user?.userId;
      const vendor = await vendorService.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const result = await vendorService.findAll(req.query);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const vendor = await vendorService.findById(req.params.id);
      res.json({
        success: true,
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.user?.userId;
      const vendor = await vendorService.update(req.params.id, req.body, userId);
      res.json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await vendorService.delete(req.params.id);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VendorController();
