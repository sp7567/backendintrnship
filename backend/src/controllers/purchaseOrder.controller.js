const purchaseOrderService = require('../services/purchaseOrder.service');

class PurchaseOrderController {
  async create(req, res, next) {
    try {
      const userId = req.user?.userId;
      const purchaseOrder = await purchaseOrderService.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase Order created successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const result = await purchaseOrderService.findAll(req.query);
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
      const purchaseOrder = await purchaseOrderService.findById(req.params.id);
      res.json({
        success: true,
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const userId = req.user?.userId;
      const purchaseOrder = await purchaseOrderService.updateStatus(
        req.params.id,
        req.body.status,
        userId
      );
      res.json({
        success: true,
        message: 'Purchase Order status updated successfully',
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await purchaseOrderService.delete(req.params.id);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PurchaseOrderController();
