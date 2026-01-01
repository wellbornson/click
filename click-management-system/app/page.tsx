"use client";
import React, { useState, useRef, useEffect } from 'react';

// --- CSS FOR ANIMATIONS ---
const styles = `
  @keyframes bounce-horizontal {
    0% { left: 100%; transform: translateX(-100%); }
    50% { left: 0%; transform: translateX(0%); }
    100% { left: 100%; transform: translateX(-100%); }
  }
  .animate-bounce-text {
    position: absolute;
    animation: bounce-horizontal 15s infinite ease-in-out;
    white-space: nowrap;
  }
  @keyframes gradient-move {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-bg {
    background-size: 400% 400%;
    animation: gradient-move 15s ease infinite;
  }
  @keyframes police-flash {
    0% { background-color: rgba(220, 38, 38, 0.9); }
    50% { background-color: rgba(30, 58, 138, 0.9); }
    100% { background-color: rgba(220, 38, 38, 0.9); }
  }
  .police-alert { animation: police-flash 0.5s infinite; }
  @keyframes warning-blink {
    0%, 100% { background-color: rgba(234, 179, 8, 0.1); border-color: rgba(234, 179, 8, 0.3); }
    50% { background-color: rgba(234, 179, 8, 0.4); border-color: rgba(234, 179, 8, 1); }
  }
  .animate-warning { animation: warning-blink 1s infinite; }
  .bar-grow { animation: grow-up 1s ease-out forwards; }
  @keyframes grow-up { from { height: 0; opacity: 0; } to { opacity: 1; } }
  .perspective-container { perspective: 1000px; }
  .glass-panel { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  .writing-vertical { writing-mode: vertical-rl; }
`;

// --- THEME DEFINITIONS ---
const THEMES = [
  { id: 0, name: 'Cyberverse', appBg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-black', panelBg: 'bg-slate-900/90', border: 'border-cyan-500/50', textMain: 'text-white', textAccent: 'text-cyan-400', textHighlight: 'text-emerald-400', button: 'bg-cyan-600 hover:bg-cyan-500', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]' },
  { id: 1, name: 'Monochrome Master', appBg: 'bg-black', panelBg: 'bg-neutral-900', border: 'border-white/40', textMain: 'text-white', textAccent: 'text-gray-300', textHighlight: 'text-white font-black underline decoration-2', button: 'bg-white text-black hover:bg-gray-200', glow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.5)]' },
  { id: 2, name: 'Golden Empire', appBg: 'bg-gradient-to-br from-yellow-950 via-black to-yellow-900', panelBg: 'bg-black/90', border: 'border-yellow-500/60', textMain: 'text-yellow-50', textAccent: 'text-yellow-400', textHighlight: 'text-amber-300', button: 'bg-yellow-600 hover:bg-yellow-500 text-black', glow: 'shadow-[0_0_25px_rgba(234,179,8,0.4)]' },
  { id: 3, name: 'Retro Wave', appBg: 'bg-gradient-to-br from-purple-900 via-black to-pink-900', panelBg: 'bg-black/80', border: 'border-pink-500/60', textMain: 'text-white', textAccent: 'text-cyan-400', textHighlight: 'text-pink-400', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500', glow: 'shadow-[0_0_25px_rgba(236,72,153,0.5)]' },
  { id: 4, name: 'Crimson Warlord', appBg: 'bg-gradient-to-br from-red-950 via-black to-orange-950', panelBg: 'bg-black/80', border: 'border-red-600/60', textMain: 'text-red-50', textAccent: 'text-red-500', textHighlight: 'text-orange-400', button: 'bg-red-700 hover:bg-red-600', glow: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]' },
  { id: 5, name: 'Neon Jungle', appBg: 'bg-gradient-to-br from-green-950 via-black to-emerald-900', panelBg: 'bg-black/90', border: 'border-green-500/50', textMain: 'text-green-50', textAccent: 'text-green-400', textHighlight: 'text-lime-400', button: 'bg-green-700 hover:bg-green-600', glow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]' },
  { id: 6, name: 'Royal Amethyst', appBg: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-black', panelBg: 'bg-indigo-950/80', border: 'border-purple-400/50', textMain: 'text-purple-50', textAccent: 'text-fuchsia-400', textHighlight: 'text-yellow-400', button: 'bg-purple-600 hover:bg-purple-500', glow: 'shadow-[0_0_20px_rgba(192,38,211,0.4)]' },
  { id: 7, name: 'Deep Ocean', appBg: 'bg-gradient-to-br from-blue-950 via-cyan-900 to-black', panelBg: 'bg-sky-950/80', border: 'border-sky-400/50', textMain: 'text-sky-50', textAccent: 'text-sky-400', textHighlight: 'text-white', button: 'bg-sky-600 hover:bg-sky-500', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.4)]' }
];

type ViewState = 'users' | 'workers' | 'expenses' | 'financials' | 'analytics';
type ModalType = 'generator' | 'tea' | null;
type StatPeriod = 'daily' | 'monthly' | 'yearly';
type ChatMessage = { sender: 'user' | 'ai'; text: string; isSecure?: boolean };
type AuthAction = { type: 'ACCESS_HQ' } | { type: 'UNLOCK_ROW', id: number } | { type: 'RATE_WORKER', workerId: number, rating: number } | { type: 'DELETE_WORKER', id: number } | { type: 'DELETE_EXPENSE', id: number };
type AiContextType = { status: 'IDLE' | 'WAITING_FOR_TYPE' | 'WAITING_FOR_DATE' | 'WAITING_FOR_TOP_PERIOD' | 'WAITING_FOR_FINANCIAL_PERIOD'; targetName: string; intent: 'DETAIL' | 'TOP_USER' | 'TOP_3' | 'FINANCIAL_REPORT'; };

