const sendPushNotification = async (userId, title, message, data = {}) => {
  // In production, you would configure Firebase Admin SDK here.
  // We'll write a clean, simulated fallback that logs to terminal
  // and communicates over Socket.io if the user is connected.
  
  console.log(`[Notification Service] Triggered notification for User: ${userId}`);
  console.log(`Title: ${title}`);
  console.log(`Message: ${message}`);
  console.log('Payload Data:', data);
  
  // Real-time hook if socket.io references are added (we can trigger via Socket namespace)
  if (global.io) {
    global.io.to(userId.toString()).emit('notification', {
      title,
      message,
      data,
      timestamp: new Date()
    });
  }
  
  return true;
};

module.exports = { sendPushNotification };
