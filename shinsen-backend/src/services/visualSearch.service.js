const productController = require("../controllers/product.controller");

class VisualSearchService {
  /**
   * @param {Request} req
   * @param {Response} res
   */
  async processSearch(req, res) {
    return productController.visualSearch(req, res);
  }
}

module.exports = VisualSearchService;