export default function ClickDashboard() {
  const [currentView, setCurrentView] = useState<ViewState>('users');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const t = THEMES[themeIndex];
  const [adminPin, setAdminPin] = useState("7860"); 
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<AuthAction>({ type: 'ACCESS_HQ' });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPassInput, setNewPassInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ sender: 'ai', text: 'Assalam-o-Alaikum Boss! ❤️\nMain CLICK Cafe ka AI Munshi hun.' }]);
  const [awaitingAiAuth, setAwaitingAiAuth] = useState(false);
  const [aiContext, setAiContext] = useState<AiContextType>({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [blockList, setBlockList] = useState<string[]>([]);
  const [blockInput, setBlockInput] = useState("");
  const [policeAlert, setPoliceAlert] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); 
  const [selectedDay, setSelectedDay] = useState(1);
  const [statPeriod, setStatPeriod] = useState<StatPeriod>('daily');
  const [now, setNow] = useState(new Date());
  const [graphDate, setGraphDate] = useState(new Date().toISOString().split('T')[0]);
  const [masterData, setMasterData] = useState<{ [key: string]: any }>({});
  const [generatorLogs, setGeneratorLogs] = useState([{ id: 1, date: '2026-01-01', desc: 'Petrol 2 Liters', amount: 600 }]);
  const [teaLogs, setTeaLogs] = useState([{ id: 1, date: '2026-01-01', desc: 'Sugar & Milk', amount: 150 }]);

  // --- AUTO-SAVE & LOAD SYSTEM (DATABASE SIMULATION) ---
  useEffect(() => {
    // 1. Load Data on Startup
    const savedData = localStorage.getItem('CLICK_CAFE_DB_V1');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if(parsed.masterData) setMasterData(parsed.masterData);
            if(parsed.blockList) setBlockList(parsed.blockList);
            if(parsed.adminPin) setAdminPin(parsed.adminPin);
            if(parsed.themeIndex !== undefined) setThemeIndex(parsed.themeIndex);
            if(parsed.generatorLogs) setGeneratorLogs(parsed.generatorLogs);
            if(parsed.teaLogs) setTeaLogs(parsed.teaLogs);
            // Optionally load last active date
            // if(parsed.currentDate) setCurrentDate(new Date(parsed.currentDate));
        } catch (e) {
            console.error("Data Load Error", e);
        }
    }
  }, []);

  useEffect(() => {
    // 2. Save Data on Any Change
    const dataToSave = {
        masterData,
        blockList,
        adminPin,
        themeIndex,
        generatorLogs,
        teaLogs,
        // currentDate: currentDate.toISOString() 
    };
    if (Object.keys(masterData).length > 0 || blockList.length > 0) {
        localStorage.setItem('CLICK_CAFE_DB_V1', JSON.stringify(dataToSave));
    }
  }, [masterData, blockList, adminPin, themeIndex, generatorLogs, teaLogs]);


  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000 * 10); return () => clearInterval(timer); }, []);

  const getStorageKey = (date: Date, day: number) => `${date.getFullYear()}-${date.getMonth()}-${day}`;
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const formatMonthYear = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const changeMonth = (offset: number) => { const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1); setCurrentDate(newDate); setSelectedDay(1); };
  
  const getFullDateDisplay = () => { 
    const activeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay); 
    return activeDate.toLocaleString('default', { weekday: 'short', day:'2-digit', month: 'short', year: 'numeric' }).toUpperCase(); 
  };
  
  const cycleTheme = () => { setThemeIndex((prev) => (prev + 1) % THEMES.length); };
  const getOverdueMinutes = (timeOutStr: string) => { if (!timeOutStr) return -9999; const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/; if (!timeRegex.test(timeOutStr)) return -9999; const [inHours, inMinutes] = timeOutStr.split(':').map(Number); const currentHours = now.getHours(); const currentMinutes = now.getMinutes(); let adjustedInHours = inHours; if (currentHours >= 12 && inHours < 12) { adjustedInHours = inHours + 12; } return ((currentHours * 60) + currentMinutes) - ((adjustedInHours * 60) + inMinutes); };

  const getCurrentData = (date = currentDate, day = selectedDay) => {
    const key = getStorageKey(date, day);
    const defaultData = {
        users: Array.from({ length: 300 }).map((_, i) => ({ id: i + 1, no: i + 1, name: '', timeIn: '', timeOut: '', amount: '', isLocked: false })),
        workers: [ { id: 1, name: 'Sajid', salary: 30000, advance: 5000, bonus: 0, rating: 0 }, { id: 2, name: 'Nasir', salary: 25000, advance: 0, bonus: 1000, rating: 0 }, { id: 3, name: 'Ali', salary: 28000, advance: 12000, bonus: 0, rating: 0 } ],
        expenses: [ { id: 1, item: 'Shop Rent (Main)', cost: 0, date: '', isSpecial: false }, { id: 2, item: 'Shop Rent (Shop 2)', cost: 0, date: '', isSpecial: false }, { id: 3, item: 'KE Electric Bill', cost: 0, date: '', isSpecial: false }, { id: 4, item: 'Internet Bill', cost: 0, date: '', isSpecial: false }, { id: 5, item: 'Generator Maintenance', cost: 0, date: '', isSpecial: true, type: 'generator' }, { id: 6, item: 'Tea & Refreshment', cost: 0, date: '', isSpecial: true, type: 'tea' } ]
    };
    if (!masterData[key]) return defaultData;
    const data = { ...masterData[key] };
    const safeExpenses = data.expenses || defaultData.expenses;
    data.expenses = safeExpenses.map((e: any) => { if(e.type === 'generator') return {...e, cost: generatorLogs.reduce((s,i)=>s+i.amount,0)}; if(e.type === 'tea') return {...e, cost: teaLogs.reduce((s,i)=>s+i.amount,0)}; return e; });
    return data;
  };
  const currentData = getCurrentData();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const updateMasterData = (field: string, newData: any) => { const key = getStorageKey(currentDate, selectedDay); setMasterData(prev => ({ ...prev, [key]: { ...getCurrentData(), [field]: newData } })); };

  const handleUniversalKeyDown = (e: React.KeyboardEvent, id: number, field: string, dataList: any[], type: 'users' | 'workers' | 'expenses') => {
    const fieldOrder: {[key: string]: string[]} = { 'users': ['name', 'timeIn', 'timeOut', 'amount'], 'workers': ['name', 'salary', 'advance', 'bonus'], 'expenses': ['item', 'date', 'cost'] };
    const currentFields = fieldOrder[type]; const currentIndex = currentFields.indexOf(field); const rowIdx = dataList.findIndex(item => item.id === id);
    if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); if (currentIndex < currentFields.length - 1) { const nextField = currentFields[currentIndex + 1]; const el = document.getElementById(`${nextField}-${id}`); if (el) (el as HTMLInputElement).focus(); } else { if (rowIdx < dataList.length - 1) { const nextId = dataList[rowIdx + 1].id; const nextField = currentFields[0]; const el = document.getElementById(`${nextField}-${nextId}`); if (el) (el as HTMLInputElement).focus(); } } } 
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (currentIndex > 0) { const prevField = currentFields[currentIndex - 1]; const el = document.getElementById(`${prevField}-${id}`); if (el) (el as HTMLInputElement).focus(); } else { if (rowIdx > 0) { const prevId = dataList[rowIdx - 1].id; const prevField = currentFields[currentFields.length - 1]; const el = document.getElementById(`${prevField}-${prevId}`); if (el) (el as HTMLInputElement).focus(); } } } 
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (rowIdx < dataList.length - 1) { const nextId = dataList[rowIdx + 1].id; const el = document.getElementById(`${field}-${nextId}`); if (el) (el as HTMLInputElement).focus(); } } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (rowIdx > 0) { const prevId = dataList[rowIdx - 1].id; const el = document.getElementById(`${field}-${prevId}`); if (el) (el as HTMLInputElement).focus(); } }
  };
  const updateUser = (id: any, field: string, value: any) => { if (field === 'name' && value.trim() !== '') { const isBlocked = blockList.some(badName => value.toLowerCase() === badName.toLowerCase()); if (isBlocked) { setPoliceAlert(true); return; } } const user = currentData.users.find((u:any) => u.id === id); if (user && user.isLocked) return; const overdue = getOverdueMinutes(user?.timeOut); if (overdue >= 0 && !user.isLocked) return; const newUsers = currentData.users.map((u: any) => u.id === id ? { ...u, [field]: value } : u); updateMasterData('users', newUsers); };
  const lockRow = (id: any) => { const newUsers = currentData.users.map((u: any) => u.id === id ? { ...u, isLocked: true } : u); updateMasterData('users', newUsers); };
  const toggleSelect = (id: any) => { const newSelected = new Set(selectedIds); if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id); setSelectedIds(newSelected); };
  const updateWorker = (id: any, field: string, value: any) => { const newWorkers = currentData.workers.map((w: any) => w.id === id ? { ...w, [field]: value === '' ? 0 : Number(value) } : w); updateMasterData('workers', newWorkers); };
  const updateWorkerRating = (id: any, newRating: number) => { const newWorkers = currentData.workers.map((w: any) => w.id === id ? { ...w, rating: newRating } : w); updateMasterData('workers', newWorkers); };
  const updateWorkerName = (id: any, value: string) => { const newWorkers = currentData.workers.map((w: any) => w.id === id ? { ...w, name: value } : w); updateMasterData('workers', newWorkers); };
  const updateExpense = (id: any, field: string, value: any) => { const newExpenses = currentData.expenses.map((e: any) => e.id === id ? { ...e, [field]: value } : e); updateMasterData('expenses', newExpenses); };
  const addWorker = () => updateMasterData('workers', [...currentData.workers, { id: Date.now(), name: 'New Worker', salary: 0, advance: 0, bonus: 0, rating: 0 }]);
  const addExpense = () => updateMasterData('expenses', [...currentData.expenses, { id: Date.now(), item: 'New Expense', cost: 0, date: '', isSpecial: false }]);
  const addSubLog = (type: 'generator' | 'tea') => { const newItem = { id: Date.now(), date: new Date().toISOString().split('T')[0], desc: '', amount: 0 }; if (type === 'generator') setGeneratorLogs([...generatorLogs, newItem]); if (type === 'tea') setTeaLogs([...teaLogs, newItem]); };
  const updateSubLog = (type: 'generator' | 'tea', id: number, field: string, value: any) => { const setter = type === 'generator' ? setGeneratorLogs : setTeaLogs; const current = type === 'generator' ? generatorLogs : teaLogs; setter(current.map(item => item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item)); };
  const addToBlockList = () => { if(blockInput.trim()) { setBlockList([...blockList, blockInput.trim()]); setBlockInput(""); } };
  const removeFromBlockList = (name: string) => { setBlockList(blockList.filter(b => b !== name)); };
  const initiateUnlock = (id: number) => { setAuthAction({ type: 'UNLOCK_ROW', id }); setShowAuthModal(true); };
  const initiateRating = (workerId: number, rating: number) => { setAuthAction({ type: 'RATE_WORKER', workerId, rating }); setShowAuthModal(true); };
  const initiateDeleteWorker = (id: number) => { setAuthAction({ type: 'DELETE_WORKER', id }); setShowAuthModal(true); };
  const initiateDeleteExpense = (id: number) => { setAuthAction({ type: 'DELETE_EXPENSE', id }); setShowAuthModal(true); };
  const handleLogin = () => { if (passwordInput === "CLICK2026" || passwordInput === adminPin) { performAuthAction(); } else { setAuthError(true); } };
  const performAuthAction = () => { setShowAuthModal(false); setPasswordInput(''); setAuthError(false); if (authAction.type === 'ACCESS_HQ') { setCurrentView('financials'); } else if (authAction.type === 'UNLOCK_ROW') { const newUsers = currentData.users.map((u: any) => u.id === authAction.id ? { ...u, isLocked: false } : u); updateMasterData('users', newUsers); } else if (authAction.type === 'RATE_WORKER') { const currentWorker = currentData.workers.find((w:any) => w.id === authAction.workerId); const finalRating = (currentWorker && currentWorker.rating === authAction.rating) ? 0 : authAction.rating; updateWorkerRating(authAction.workerId, finalRating); } else if (authAction.type === 'DELETE_WORKER') { const newWorkers = currentData.workers.filter((w: any) => w.id !== authAction.id); updateMasterData('workers', newWorkers); } else if (authAction.type === 'DELETE_EXPENSE') { const newExpenses = currentData.expenses.filter((e: any) => e.id !== authAction.id); updateMasterData('expenses', newExpenses); } };
  const handleChangePassword = () => { if(newPassInput.length >= 4) { setAdminPin(newPassInput); setNewPassInput(""); setShowChangePassModal(false); alert("✅ Password Changed!"); } else { alert("❌ Too short!"); } };

  const allUsersTotal = currentData.users.reduce((sum: number, user: any) => sum + (Number(user.amount) || 0), 0);
  const selectedUserTotal = currentData.users.reduce((sum: number, user: any) => sum + (selectedIds.has(user.id) ? (Number(user.amount) || 0) : 0), 0);
  const displayTotal = selectedIds.size > 0 ? selectedUserTotal : allUsersTotal;
  const displayLabel = selectedIds.size > 0 ? "Selection Total" : "Today's Income";
  const totalExpenses = currentData.expenses.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0), 0);
  const totalPayable = currentData.workers.reduce((sum: number, w: any) => sum + ((w.salary + w.bonus) - w.advance), 0);
  const calculateFinancials = () => { let income = 0; let expense = 0; const processDay = (data: any) => { income += data.users.reduce((s:any, u:any) => s + (Number(u.amount) || 0), 0); expense += data.expenses.reduce((s:any, e:any) => s + (Number(e.cost) || 0), 0); expense += data.workers.reduce((s:any, w:any) => s + (w.salary + w.bonus - w.advance), 0); }; if (statPeriod === 'daily') processDay(currentData); else if (statPeriod === 'monthly') { const days = daysInMonth(currentDate); for(let d=1; d<=days; d++) { const key = getStorageKey(currentDate, d); if(masterData[key]) processDay(masterData[key]); } if (Object.keys(masterData).length === 0) processDay(currentData); } else if (statPeriod === 'yearly') { Object.keys(masterData).forEach(key => { if(key.startsWith(currentDate.getFullYear().toString())) processDay(masterData[key]); }); if (Object.keys(masterData).length === 0) processDay(currentData); } return { income, expense, profit: income - expense }; };
  const stats = calculateFinancials();
  
  const scanHistory = (targetName: string, dateFilter: 'today' | 'monthly' | 'yearly' | 'custom', customDate?: string) => {
      let count = 0; let totalAmount = 0; let historyDetails: string[] = []; const lowerName = targetName.toLowerCase();
      const processData = (data: any, dateLabel: string) => { if (!data || !data.users) return; data.users.forEach((u: any) => { if (u.name && u.name.toLowerCase() === lowerName) { count++; const amt = Number(u.amount) || 0; totalAmount += amt; if (u.timeIn && u.timeOut) { historyDetails.push(`• ${dateLabel} | In: ${u.timeIn} - Out: ${u.timeOut} | 💰 ${amt}`); } else { historyDetails.push(`• ${dateLabel} | 💰 ${amt}`); } } }); };
      if (dateFilter === 'today') { processData(currentData, 'Aaj'); } else if (dateFilter === 'monthly') { const days = daysInMonth(currentDate); for(let d=1; d<=days; d++) { const key = getStorageKey(currentDate, d); if(masterData[key]) processData(masterData[key], `${d} Tareekh`); } if (Object.keys(masterData).length === 0) processData(currentData, 'Aaj'); } else if (dateFilter === 'yearly') { Object.keys(masterData).forEach(key => { if(key.startsWith(currentDate.getFullYear().toString())) processData(masterData[key], key); }); }
      return { count, totalAmount, historyDetails };
  };

  const handleAiSubmit = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput; const lowerMsg = userMsg.toLowerCase();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]); setChatInput("");
    if (awaitingAiAuth) { if (userMsg === adminPin) { setAwaitingAiAuth(false); setMessages(prev => [...prev, { sender: 'ai', text: `✅ Verified.\n\nJanab, ab Date batayein (e.g., 4 1 2026)`, isSecure: true }]); setAiContext({ status: 'WAITING_FOR_DATE', targetName: '', intent: aiContext.intent }); } else { setMessages(prev => [...prev, { sender: 'ai', text: `❌ Ghalat Password.` }]); setAwaitingAiAuth(false); } return; }
    if (lowerMsg.includes('profit') || lowerMsg.includes('kamai') || lowerMsg.includes('hq') || lowerMsg.includes('loss') || lowerMsg.includes('lose') || lowerMsg.includes('nuksan') || lowerMsg.includes('bachat')) { setAiContext({ status: 'IDLE', targetName: '', intent: 'PROFIT_LOSS' }); setMessages(prev => [...prev, { sender: 'ai', text: `🔒 Financial Data ke liye Password darj karein:` }]); setAwaitingAiAuth(true); return; }
    if (lowerMsg.includes('graph')) { setMessages(prev => [...prev, { sender: 'ai', text: `📊 **Graph Analysis:**\nGraph Tab dekhein.` }]); return; }

    const workerMatch = currentData.workers.find((w: any) => w.name && lowerMsg.includes(w.name.toLowerCase()));
    
    // Check Current Data first
    let userMatch = [...currentData.users].find(u => u.name && u.name.trim() !== "" && lowerMsg.includes(u.name.toLowerCase()));
    
    // If not found, CHECK MASTER DATA (HISTORY)
    if (!userMatch) {
         Object.values(masterData).forEach((data: any) => {
             if (userMatch) return; // already found
             if (data.users) {
                 const found = data.users.find((u: any) => u.name && u.name.trim() !== "" && lowerMsg.includes(u.name.toLowerCase()));
                 if (found) userMatch = found;
             }
         });
    }

    if (aiContext.status === 'WAITING_FOR_DATE') {
        let d: number | undefined, m: number | undefined, y: number | undefined;
        let isDateInput = false;

        if (lowerMsg.includes('today') || lowerMsg.includes('aaj') || lowerMsg.includes('abhi') || lowerMsg.includes('now')) {
            const nowObj = new Date();
            d = nowObj.getDate();
            m = nowObj.getMonth();
            y = nowObj.getFullYear();
            isDateInput = true;
        } else {
            const specificDateMatch = userMsg.match(/(\d{1,2})[\s\/\-\.]+(\d{1,2})[\s\/\-\.]+(\d{4})/);
            if (specificDateMatch) {
                d = parseInt(specificDateMatch[1]);
                m = parseInt(specificDateMatch[2]) - 1;
                y = parseInt(specificDateMatch[3]);
                isDateInput = true;
            }
        }

        if (isDateInput && d !== undefined && m !== undefined && y !== undefined) {
            if (new Date(y, m, d) > new Date()) { setMessages(prev => [...prev, { sender: 'ai', text: `❌ **${d}/${m+1}/${y}** abhi aayi nahi.` }]); return; }
            const key = `${y}-${m}-${d}`;
            if (aiContext.intent === 'PROFIT_LOSS') {
                 let dayIncome = 0; let dayExpense = 0;
                 if (masterData[key]) { dayIncome = masterData[key].users.reduce((s:any, u:any) => s + (Number(u.amount) || 0), 0); dayExpense = masterData[key].expenses.reduce((s:any, e:any) => s + (Number(e.cost) || 0), 0) + masterData[key].workers.reduce((s:any, w:any) => s + (w.salary + w.bonus - w.advance), 0); } else if (y === now.getFullYear() && m === now.getMonth() && d === now.getDate()) { const res = calculateFinancials(); dayIncome = res.income; dayExpense = res.expense; }
                 setMessages(prev => [...prev, { sender: 'ai', text: `💰 **Report (${d}/${m+1}/${y}):**\n\n🟢 Income: ${dayIncome}\n🔴 Expense: ${dayExpense}\n🏁 **Profit: ${dayIncome - dayExpense}**` }]);
            } else if (aiContext.intent === 'DETAIL' && aiContext.targetName) {
                 if (masterData[key] || (y === now.getFullYear() && m === now.getMonth() && d === now.getDate())) {
                    const dataToScan = masterData[key] || currentData; let count = 0; let totalAmount = 0; let historyDetails: string[] = [];
                    dataToScan.users.forEach((u: any) => { if (u.name && u.name.toLowerCase() === aiContext.targetName.toLowerCase()) { count++; totalAmount += (Number(u.amount) || 0); historyDetails.push(`• Time: ${u.timeIn||'-'} - ${u.timeOut||'-'} | Rs ${u.amount}`); } });
                    setMessages(prev => [...prev, { sender: 'ai', text: `👤 **${aiContext.targetName} (${d}/${m+1}/${y}):**\nTotal Visits: ${count}\nTotal Paid: ${totalAmount}\n${historyDetails.join('\n') || "No record."}` }]);
                 } else { setMessages(prev => [...prev, { sender: 'ai', text: `❌ Record nahi mila.` }]); }
            }
            setAiContext({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
            return;
        } else {
             if (workerMatch || userMatch) {
                 setAiContext({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
             } else {
                 setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Date samajh nahi aayi. Format: 4 12 2025` }]); 
                 return;
             }
        }
    }

    if (workerMatch && userMatch && lowerMsg.includes(workerMatch.name.toLowerCase())) { setAiContext({ status: 'WAITING_FOR_TYPE', targetName: workerMatch.name, intent: 'DETAIL' }); setMessages(prev => [...prev, { sender: 'ai', text: `🤔 **"${workerMatch.name}"** Worker ya User?` }]); } 
    else if (workerMatch) { const balance = workerMatch.salary + workerMatch.bonus - workerMatch.advance; setMessages(prev => [...prev, { sender: 'ai', text: `👷 **${workerMatch.name}:**\nSalary: ${workerMatch.salary}\nBalance: ${balance}` }]); }
    else if (userMatch) { setAiContext({ status: 'WAITING_FOR_DATE', targetName: userMatch.name, intent: 'DETAIL' }); setMessages(prev => [...prev, { sender: 'ai', text: `👤 **${userMatch.name}** mil gaya.\nKis Date ki detail chahiye? (e.g. 12 1 2026)` }]); }
    else if (aiContext.status === 'WAITING_FOR_TYPE') { if (lowerMsg.includes('worker')) { setMessages(prev => [...prev, { sender: 'ai', text: `👷 Worker Detail shown (Simulated)` }]); } else { setAiContext({ status: 'WAITING_FOR_DATE', targetName: aiContext.targetName, intent: 'DETAIL' }); setMessages(prev => [...prev, { sender: 'ai', text: `👤 User select hua. Date batayein?` }]); } }
    else { setMessages(prev => [...prev, { sender: 'ai', text: "❌ Record nahi mila." }]); }
  };
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const renderPoliceModal = () => { if (!policeAlert) return null; return (<div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300"><div className="w-full max-w-2xl bg-red-950/90 border-4 border-red-500 rounded-3xl p-10 text-center animate-siren shadow-[0_0_100px_rgba(220,38,38,0.5)]"><h1 className="text-8xl mb-6">🚨</h1><h2 className="text-5xl font-black text-white uppercase mb-6 drop-shadow-lg tracking-widest">WARNING!</h2><p className="text-2xl font-bold text-white bg-black/50 p-6 rounded-xl border-2 border-red-400/50 mb-8 leading-relaxed">Admin ki taraf se ye user Allow nh hai foran police ko call karo</p><button onClick={() => setPoliceAlert(false)} className="bg-white text-red-900 font-black px-12 py-4 rounded-full text-2xl hover:scale-110 transition-transform shadow-xl uppercase">OK BOSS</button></div></div>); }
  const renderAuthModal = () => { if (!showAuthModal) return null; let modalTitle = "Security Check"; if (authAction.type === 'UNLOCK_ROW') modalTitle = "Unlock Row"; if (authAction.type === 'RATE_WORKER') modalTitle = "Admin Rating Access"; if (authAction.type === 'DELETE_WORKER' || authAction.type === 'DELETE_EXPENSE') modalTitle = "Confirm Delete"; return (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"><div className={`bg-slate-900 border-2 ${authError ? 'border-red-500 animate-pulse' : t.border} p-8 rounded-3xl w-full max-w-sm flex flex-col items-center text-center ${t.glow}`}><div className="mb-6 bg-slate-800 p-4 rounded-full">{authError ? <span className="text-4xl">⛔</span> : <span className="text-4xl">🔒</span>}</div><h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">{modalTitle}</h2><input type="password" autoFocus value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="PIN CODE" className="bg-black/50 border border-slate-600 text-center text-3xl text-white font-mono tracking-[0.5em] w-full p-4 rounded-xl focus:outline-none focus:border-cyan-500 mb-6 placeholder-slate-700" maxLength={9}/><button onClick={handleLogin} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${t.button}`}>CONFIRM</button><button onClick={() => { setShowAuthModal(false); setAuthError(false); setPasswordInput(''); }} className="mt-4 text-slate-500 text-xs hover:text-white">Cancel</button></div></div>); };
  const renderChangePassModal = () => { if (!showChangePassModal) return null; return (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"><div className="bg-slate-900 border border-purple-500 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl"><h2 className="text-xl font-bold text-purple-400 mb-4 uppercase">Change Password</h2><input type="text" value={newPassInput} onChange={(e) => setNewPassInput(e.target.value)} placeholder="New PIN Code" className="bg-black/50 border border-slate-700 text-white text-center text-xl p-3 rounded-lg w-full mb-4 focus:border-purple-500 outline-none"/><div className="flex gap-2"><button onClick={handleChangePassword} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold">Save</button><button onClick={() => setShowChangePassModal(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">Cancel</button></div></div></div>); };

  const renderAnalytics = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dummySales = [25000, 18000, 32000, 45000, 60000, 55000, 40000];
    const maxSale = Math.max(...dummySales);
    const bestDay = days[dummySales.indexOf(maxSale)];
    const minSale = Math.min(...dummySales);
    const slowDay = days[dummySales.indexOf(minSale)];
    return (
      <div className={`p-6 h-full flex flex-col ${t.textMain}`}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className={`text-3xl md:text-4xl font-black ${t.textAccent} tracking-tighter drop-shadow-lg text-center`}>SALES ANALYTICS 📊</h2>
            <div className={`flex items-center gap-2 ${t.panelBg} p-2 rounded-xl border ${t.border}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Period:</span>
                <input type="month" value={graphDate.slice(0, 7)} onChange={(e) => setGraphDate(e.target.value)} className="bg-transparent border-none text-white font-bold outline-none cursor-pointer"/>
            </div>
        </div>
        <div className={`flex-1 flex items-end justify-between gap-2 md:gap-4 p-6 ${t.panelBg} rounded-3xl border ${t.border} shadow-2xl relative overflow-hidden perspective-container`}>
           <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-20 pointer-events-none"><div className="border-t border-white w-full h-0"></div><div className="border-t border-white w-full h-0"></div><div className="border-t border-white w-full h-0"></div></div>
           {dummySales.map((sale, i) => {
             const heightPercent = (sale / maxSale) * 80;
             const colors = ['from-pink-500 to-purple-500', 'from-cyan-400 to-blue-500', 'from-yellow-400 to-orange-500', 'from-emerald-400 to-green-600', 'from-red-500 to-rose-600'];
             const randomColor = colors[i % colors.length];
             return (
               <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer">
                  <div className={`text-[10px] md:text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 ${t.textMain}`}>{sale.toLocaleString()}</div>
                  <div style={{ height: `${heightPercent}%` }} className={`w-full md:w-12 rounded-t-lg bg-gradient-to-t ${randomColor} shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-110 relative bar-grow hover:brightness-125`}><div className="absolute top-0 left-0 w-full h-2 bg-white/40 rounded-t-lg"></div></div>
                  <div className={`mt-2 text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-white`}>{days[i]}</div>
               </div>
             )
           })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <div className={`${t.panelBg} p-4 rounded-xl border ${t.border} flex items-center gap-4 hover:scale-[1.02] transition-transform`}><div className="text-4xl">🚀</div><div><h3 className="text-xs uppercase text-slate-400 tracking-widest">Best Day</h3><p className="text-2xl font-black text-yellow-400">{bestDay} <span className="text-sm text-white">({maxSale.toLocaleString()})</span></p></div></div>
           <div className={`${t.panelBg} p-4 rounded-xl border ${t.border} flex items-center gap-4 hover:scale-[1.02] transition-transform`}><div className="text-4xl">🐌</div><div><h3 className="text-xs uppercase text-slate-400 tracking-widest">Lowest Traffic</h3><p className="text-2xl font-black text-red-400">{slowDay} <span className="text-sm text-white">({minSale.toLocaleString()})</span></p></div></div>
        </div>
      </div>
    );
  };

  const renderFinancials = () => (
    <div className={`p-4 h-full flex flex-col items-center justify-center animate-in fade-in duration-500 relative ${t.textMain}`}>
      <button onClick={() => setShowChangePassModal(true)} className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-600 flex items-center gap-1 z-50">⚙️ Pass</button>
      <div className="text-center mb-8 animate-in zoom-in duration-1000">
        <h1 className="text-3xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-500 to-purple-600 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter">FINANCIAL HQ</h1>
        <p className={`text-sm font-light tracking-[0.2em] uppercase ${t.textAccent}`}>Welcome Mr. Rashid Imam</p>
      </div>
      
      <div className="flex w-full max-w-6xl gap-6 mb-8 items-stretch h-full">
          <div className={`w-1/4 max-w-[200px] ${t.panelBg} p-3 rounded-xl border ${t.border} flex flex-col shadow-lg`}>
            <h3 className="text-red-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs"><span className="text-lg">🚫</span> Blacklist</h3>
            <div className="flex gap-1 mb-2">
                <input value={blockInput} onChange={(e)=>setBlockInput(e.target.value)} placeholder="Name..." className="flex-1 bg-black/50 border border-slate-600 rounded px-2 py-1 outline-none text-[10px] text-white"/>
                <button onClick={addToBlockList} className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded font-bold text-[10px] text-white">+</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {blockList.map((name, i) => (<div key={i} className="bg-red-900/40 border border-red-500/50 p-1.5 rounded flex justify-between items-center hover:bg-red-900/60"><span className="text-red-200 font-bold text-xs truncate w-20">{name}</span><button onClick={()=>removeFromBlockList(name)} className="hover:text-white text-red-400 font-bold text-xs px-1">✕</button></div>))}
                {blockList.length === 0 && <span className="text-slate-500 italic text-[10px] text-center mt-4">No Data</span>}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
             <div className="flex justify-center gap-2">{(['daily', 'monthly', 'yearly'] as StatPeriod[]).map(period => (<button key={period} onClick={() => setStatPeriod(period)} className={`px-4 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest transition-all duration-300 ${statPeriod === period ? t.button + ' text-white scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{period}</button>))}</div>
             
             <div className="grid grid-cols-2 gap-4 flex-1">
                <div className={`group relative ${t.panelBg} border ${t.border} rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg hover:bg-white/5 transition-all`}>
                    <h3 className={`font-bold uppercase tracking-widest text-xs mb-1 ${t.textAccent}`}>Revenue</h3>
                    <div className={`text-2xl md:text-3xl font-mono font-black ${t.textMain}`}>{stats.income.toLocaleString()}</div>
                </div>
                <div className={`group relative ${t.panelBg} border ${t.border} rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg hover:bg-white/5 transition-all`}>
                    <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">Expenses</h3>
                    <div className={`text-2xl md:text-3xl font-mono font-black ${t.textMain}`}>{stats.expense.toLocaleString()}</div>
                </div>
                <div className={`col-span-2 group relative ${t.panelBg} border-2 ${t.border} rounded-2xl p-6 flex flex-col justify-center items-center shadow-2xl hover:scale-[1.02] transition-transform bg-gradient-to-r from-black/40 via-transparent to-black/40`}>
                    <h3 className={`font-black uppercase tracking-widest text-sm mb-2 ${t.textHighlight}`}>NET PROFIT</h3>
                    <div className={`text-5xl md:text-6xl font-mono font-black ${t.textMain} drop-shadow-lg`}>{stats.profit.toLocaleString()} <span className="text-lg text-slate-500">PKR</span></div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );

  // --- RENDER EXPENSES (FIXED & SAFE) ---
  const renderExpenses = () => (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className={`text-xl ${t.textAccent} mb-4 font-bold border-b ${t.border} pb-2`}>Expenses ({selectedDay} {formatMonthYear(currentDate)})</h2>
      <div className={`${t.panelBg} rounded-lg overflow-hidden border ${t.border} shadow-lg`}>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className={`bg-black/50 ${t.textAccent} uppercase text-xs`}><tr><th className="p-4">Expense Item</th><th className="p-4">Date</th><th className="p-4 text-right">Cost (PKR)</th><th className="p-4 text-center">Action</th></tr></thead>
          <tbody className={`divide-y ${t.border}`}>
            {currentData.expenses.map((e: any) => { 
               if (e.isSpecial) { 
                 const icon = e.type === 'generator' ? '⚡' : '☕'; 
                 return (
                    <tr key={e.id} onClick={() => setActiveModal(e.type)} className={`group cursor-pointer hover:bg-white/5 border-b ${t.border} relative`}>
                      <td className={`p-4 font-bold ${t.textMain} flex items-center gap-3`}><span className="text-2xl">{icon}</span><span className={`uppercase tracking-widest text-xl font-bold ${t.textAccent}`}>{e.item}</span><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400">DETAILS</span></td>
                      <td className="p-4 text-slate-500 text-sm italic">Auto-calculated</td>
                      <td className="p-4 text-right"><div className={`font-mono font-black text-2xl ${t.textHighlight}`}>{e.cost.toLocaleString()}</div></td>
                      <td className="p-4 text-center"><span className="text-slate-600">🔒</span></td>
                    </tr>
                 ); 
               } 
               return (
                  <tr key={e.id} className="hover:bg-white/5">
                    <td className="p-4"><input id={`item-${e.id}`} value={e.item} onChange={(ev)=>updateExpense(e.id, 'item', ev.target.value)} onKeyDown={(ev) => handleUniversalKeyDown(ev, e.id, 'item', currentData.expenses, 'expenses')} className={`bg-transparent outline-none w-full text-xl font-bold ${t.textMain} placeholder-slate-700`}/></td>
                    <td className="p-4"><input id={`date-${e.id}`} type="date" value={e.date} onChange={(ev)=>updateExpense(e.id, 'date', ev.target.value)} onKeyDown={(ev) => handleUniversalKeyDown(ev, e.id, 'date', currentData.expenses, 'expenses')} className="bg-transparent outline-none text-slate-400 font-bold"/></td>
                    <td className="p-4 text-right"><input id={`cost-${e.id}`} type="number" value={e.cost === 0 ? '' : e.cost} placeholder="0" onChange={(ev)=>updateExpense(e.id, 'cost', ev.target.value)} onKeyDown={(ev) => handleUniversalKeyDown(ev, e.id, 'cost', currentData.expenses, 'expenses')} className={`bg-transparent text-right outline-none w-40 text-2xl font-black ${t.textHighlight} placeholder-slate-700`}/></td>
                    <td className="p-4 text-center"><button onClick={() => initiateDeleteExpense(e.id)} className="text-slate-500 hover:text-red-500 transition-colors text-xl">🗑️</button></td>
                  </tr>
               ); 
            })}
            <tr className="bg-black/30 border-t-2 border-white/10"><td className={`p-6 font-bold ${t.textAccent} uppercase tracking-wider text-xl`}>Total</td><td></td><td className={`p-6 text-right font-mono font-black text-4xl ${t.textHighlight}`}>{totalExpenses.toLocaleString()}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <button onClick={addExpense} className={`mt-4 px-6 py-3 ${t.button} text-white rounded-lg text-sm font-bold border border-white/20 flex items-center gap-2 shadow-lg`}><span className="text-xl">+</span> Add New Expense</button>
    </div>
  );

  const renderDetailsModal = () => { if (!activeModal) return null; const isGen = activeModal === 'generator'; const logs = isGen ? generatorLogs : teaLogs; const modalTotal = logs.reduce((s, i) => s + i.amount, 0); return (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"><div className={`relative w-full max-w-4xl ${t.panelBg} border-2 ${t.border} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}><div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20"><div><h2 className={`text-3xl font-black italic tracking-tighter ${t.textAccent} drop-shadow-md`}>{isGen ? "GENERATOR" : "TEA"}</h2></div><button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center">✕</button></div><div className="p-6 overflow-y-auto custom-scrollbar flex-1"><table className="w-full text-left text-sm text-white/80"><thead className={`uppercase text-xs font-bold ${t.textAccent} border-b border-white/10`}><tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3 text-right">Cost</th></tr></thead><tbody className="divide-y divide-white/10">{logs.map((log) => (<tr key={log.id} className="hover:bg-white/5 transition-colors"><td className="p-3"><input type="date" value={log.date} onChange={(e)=>updateSubLog(activeModal, log.id, 'date', e.target.value)} className="bg-transparent outline-none text-white/70"/></td><td className="p-3"><input value={log.desc} placeholder="Item details..." onChange={(e)=>updateSubLog(activeModal, log.id, 'desc', e.target.value)} className="bg-transparent outline-none w-full placeholder-white/20"/></td><td className="p-3 text-right"><input type="number" value={log.amount} onChange={(e)=>updateSubLog(activeModal, log.id, 'amount', e.target.value)} className={`bg-transparent outline-none text-right font-bold text-xl ${t.textAccent} w-32`}/></td></tr>))}</tbody></table><button onClick={() => addSubLog(activeModal)} className={`mt-6 w-full py-3 rounded-xl border border-dashed border-white/30 text-white/50 hover:bg-white/5 hover:text-white transition-all uppercase font-bold tracking-widest`}>+ Add Entry</button></div><div className="p-6 bg-black/40 border-t border-white/10 flex justify-between items-center"><span className="text-white/50 uppercase tracking-widest font-bold">Total Cost</span><span className={`text-4xl font-black ${t.textAccent}`}>{modalTotal.toLocaleString()}</span></div></div></div>); };

  const renderMonthNavigator = () => (<div className={`flex items-center gap-4 ${t.panelBg} rounded-lg p-1 border ${t.border} min-w-[200px]`}><button onClick={() => changeMonth(-1)} className={`w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 hover:text-white transition-colors ${t.textAccent}`}>◀</button><div className={`text-sm font-bold ${t.textMain} uppercase tracking-widest w-full text-center select-none truncate px-2`}>{getFullDateDisplay()}</div><button onClick={() => changeMonth(1)} className={`w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 hover:text-white transition-colors ${t.textAccent}`}>▶</button></div>);
  const renderDateSlider = () => (<div className={`border-b ${t.border} py-1 overflow-x-auto custom-scrollbar shrink-0 glass-panel`}><div className="flex gap-1 px-2 min-w-max items-center">{Array.from({ length: daysInMonth(currentDate) }).map((_, i) => { const day = i + 1; const isActive = day === selectedDay; return (<button key={day} onClick={() => { setSelectedDay(day); setSelectedIds(new Set()); }} className={`group relative w-12 h-10 rounded flex flex-col items-center justify-center transition-all duration-200 border ${isActive ? `${t.button} border-white text-white scale-110 shadow-lg` : 'border-transparent text-slate-500 hover:text-white hover:bg-white/10'}`}><span className="text-[9px] uppercase font-bold leading-none mb-[1px]">Day</span><span className="text-xl font-black leading-none">{day}</span></button>); })}</div></div>);

  const renderUserBlock = (start: number, end: number) => {
    let blockTitle = "NAME"; if(start===0) blockTitle="INTERNET CAFE USER"; if(start===200) blockTitle="GAME USERS";
    return (
    <div className={`border rounded overflow-hidden mb-2 ${t.panelBg} ${t.glow} ${t.border} backdrop-blur-sm`}>
      <div className={`flex font-bold text-[10px] uppercase p-2 sticky top-0 z-10 border-b ${t.panelBg} ${t.textAccent} ${t.border}`}><div className="w-8 text-center">No</div><div className="flex-1 px-2">{blockTitle}</div><div className="w-16 text-center">In</div><div className="w-16 text-center">Out</div><div className="w-20 text-right">Amt</div><div className="w-8"></div></div>
      {currentData.users.slice(start, end).map((user: any) => {
        const isSelected = selectedIds.has(user.id);
        const overdueMinutes = getOverdueMinutes(user.timeOut);
        
        // ** BLINK LOGIC **
        const hasName = user.name && user.name.trim() !== '';
        const hasTime = user.timeOut && user.timeOut.trim() !== '';
        let isTimeUp = false; let isWarning = false;
        if (hasName && hasTime) { isTimeUp = overdueMinutes >= 0; isWarning = overdueMinutes >= -10 && overdueMinutes < 0; }

        const isLocked = user.isLocked || isTimeUp; 
        const isConflict = !isLocked && currentData.users.some((u: any) => u.id !== user.id && u.name && u.name.toLowerCase().trim() === user.name.toLowerCase().trim());
        let rowClass = `flex items-center border-b ${t.border} text-sm h-11 cursor-pointer transition-all duration-300 `; 
        if (isLocked) { rowClass += 'bg-red-950/80 text-white font-bold border-red-900 opacity-90'; } 
        else if (isWarning) { rowClass += 'animate-warning text-yellow-200'; } 
        else if (isSelected) { rowClass += 'bg-white/10'; } 
        else { rowClass += 'hover:bg-white/5'; }

        return (
          <div key={user.id} className={rowClass}>
            <div onClick={() => !isLocked && toggleSelect(user.id)} className={`w-8 text-center font-mono ${isSelected || isLocked ? 'text-white font-bold' : 'text-slate-500'}`}>{user.no}</div>
            <input disabled={isLocked} id={`name-${user.id}`} className={`flex-1 bg-transparent px-2 text-lg font-bold focus:outline-none ${isLocked ? 'cursor-not-allowed' : ''} ${isConflict ? 'text-white' : t.textMain}`} placeholder="Name" value={user.name} onChange={(e) => updateUser(user.id, 'name', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'name', currentData.users, 'users')}/>
            <input disabled={isLocked} id={`timeIn-${user.id}`} className="w-16 bg-transparent text-center text-base font-bold text-slate-400 focus:outline-none placeholder-slate-700 font-mono disabled:cursor-not-allowed disabled:text-white" placeholder="--:--" value={user.timeIn} onChange={(e) => updateUser(user.id, 'timeIn', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'timeIn', currentData.users, 'users')}/>
            <input disabled={isLocked} id={`timeOut-${user.id}`} className={`w-16 bg-transparent text-center text-base font-bold focus:outline-none placeholder-slate-700 font-mono disabled:cursor-not-allowed disabled:text-white ${!isLocked && isWarning ? 'text-red-400 font-black' : 'text-slate-400'}`} placeholder="--:--" value={user.timeOut} onChange={(e) => updateUser(user.id, 'timeOut', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'timeOut', currentData.users, 'users')}/>
            <input disabled={isLocked} id={`amount-${user.id}`} type="number" className={`w-20 bg-transparent text-right px-1 text-lg font-black focus:outline-none placeholder-slate-700 disabled:cursor-not-allowed disabled:text-white ${isLocked ? '' : t.textHighlight}`} placeholder="0" value={user.amount} onChange={(e) => updateUser(user.id, 'amount', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'amount', currentData.users, 'users')}/>
            <div className="w-8 flex justify-center items-center">{isLocked ? (<button onClick={() => initiateUnlock(user.id)} className="text-red-500 hover:text-white transition-colors">🔒</button>) : (<button onClick={(e) => { e.stopPropagation(); lockRow(user.id); }} className={`text-[10px] hover:scale-125 transition-transform ${isWarning ? 'text-yellow-400' : 'text-slate-600 hover:text-white'}`}>{isWarning ? '⚠️' : '⬜'}</button>)}</div>
          </div>
        );
      })}
    </div>
  )};

  return (
    <>
    <style jsx global>{styles}</style>
    <div className={`h-screen flex flex-col ${t.appBg} animate-gradient-bg ${t.textMain} font-sans overflow-hidden relative transition-colors duration-1000`}>
      {renderDetailsModal()} {renderAuthModal()} {renderChangePassModal()} {renderPoliceModal()}
      
      <header className={`flex justify-between items-center px-4 py-2 ${t.panelBg} border-b ${t.border} shadow-2xl shrink-0 z-50 relative h-[70px] backdrop-blur-md`}>
        <div className="shrink-0 z-20">{renderMonthNavigator()}</div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden"><div className="animate-bounce-text flex items-center"><h1 className={`text-3xl md:text-5xl font-black tracking-tightest italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)] filter contrast-150 transform skew-x-[-10deg] px-4 opacity-50`}>✨ WELCOME CLICK INTERNET CAFE ✨</h1></div></div>
        <div className={`flex items-center gap-6 z-20 ${t.panelBg} pl-6 pr-2 rounded-l-2xl border-l ${t.border} py-1 shadow-xl`}>
           <button onClick={cycleTheme} className={`w-10 h-10 rounded-full ${t.button} shadow-lg border border-white/20 flex items-center justify-center text-lg hover:scale-110 transition-transform active:rotate-180 duration-500`} title="Switch Theme">🎨</button>
           <div className="flex flex-col items-end justify-center border-r border-slate-600 pr-6 mr-2">
             <span className="text-[10px] text-slate-400 uppercase tracking-[0.4em] leading-none mb-1">Owner</span>
             <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono leading-none tracking-widest filter contrast-125">Rashid Imam</span>
           </div>
           {currentView === 'users' && <div className="text-right"><p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">{displayLabel}</p><p className={`text-xl font-mono font-black leading-none ${t.textHighlight}`}>{displayTotal.toLocaleString()} <span className="text-[10px] text-slate-500">PKR</span></p></div>}
           {currentView === 'workers' && <div className="text-right"><p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Payable</p><p className={`text-xl font-mono font-black leading-none ${t.textAccent}`}>{totalPayable.toLocaleString()} <span className="text-[10px] text-slate-500">PKR</span></p></div>}
           {currentView === 'expenses' && <div className="text-right"><p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Total Exp</p><p className="text-xl font-mono font-black leading-none text-red-400">{totalExpenses.toLocaleString()} <span className="text-[10px] text-slate-500">PKR</span></p></div>}
        </div>
      </header>

      {(currentView !== 'financials' && currentView !== 'analytics') && renderDateSlider()}

      <main className="flex-1 overflow-y-auto custom-scrollbar p-2 relative">
        {currentView === 'users' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-32 items-start"><div>{renderUserBlock(0, 100)}</div><div>{renderUserBlock(100, 200)}</div><div>{renderUserBlock(200, 300)}</div></div>)}
        {currentView === 'workers' && <div className="pb-32"><div className="p-4 max-w-4xl mx-auto"><h2 className={`text-xl ${t.textAccent} mb-4 font-bold border-b ${t.border} pb-2`}>Worker Salary Sheet</h2><div className={`${t.panelBg} rounded-lg overflow-hidden border ${t.border} shadow-lg`}><table className="w-full text-left text-sm text-slate-300"><thead className={`bg-black/50 ${t.textAccent} uppercase text-xs`}><tr><th className="p-3">Name</th><th className="p-3 text-center">Reputation</th><th className="p-3 text-right">Salary</th><th className="p-3 text-right text-red-400">Advance</th><th className="p-3 text-right text-green-400">Bonus</th><th className="p-3 text-right text-white">Remaining</th><th className="p-3 text-center">Action</th></tr></thead><tbody className={`divide-y ${t.border}`}>{currentData.workers.map((w: any) => { const balance = w.salary + w.bonus - w.advance; return (<tr key={w.id} className="hover:bg-white/5"><td className="p-3"><input id={`name-${w.id}`} value={w.name} onChange={(e)=>updateWorkerName(w.id, e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'name', currentData.workers, 'workers')} className={`bg-transparent font-black text-xl ${t.textMain} outline-none w-full`}/></td><td className="p-3 flex justify-center gap-1">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => initiateRating(w.id, star)} className={`text-lg transition-transform hover:scale-125 ${star <= w.rating ? 'text-yellow-400' : 'text-slate-600'}`}>★</button>))}</td><td className="p-3 text-right"><input id={`salary-${w.id}`} type="number" value={w.salary} onChange={(e)=>updateWorker(w.id, 'salary', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'salary', currentData.workers, 'workers')} className="bg-transparent text-right outline-none w-24 font-black text-xl"/></td><td className="p-3 text-right"><input id={`advance-${w.id}`} type="number" value={w.advance} onChange={(e)=>updateWorker(w.id, 'advance', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'advance', currentData.workers, 'workers')} className="bg-transparent text-right outline-none w-20 font-bold text-lg text-red-400"/></td><td className="p-3 text-right"><input id={`bonus-${w.id}`} type="number" value={w.bonus} onChange={(e)=>updateWorker(w.id, 'bonus', e.target.value)} onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'bonus', currentData.workers, 'workers')} className="bg-transparent text-right outline-none w-20 font-bold text-lg text-green-400"/></td><td className={`p-3 text-right font-black text-2xl ${t.textHighlight}`}>{balance.toLocaleString()}</td><td className="p-3 text-center"><button onClick={() => initiateDeleteWorker(w.id)} className="text-slate-500 hover:text-red-500 transition-colors text-xl">🗑️</button></td></tr>) })}</tbody></table></div><button onClick={addWorker} className={`mt-4 px-4 py-2 ${t.button} text-white rounded-lg text-sm font-bold border border-white/20 flex items-center gap-2 shadow-lg`}><span className="text-lg font-bold">+</span> Add New Worker</button></div></div>}
        {currentView === 'expenses' && <div className="pb-32">{renderExpenses()}</div>}
        {currentView === 'financials' && renderFinancials()}
        {currentView === 'analytics' && renderAnalytics()}
      </main>

      <nav className={`shrink-0 ${t.panelBg} border-t ${t.border} p-2 flex justify-center gap-6 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] z-50 backdrop-blur-md`}>
        <button onClick={() => setCurrentView('users')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'users' ? `${t.button} text-white shadow-lg -translate-y-1` : 'bg-transparent text-slate-400 hover:text-white'}`}>👥 Users</button>
        <button onClick={() => setCurrentView('workers')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'workers' ? `${t.button} text-white shadow-lg -translate-y-1` : 'bg-transparent text-slate-400 hover:text-white'}`}>👷 Workers</button>
        <button onClick={() => setCurrentView('expenses')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'expenses' ? `${t.button} text-white shadow-lg -translate-y-1` : 'bg-transparent text-slate-400 hover:text-white'}`}>📉 Expenses</button>
        <button onClick={() => setCurrentView('analytics')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'analytics' ? `${t.button} text-white shadow-lg -translate-y-1` : 'bg-transparent text-slate-400 hover:text-white'}`}>📊 Graph</button>
        {/* AI BUTTON (FIXED BOTTOM RIGHT) */}
        <button onClick={() => { setAuthAction({ type: 'ACCESS_HQ' }); setShowAuthModal(true); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'financials' ? 'bg-purple-600 text-white shadow-lg -translate-y-1' : 'bg-transparent text-slate-400 hover:text-white'}`}>🔒 Financials</button>
      </nav>

      {/* AI CHAT BUTTON & WINDOW (FIXED BOTTOM RIGHT) */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
        {isChatOpen && (
          <div className={`${t.panelBg} backdrop-blur-md border ${t.border} rounded-2xl shadow-2xl w-80 h-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300`}>
              <div className={`p-3 border-b ${t.border} flex justify-between items-center bg-black/20`}><div className="flex items-center gap-2"><span className="text-2xl">🤖</span><span className={`font-bold ${t.textAccent} text-sm`}>Click AI</span></div><button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">✕</button></div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">{messages.map((m, i) => (<div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${m.sender === 'user' ? `${t.button} text-white rounded-br-none` : m.isSecure ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-100 rounded-bl-none' : 'bg-white/10 text-slate-300 rounded-bl-none'}`}>{m.text}</div></div>))}<div ref={chatEndRef} /></div>
              <div className="p-3 bg-black/30 border-t border-white/10"><div className="flex gap-2"><input type={awaitingAiAuth ? "password" : "text"} placeholder={awaitingAiAuth ? "PIN..." : "Ask..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()} className={`flex-1 bg-black/50 border ${awaitingAiAuth ? 'border-red-500' : 'border-slate-600'} rounded-full px-4 py-2 text-xs focus:outline-none focus:border-white text-white`}/><button onClick={handleAiSubmit} className={`w-8 h-8 ${t.button} rounded-full flex items-center justify-center text-white`}>➤</button></div></div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full ${t.glow} flex items-center justify-center text-3xl shadow-lg border-2 border-white/20 hover:scale-110 transition-transform`}>🤖</button>
      </div>
    </div>
    </>
  );
}