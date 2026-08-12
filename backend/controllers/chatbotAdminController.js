const KBChunk = require('../models/KBChunk');
const IntentRoute = require('../models/IntentRoute');
const ChatLog = require('../models/ChatLog');
const SupportTicket = require('../models/SupportTicket');

// ==========================================
// KNOWLEDGE BASE (KBCHUNKS) CRUD
// ==========================================

exports.getKBChunks = async (req, res) => {
  try {
    const chunks = await KBChunk.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: chunks.length, data: chunks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createKBChunk = async (req, res) => {
  try {
    const { role, category, title, content, keywords } = req.body;
    const chunk = await KBChunk.create({
      role,
      category,
      title,
      content,
      keywords: Array.isArray(keywords) ? keywords : keywords ? keywords.split(',').map(s => s.trim()) : []
    });
    res.status(201).json({ success: true, data: chunk });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateKBChunk = async (req, res) => {
  try {
    const { role, category, title, content, keywords } = req.body;
    const formattedKeywords = Array.isArray(keywords)
      ? keywords
      : keywords
      ? keywords.split(',').map(s => s.trim())
      : [];

    const chunk = await KBChunk.findByIdAndUpdate(
      req.params.id,
      { role, category, title, content, keywords: formattedKeywords },
      { new: true, runValidators: true }
    );
    if (!chunk) {
      return res.status(404).json({ success: false, error: 'Knowledge Base segment not found' });
    }
    res.status(200).json({ success: true, data: chunk });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteKBChunk = async (req, res) => {
  try {
    const chunk = await KBChunk.findByIdAndDelete(req.params.id);
    if (!chunk) {
      return res.status(404).json({ success: false, error: 'Knowledge Base segment not found' });
    }
    res.status(200).json({ success: true, message: 'Knowledge Base segment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// INTENT ROUTE MAPPING CRUD
// ==========================================

exports.getIntentRoutes = async (req, res) => {
  try {
    const routes = await IntentRoute.find().sort({ intentName: 1 });
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createIntentRoute = async (req, res) => {
  try {
    const { intentName, route, buttonLabel } = req.body;
    const routeMapping = await IntentRoute.create({ intentName, route, buttonLabel });
    res.status(201).json({ success: true, data: routeMapping });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateIntentRoute = async (req, res) => {
  try {
    const { intentName, route, buttonLabel } = req.body;
    const routeMapping = await IntentRoute.findByIdAndUpdate(
      req.params.id,
      { intentName, route, buttonLabel },
      { new: true, runValidators: true }
    );
    if (!routeMapping) {
      return res.status(404).json({ success: false, error: 'Intent Route map not found' });
    }
    res.status(200).json({ success: true, data: routeMapping });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteIntentRoute = async (req, res) => {
  try {
    const routeMapping = await IntentRoute.findByIdAndDelete(req.params.id);
    if (!routeMapping) {
      return res.status(404).json({ success: false, error: 'Intent Route map not found' });
    }
    res.status(200).json({ success: true, message: 'Intent Route map deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// CHAT LOGS AUDIT
// ==========================================

exports.getChatLogs = async (req, res) => {
  try {
    const logs = await ChatLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200); // safety cap
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// SUPPORT TICKETS (HUMAN ESCALATIONS)
// ==========================================

exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email role')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { status, assignedAgentId } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (assignedAgentId) updateData.assignedAgent = assignedAgentId;

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('user', 'name email role')
      .populate('assignedAgent', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Support ticket not found' });
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
