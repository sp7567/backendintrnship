const paymentService = require('../services/payment.service');

class PaymentController {
  async create(req, res, next) {
    try {
      const userId = req.user?.userId;
      const payment = await paymentService.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const result = await paymentService.findAll(req.query);
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
      const payment = await paymentService.findById(req.params.id);
      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async voidPayment(req, res, next) {
    try {
      const userId = req.user?.userId;
      const payment = await paymentService.voidPayment(req.params.id, userId);
      res.json({
        success: true,
        message: 'Payment voided successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await paymentService.delete(req.params.id);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
