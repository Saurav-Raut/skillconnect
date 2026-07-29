import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Globe, Mic, VolumeX } from 'lucide-react';
import { MOCK_BOT_RESPONSES, FAQ_DATA } from '../utils/constants';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // en, hi, ta, te
  const [messages, setMessages] = useState([
    { sender: 'bot', key: 'greeting', original: MOCK_BOT_RESPONSES.en[0] }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when closed or unmounted
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Translate existing chat history when language changes
  useEffect(() => {
    setMessages(prev => prev.map(msg => {
      if (msg.key === 'greeting') return { ...msg, text: MOCK_BOT_RESPONSES[language][0] };
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
      
      // Broaden search to include the language name in the voice name (e.g., "Microsoft Hemant - Hindi")
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

  const handleSend = (textToSend = null, faqKey = null) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add user message
    const newMsg = { sender: 'user', text, original: text, key: faqKey };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    // Fetch response
    setTimeout(() => {
      let responseText = "";
      let botKey = faqKey;
      
      if (faqKey && FAQ_DATA[faqKey]) {
        responseText = FAQ_DATA[faqKey].a[language];
      } else {
        const languageResponses = MOCK_BOT_RESPONSES[language] || MOCK_BOT_RESPONSES.en;
        responseText = languageResponses[Math.floor(Math.random() * languageResponses.length)];
        botKey = 'mock'; // random unmapped
      }
      
      setMessages(prev => [...prev, { sender: 'bot', text: responseText, original: responseText, key: botKey }]);
      speakText(responseText);
    }, 600);
  };

  const triggerVoiceBooking = () => {
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
                {isSpeaking && <button onClick={stopSpeaking} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '3px 8px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><VolumeX size={12} /> Stop</button>}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>Multilingual Onboarding Helper</p>
            </div>
            <button onClick={toggleOpen} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
              <X size={18} />
            </button>
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
                {m.text || m.original}
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
