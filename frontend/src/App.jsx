import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const carStats = {
  toyota_camry_2024: { pages: 665, chunks: 1145 },
  ford_f150_2023: { pages: 786, chunks: 1896 },
  tesla_model3_2024: { pages: 320, chunks: 1223 },
  jeep_wrangler_2024: { pages: 364, chunks: 1298 },
  honda_crv_2026: { pages: 746, chunks: 1246 },
};

function App() {
  const [carModel, setCarModel] = useState('toyota_camry_2024');
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Scanning the owner's manual...");
  const chatEndRef = useRef(null);

  const clearChat = () => setChatLog([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, loading]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newChat = [...chatLog, { sender: 'user', text: question }];
    setChatLog(newChat);

    const isGreeting = /^(hi|hello|hey|thanks|thank you|good morning|good evening)\b/i.test(question.trim());
    setLoadingText(isGreeting ? "Typing..." : "Scanning the owner's manual...");

    setQuestion('');
    setLoading(true);

    try {
      const response = await axios.post('https://glovebox-api.onrender.com/ask', {
        car_model: carModel,
        question: question
      });

      setChatLog([...newChat, {
        sender: 'bot',
        text: response.data.answer,
        sources: response.data.sources
      }]);
    } catch (error) {
      console.error(error);
      setChatLog([...newChat, { sender: 'bot', text: "Error connecting to backend. Is FastAPI running?" }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30">

      {/* SIDEBAR */}
      <div className="w-72 bg-zinc-900/80 border-r border-zinc-800 flex-col hidden md:flex shadow-2xl z-10">

        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">GloveBox <span className="text-amber-500">AI</span></h1>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-bold tracking-widest uppercase text-left">Vehicle Manual Intelligence</p>
        </div>

        {/* Vehicle Selector */}
        <div className="p-6 flex-1">
          <label className="block text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-wider text-left">Active Vehicle</label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-zinc-950 border border-zinc-800 text-zinc-300 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer text-sm font-medium"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
            >
              <option value="toyota_camry_2024">Toyota Camry 2024</option>
              <option value="ford_f150_2023">Ford F-150 2023</option>
              <option value="tesla_model3_2024">Tesla Model 3 2024</option>
              <option value="jeep_wrangler_2024">Jeep Wrangler 2024</option>
              <option value="honda_crv_2026">Honda CR-V 2026</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-amber-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Clear Session */}
          <div className="mt-4">
            <button
              onClick={clearChat}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:bg-zinc-800 hover:text-amber-500 transition-all text-[10px] font-bold uppercase tracking-wider shadow-inner"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Session
            </button>
          </div>

          {/* Dynamic Vehicle Stats */}
          <div className="mt-6 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Vehicle Stats</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-400">Manual Pages</span>
                <span className="text-[11px] text-amber-500 font-bold">
                  {carStats[carModel]?.pages.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-400">Knowledge Chunks</span>
                <span className="text-[11px] text-amber-500 font-bold">
                  {carStats[carModel]?.chunks.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-400">Vector Dimensions</span>
                <span className="text-[11px] text-amber-500 font-bold">384</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800 mt-2">
                <span className="text-[11px] text-zinc-400">Total Fleet</span>
                <span className="text-[11px] text-amber-500 font-bold">5 vehicles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 text-center text-xs text-zinc-600 font-medium tracking-wide">
          Built by <span className="text-amber-500/70">Raghav Chandna</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">GloveBox <span className="text-amber-500">AI</span></h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="w-[150px] appearance-none bg-zinc-950 border border-zinc-800 text-zinc-200 py-1.5 pl-3 pr-6 rounded-lg text-[11px] focus:ring-2 focus:ring-amber-500/50 font-medium transition-all shadow-inner"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              >
                <option value="toyota_camry_2024">Toyota Camry 2024</option>
                <option value="ford_f150_2023">Ford F-150 2023</option>
                <option value="tesla_model3_2024">Tesla Model 3 2024</option>
                <option value="jeep_wrangler_2024">Jeep Wrangler 2024</option>
                <option value="honda_crv_2026">Honda CR-V 2026</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-amber-500">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg border border-zinc-700/50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {chatLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-90">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl shadow-amber-500/10">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">How can I help?</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Ask me anything about your vehicle. I have instantly searchable access to the complete manufacturer's owner manual.
              </p>
              <div className="grid grid-cols-1 gap-3 w-full">
                {[
                  "What does the check engine light mean?",
                  "How do I connect Bluetooth?",
                  "What oil does this car need?",
                  "How do I reset the tire pressure light?"
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="text-left p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-amber-500/50 hover:text-zinc-200 transition-all text-sm flex justify-between items-center group"
                  >
                    <span>{q}</span>
                    <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-all">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {chatLog.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>

                    <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center shadow-md ${msg.sender === 'user' ? 'bg-zinc-800 border border-zinc-700' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
                      {msg.sender === 'user' ? (
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                      ? 'bg-amber-500 text-zinc-950 font-semibold rounded-tr-sm shadow-amber-500/10'
                      : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 rounded-tl-sm backdrop-blur-sm'
                      }`}>
                      <p className="whitespace-pre-wrap leading-7">{msg.text}</p>

                      {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && !/(hi|hello|hey|welcome|assist you)/i.test(msg.text) && (msg.sources[0].metadata?.page || msg.sources[0].page) && (
                        <div className="mt-3 pt-3 border-t border-zinc-700/50 flex gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-wider text-amber-500/80 font-bold">Sources:</span>
                          {msg.sources.slice(0, 2).map((src, i) => {
                            const pageNum = src.metadata?.page || src.page;
                            return pageNum ? (
                              <span key={i} className="text-[10px] bg-zinc-900/80 text-zinc-400 px-2.5 py-0.5 rounded border border-zinc-700/50 font-medium">
                                Page {pageNum}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-4 max-w-[85%] md:max-w-[75%] flex-row text-left">
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-zinc-950 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-tl-sm p-4 flex items-center backdrop-blur-sm">
                      <span className="text-sm text-zinc-300 font-medium animate-pulse">{loadingText}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
          <form onSubmit={handleAsk} className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
              <input
                type="text"
                className="flex-1 bg-transparent text-zinc-200 p-4 md:p-5 outline-none placeholder-zinc-500 text-base"
                placeholder={loading ? loadingText : "Ask about maintenance, dashboard lights, or specifications..."}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="mr-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 p-2.5 md:px-6 md:py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2"
              >
                <span className="hidden md:inline">Send</span>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
                </svg>
              </button>
            </div>
          </form>
          <div className="max-w-4xl mx-auto mt-2 px-1 flex items-center justify-between">
            <span className="text-[10px] text-zinc-600">Press Enter to send</span>
            <span className="text-[10px] text-zinc-600 text-center flex-1 px-4">
              AI responses may not always be accurate — please verify with your official manual.
            </span>
            <span className="text-[10px] text-zinc-600">{question.length}/500</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;