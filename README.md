# 🌱 Waste to Wealth (Waste2Wealth)

A mobile-first, installable **Next.js PWA** that transforms everyday scrap and waste materials into valuable DIY creations using AI vision and guidance.

---

## 📱 User Flow

1. **Scan / Upload Waste**:
   - Tap **"Open Camera"** to take a live photo or upload scrap materials (plastic bottles, cardboard boxes, glass jars, tin cans, fabric scraps) from your device.
   - Or pick one of the instant sample waste items to test immediately.
2. **AI Idea Generation**:
   - The server-side API (`/api/analyze-waste`) inspects the item with **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) or **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`).
   - Generates 3–4 practical upcycling ideas with preview product renders, build times, difficulty levels, and diverted waste metrics.
3. **Interactive DIY Coach Chat (`/craft/[id]`)**:
   - Tap any craft idea to open an interactive conversation with **Crafty**, your AI DIY guide.
   - Ask for safety tips, substitution for missing tools (e.g. glue gun alternatives), or step-by-step guidance.
   - Use the interactive **Step Checklist** to tick off steps as you build.
4. **User Profile Dashboard (`/profile`)**:
   - Automatically tracks every craft you've saved and made.
   - Calculates cumulative grams of waste diverted from landfills.
   - Tracks Creator Level and provides quick access to resume ongoing projects.
5. **Installable PWA**:
   - Tap the **"Install"** prompt banner to install Waste to Wealth on your Android, iOS, or desktop home screen.

---

## 🔑 Adding Your Free Gemini API Key

All API keys are strictly kept server-side and never exposed to the client.

1. Open `.env.local` in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Get a free API key at [Google AI Studio](https://aistudio.google.com/).
3. Save the file. The app will immediately switch from demo mode to live multimodal vision and chat!

*(Optional: You can also set `ANTHROPIC_API_KEY` for Claude models).*

---

## 🚀 Running the Development Server

To launch the local development server:
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### 📲 Testing on your Mobile Phone:
1. Make sure your phone and computer are on the same Wi-Fi network.
2. Run `npm run dev -- -H 0.0.0.0`
3. Look for your computer's local IP address (e.g., `http://192.168.1.X:3000`) and open it in your phone's browser.
4. Tap **"Install App"** to install it directly to your home screen!
