const ChatLog = require('../models/ChatLog');
const SupportTicket = require('../models/SupportTicket');
const { processChatbotMessage } = require('../utils/chatbotEngine');

/**
 * Handle incoming user chatbot message
 */
exports.handleMessage = async (req, res) => {
  try {
    const { text, role, sessionId } = req.body;
    if (!text || !sessionId) {
      return res.status(400).json({ success: false, error: 'Text and sessionId are required' });
    }

    const userDoc = req.user || null;
    const userRole = role || (userDoc ? userDoc.role : 'guest');

    const engineResult = await processChatbotMessage({
      text,
      userDoc,
      userRole,
      sessionId,
      uiLanguage: req.body.uiLanguage
    });

    // Save to conversation audit log
    await ChatLog.create({
      sessionId,
      user: userDoc ? userDoc._id : null,
      role: userRole,
      message: text,
      detectedLanguage: engineResult.detectedLanguage,
      detectedIntent: engineResult.detectedIntent,
      botResponse: engineResult.replyText,
      escalated: engineResult.escalate
    });

    // Create Support Ticket if escalation is flagged and user is logged in
    if (engineResult.escalate && userDoc) {
      const existingTicket = await SupportTicket.findOne({ sessionId, status: 'open' });
      if (!existingTicket) {
        await SupportTicket.create({
          sessionId,
          user: userDoc._id,
          issueSummary: text,
          status: 'open'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        replyText: engineResult.replyText,
        intent: engineResult.detectedIntent,
        routeButton: engineResult.routeButton,
        escalated: engineResult.escalate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Fetch chat log history for a specific session ID
 */
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const logs = await ChatLog.find({ sessionId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
