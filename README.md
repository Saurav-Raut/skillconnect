# SkillConnect

SkillConnect is a decentralized marketplace for skilled workers and households, featuring live GPS tracking and escrow payments.

## Production Deployment Notes

### Backend on Render (Free Tier)
This project is currently deployed on Render's Free Tier. 

**Important Note on Cold Starts:**
Render automatically spins down free web services after 15 minutes of inactivity. When you visit the app after a period of inactivity, the very first API request or Socket.io connection may take **30-50 seconds** to respond. 

*If the app appears frozen or stuck on a loading spinner during initial visit, please wait a minute! This is a known Render limitation, not a bug in the code.*

**Recommendations:**
1. Upgrade to a paid "Starter" instance on Render ($7/mo) to prevent sleeping entirely.
2. Alternatively, set up a free uptime monitor (like [UptimeRobot](https://uptimerobot.com)) to ping `https://skillconnect-backend-97u2.onrender.com/api/workers/nearby` every 10 minutes to keep the instance alive 24/7.
