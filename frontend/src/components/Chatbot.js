import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquare, X, Send, Globe, Mic, Volume2, VolumeX } from 'lucide-react';
import { MOCK_BOT_RESPONSES, FAQ_DATA } from '../utils/constants';
import { LanguageContext } from '../contexts/LanguageContext';
import API from '../utils/api';

const Chatbot = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { t } = useContext(LanguageContext);

  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // en, hi, ta, te
  const [messages, setMessages] = useState([
    { sender: 'bot', key: 'greeting', text: 'Hello! I am your SkillConnect AI assistant. How can I help you today?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Speak out loud ONLY if voice mode is activated

  // Persistent session ID for auditing chat history
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('chatbot_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      sessionStorage.setItem('chatbot_session_id', id);
    }
    return id;
  });

  // Stop speech when closed or unmounted
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Load chat history from DB when widget is opened
  useEffect(() => {
    if (isOpen) {
      const loadHistory = async () => {
        try {
          const res = await API.get(`/chatbot/history/${sessionId}`);
          if (res.data.success && res.data.data.length > 0) {
            const historyMsgs = [];
            res.data.data.forEach(log => {
              historyMsgs.push({ sender: 'user', text: log.message });
              historyMsgs.push({
                sender: 'bot',
                text: log.botResponse,
                escalated: log.escalated
              });
            });
            setMessages(historyMsgs);
          }
        } catch (err) {
          console.warn('[Chatbot] Failed to fetch session history:', err.message);
        }
      };
      loadHistory();
    }
  }, [isOpen, sessionId]);

  // Translate local fallback components if language changes
  useEffect(() => {
    setMessages(prev => prev.map(msg => {
      if (msg.key === 'greeting') {
        const langGreeting = MOCK_BOT_RESPONSES[language] 
          ? MOCK_BOT_RESPONSES[language][0] 
          : 'Hello! I am your SkillConnect AI assistant. How can I help you today?';
        return { ...msg, text: langGreeting };
      }
      if (msg.key && FAQ_DATA[msg.key]) {
        if (msg.sender === 'user') return { ...msg, text: FAQ_DATA[msg.key].q[language] };
        if (msg.sender === 'bot') return { ...msg, text: FAQ_DATA[msg.key].a[language] };
      }
      return msg;
    }));
  }, [language]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-US';
      utterance.lang = targetLang;
      
      const voices = window.speechSynthesis.getVoices();
      const langName = language === 'hi' ? 'hindi' : language === 'ta' ? 'tamil' : language === 'te' ? 'telugu' : 'english';
      
      const matchingVoice = voices.find(v => 
        v.lang === targetLang || 
        v.lang.toLowerCase().replace('_', '-').startsWith(language) ||
        v.name.toLowerCase().includes(langName) ||
        (language === 'hi' && v.name.toLowerCase().includes('hi-in'))
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend = null, faqKey = null) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add user message to UI
    const userMsg = { sender: 'user', text, original: text, key: faqKey };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    try {
      // Connect to backend API
      const res = await API.post('/chatbot/message', {
        text,
        role: userInfo ? userInfo.role : 'guest',
        sessionId
      });

      const { replyText, routeButton, escalated } = res.data.data;

      // Add bot response to UI
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        original: replyText,
        routeButton,
        escalated
      }]);

      // Speak response ONLY if user used the voice mic or enabled the speaker icon
      if (voiceEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      console.error('[Chatbot Engine API Error]:', err.message);
      const fallbackReply = "Sorry, I am having trouble connecting to my database. Please try again shortly.";
      setMessages(prev => [...prev, { sender: 'bot', text: fallbackReply, original: fallbackReply }]);
    }
  };

  const triggerVoiceBooking = () => {
    setVoiceEnabled(true); // Automatically enable speaking when mic is pressed
    setIsRecording(true);
    speakText(language === 'hi' ? "मैं सुन रहा हूँ..." : "Listening...");
    
    setTimeout(() => {
      setIsRecording(false);
      const voiceCommand = language === 'hi' 
        ? "मुझे नलसाज (Plumber) बुक करना है" 
        : "I need to book an Electrician now";
      handleSend(`🎤 Voice Command: "${voiceCommand}"`);
    }, 3000);
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    stopSpeaking();
  };

  return (
    <>
      <button
        onClick={toggleOpen}
        className="btn"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', width: '64px', height: '64px',
          borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', zIndex: 999,
          transition: 'transform 0.2s', transform: isOpen ? 'scale(0)' : 'scale(1)'
        }}
      >
        <MessageSquare size={28} />
      </button>

      {isOpen && (
        <div className="fade-in" style={{
          position: 'fixed', bottom: '2rem', right: '2rem', width: '380px', height: '600px', maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 4rem)',
          zIndex: 999, display: 'flex', flexDirection: 'column', overflow: 'hidden', 
          background: 'var(--bg-card)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--line)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.2rem', background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                AI Assistant
                {isSpeaking && (
                  <button 
                    onClick={stopSpeaking} 
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '3px 8px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <VolumeX size={12} /> Stop
                  </button>
                )}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>Multilingual Onboarding Helper</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => {
                  if (voiceEnabled) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }} 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                title={voiceEnabled ? "Mute responses" : "Read responses out loud"}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button 
                onClick={toggleOpen} 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', gap: '8px', padding: '10px 16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
            <Globe size={16} color="var(--text-muted)" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ padding: '4px 8px', width: '100%', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-card)' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-main)',
                  color: m.sender === 'user' ? 'white' : 'var(--text-main)',
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  maxWidth: '85%',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--line)',
                  whiteSpace: 'pre-line'
                }}
              >
                <div>
                  {m.text || m.original}
                  {m.routeButton && (
                    <div style={{ marginTop: '12px' }}>
                      <Link 
                        to={m.routeButton.route}
                        onClick={() => setIsOpen(false)} // Close drawer on redirect navigation
                        style={{
                          display: 'inline-block',
                          textDecoration: 'none',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          borderRadius: '999px',
                          background: 'var(--primary)',
                          color: 'white',
                          fontWeight: 700,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      >
                        {m.routeButton.label}
                      </Link>
                    </div>
                  )}
                  {m.escalated && (
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 600 }}>
                      ⚠️ Ticket generated for Admin response
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Suggestions */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'var(--bg-main)', borderTop: '1px solid var(--line)' }}>
            {Object.entries(FAQ_DATA).map(([key, data]) => (
              <button 
                key={key} 
                onClick={() => handleSend(data.q[language], key)} 
                style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '999px', background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', cursor: 'pointer', transition: '0.2s' }} 
              >
                {data.q[language]}
              </button>
            ))}
          </div>

          {/* Form input */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={triggerVoiceBooking}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                backgroundColor: isRecording ? 'var(--danger)' : 'var(--bg-main)',
                color: isRecording ? 'white' : 'var(--primary)',
                animation: isRecording ? 'pulse 1s infinite' : 'none',
                border: '1px solid var(--line)'
              }}
            >
              <Mic size={20} />
            </button>
            <input
              type="text"
              placeholder={isRecording ? "Listening..." : "Ask a question..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '10px 16px', fontSize: '0.9rem', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--line)', color: 'var(--text-main)', outline: 'none' }}
              disabled={isRecording}
            />
            <button
              onClick={() => handleSend()}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              disabled={isRecording}
            >
              <Send size={18} style={{ marginLeft: '-2px' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
