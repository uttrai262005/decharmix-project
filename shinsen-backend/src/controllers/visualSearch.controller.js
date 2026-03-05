const VisualSearchService = require("../services/visualSearch.service");

const visualSearchController = async (req, res) => {
  try {
    const service = new VisualSearchService();
    return await service.processSearch(req, res);
  } catch (error) {
    console.error("VisualSearchController error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  visualSearchController,
};
