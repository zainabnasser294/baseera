import re

file_path = "c:\\Users\\saraa\\Downloads\\baseera - Copy (6)\\baseera - Copy (6)\\baseera - Copy\\dashboard\\templates\\dashboard\\ask_basira.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert Drawer and Overlay right after {% block content %}
drawer_html = """
<!-- Chat History Drawer -->
<div id="chatHistoryDrawer" class="fixed top-0 bottom-0 {% if trans.lang_code == 'ar' %}right-0 translate-x-full{% else %}left-0 -translate-x-full{% endif %} w-80 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[100] transition-transform duration-300 flex flex-col border-{% if trans.lang_code == 'ar' %}l{% else %}r{% endif %} border-white/20">
    <div class="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <h2 class="text-lg font-bold text-ink">{% if trans.lang_code == 'ar' %}سجل المحادثات{% else %}Chat History{% endif %}</h2>
        <button onclick="toggleChatHistory()" class="grid place-items-center h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500">
            <i data-lucide="x" class="h-5 w-5"></i>
        </button>
    </div>
    <div class="p-4 border-b border-slate-200 dark:border-slate-800">
        <button onclick="createNewChat()" class="w-full rounded-xl bg-gradient-to-r from-[var(--nile)] to-[var(--glow)] text-white font-semibold py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-indigo-500/20">
            <i data-lucide="plus" class="h-4 w-4"></i>
            {% if trans.lang_code == 'ar' %}محادثة جديدة{% else %}New Chat{% endif %}
        </button>
    </div>
    <div id="chatHistoryList" class="flex-1 overflow-y-auto p-2 space-y-1">
        <!-- List items go here -->
    </div>
</div>
<!-- Overlay -->
<div id="chatHistoryOverlay" onclick="toggleChatHistory()" class="fixed inset-0 bg-black/40 z-[90] hidden backdrop-blur-sm transition-opacity"></div>
"""
if "id=\"chatHistoryDrawer\"" not in content:
    content = content.replace("{% block content %}", "{% block content %}\n" + drawer_html)


# 2. Insert Button in Header
header_search = """<section class="rounded-3xl glass px-6 py-5 animate-fade-up shrink-0">
            <div class="flex items-center gap-3">"""
header_replace = """<section class="rounded-3xl glass px-6 py-5 flex items-center justify-between animate-fade-up shrink-0">
            <div class="flex items-center gap-3">"""

if "justify-between" not in content.split("<!-- Page Header -->")[1].split("</section>")[0]:
    content = content.replace(header_search, header_replace)
    
button_html = """
                </div>
            </div>
            <button onclick="toggleChatHistory()" class="flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-white/50 text-sm font-semibold hover:bg-white/50 transition">
                <i data-lucide="history" class="h-4 w-4"></i>
                {% if trans.lang_code == 'ar' %}سجل المحادثات{% else %}Chat History{% endif %}
            </button>
        </section>"""
        
content = re.sub(r'</div>\s*</section>', button_html, content, count=1)


# 3. Update JS Logic
js_search = "let chatHistory = [];"
js_replace = """let chatHistory = [];
let currentSessionId = Date.now();
let webChatSessions = JSON.parse(localStorage.getItem('basira_web_chat_sessions')) || [];

function saveChatHistory() {
    if (chatHistory.length === 0) return;
    const sessionIndex = webChatSessions.findIndex(s => s.id === currentSessionId);
    let title = chatHistory[0].content.substring(0, 30) + '...';
    
    if (sessionIndex !== -1) {
        webChatSessions[sessionIndex].history = chatHistory;
        webChatSessions[sessionIndex].title = title;
    } else {
        webChatSessions.unshift({
            id: currentSessionId,
            title: title,
            history: chatHistory
        });
    }
    localStorage.setItem('basira_web_chat_sessions', JSON.stringify(webChatSessions));
    renderChatHistoryList();
}

function toggleChatHistory() {
    const drawer = document.getElementById('chatHistoryDrawer');
    const overlay = document.getElementById('chatHistoryOverlay');
    if (drawer.classList.contains('translate-x-full') || drawer.classList.contains('-translate-x-full')) {
        drawer.classList.remove('translate-x-full', '-translate-x-full');
        overlay.classList.remove('hidden');
        renderChatHistoryList();
    } else {
        // Hide
        const isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
        if (isAr) drawer.classList.add('translate-x-full');
        else drawer.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

function createNewChat() {
    chatHistory = [];
    currentSessionId = Date.now();
    toggleChatHistory();
    renderAllMessages();
}

function loadChatSession(id) {
    const session = webChatSessions.find(s => s.id === id);
    if (session) {
        currentSessionId = session.id;
        chatHistory = session.history || [];
        toggleChatHistory();
        renderAllMessages();
    }
}

function deleteChatSession(id, event) {
    event.stopPropagation();
    webChatSessions = webChatSessions.filter(s => s.id !== id);
    localStorage.setItem('basira_web_chat_sessions', JSON.stringify(webChatSessions));
    if (currentSessionId === id) {
        chatHistory = [];
        currentSessionId = Date.now();
        renderAllMessages();
    }
    renderChatHistoryList();
}

function renderChatHistoryList() {
    const list = document.getElementById('chatHistoryList');
    if (!list) return;
    list.innerHTML = '';
    
    if (webChatSessions.length === 0) {
        list.innerHTML = '<div class="text-center text-xs text-muted-foreground mt-10">{% if trans.lang_code == "ar" %}لا توجد محادثات سابقة{% else %}No previous chats{% endif %}</div>';
        return;
    }
    
    webChatSessions.forEach(session => {
        const isActive = session.id === currentSessionId;
        const btn = document.createElement('div');
        btn.className = `group flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${isActive ? 'bg-[var(--nile)]/10 text-[var(--nile)]' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`;
        btn.onclick = () => loadChatSession(session.id);
        
        btn.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <i data-lucide="message-square" class="h-4 w-4 shrink-0"></i>
                <div class="text-sm font-medium truncate">${session.title}</div>
            </div>
            <button onclick="deleteChatSession(${session.id}, event)" class="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition shrink-0">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        `;
        list.appendChild(btn);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAllMessages() {
    const messages = document.getElementById('chatMessages');
    const welcomeHtml = `
        <div class="flex gap-3">
            <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--nile)] to-[var(--glow)] grid place-items-center">
                <i data-lucide="sparkles" class="h-3.5 w-3.5 text-white"></i>
            </div>
            <div class="rounded-2xl rounded-tl-sm bg-white/70 border border-white px-4 py-3 max-w-lg">
                <p class="text-sm">
                    {% if trans.lang_code == 'ar' %}
                    مرحباً بك{% if user.is_authenticated %}, {{ user.username }}{% endif %}!  أنا بصيرة، مساعدك الذكي للبيانات. اسألني أي سؤال عن ملفات المبيعات الخاصة بك — يمكنني إنشاء رسوم بيانية وتلخيص النتائج وتحديد الفروقات.
                    {% else %}
                    Hello{% if user.is_authenticated %}, {{ user.username }}{% endif %}!  I'm Basira, your data assistant. Ask me anything about your datasets — I can generate charts, summarize trends, and highlight insights.
                    {% endif %}
                </p>
            </div>
        </div>
        <div class="flex flex-wrap gap-2 {% if trans.lang_code == 'ar' %}mr-11{% else %}ml-11{% endif %}">
            <button onclick="fillQuestion(this)" class="rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs font-medium hover:bg-white/80 transition">
                {% if trans.lang_code == 'ar' %} ما هي أعلى المنتجات مبيعاً الربع الأخير؟{% else %} What were my top products last quarter?{% endif %}
            </button>
            <button onclick="fillQuestion(this)" class="rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs font-medium hover:bg-white/80 transition">
                {% if trans.lang_code == 'ar' %} اعرض منحنى المبيعات لآخر ٦ أشهر{% else %} Show revenue trend for the past 6 months{% endif %}
            </button>
            <button onclick="fillQuestion(this)" class="rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs font-medium hover:bg-white/80 transition">
                {% if trans.lang_code == 'ar' %} هل توجد أي أخطاء أو هدر في بياناتي؟{% else %} Are there any anomalies in my data?{% endif %}
            </button>
        </div>
    `;
    
    if (chatHistory.length === 0) {
        messages.innerHTML = welcomeHtml;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    messages.innerHTML = '';
    chatHistory.forEach((msg, idx) => {
        if (msg.role === 'user') {
            const userDiv = document.createElement('div');
            userDiv.className = 'flex gap-3 {% if trans.lang_code == "ar" %}justify-start{% else %}justify-end{% endif %} mb-4';
            userDiv.innerHTML = `
                <div class="rounded-2xl rounded-tr-sm bg-gradient-to-r from-[var(--nile)] to-[var(--glow)] px-4 py-3 max-w-lg text-white">
                    <p class="text-sm">${msg.content}</p>
                </div>
            `;
            messages.appendChild(userDiv);
        } else {
            const botDiv = document.createElement('div');
            botDiv.className = 'flex flex-col gap-2 mb-4';
            
            let displayReply = msg.content;
            const jsonRegex = /\`\`\`json\s*([\s\S]*?)(\`\`\`|$)/g;
            displayReply = displayReply.replace(jsonRegex, '').trim();
            
            let htmlContent = typeof marked !== 'undefined' ? marked.parse(displayReply) : displayReply.replace(/\\n/g, '<br>');
            
            botDiv.innerHTML = `
                <div class="flex gap-3">
                    <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--nile)] to-[var(--glow)] grid place-items-center">
                        <i data-lucide="sparkles" class="h-3.5 w-3.5 text-white"></i>
                    </div>
                    <div class="rounded-2xl rounded-tl-sm bg-white/70 border border-white px-4 py-3 max-w-lg text-{{ trans.align }}">
                        <div class="markdown-content text-sm leading-relaxed">${htmlContent}</div>
                    </div>
                </div>
            `;
            messages.appendChild(botDiv);
            
            // Re-render charts if JSON exists in this message
            let match;
            const localJsonRegex = /```json\s*([\s\S]*?)\s*```/g;
            let jsonBlocks = [];
            while ((match = localJsonRegex.exec(msg.content)) !== null) {
                jsonBlocks.push(match[1]);
            }
            
            jsonBlocks.forEach((jsonText, jIdx) => {
                try {
                    const parsed = JSON.parse(jsonText.trim());
                    if (parsed.widgets || parsed.type || parsed.title) {
                        const widgetContainer = document.createElement('div');
                        widgetContainer.className = 'w-full max-w-xl {% if trans.lang_code == "ar" %}mr-11{% else %}ml-11{% endif %} mt-2 flex flex-col gap-3';
                        const widgetsList = parsed.widgets || [parsed];
                        widgetsList.forEach((w, wIdx) => {
                            const widgetId = `widget-hist-${idx}-${jIdx}-${wIdx}`;
                            const card = document.createElement('div');
                            card.className = 'rounded-2xl glass-strong p-5 border border-white/80 shadow-md flex flex-col gap-2';
                            
                            if (w.type === 'kpi_card') {
                                const valueField = w.config ? w.config.value_field : 'Total';
                                const aggType = w.config ? w.config.aggregation : 'SUM';
                                const unit = w.config ? w.config.unit : 'ر.ع.';
                                const totalVal = aggregateKpi(valueField, aggType);
                                card.innerHTML = `
                                    <div class="text-xs uppercase tracking-wider text-muted-foreground font-semibold">${w.title}</div>
                                    <div class="text-3xl font-extrabold text-[var(--nile)]">${totalVal.toLocaleString('ar-OM', { maximumFractionDigits: 2 })} ${unit}</div>
                                `;
                            } else if (w.type === 'bar_chart' || w.type === 'line_chart' || w.type === 'pie_chart') {
                                const xField = w.config ? w.config.x_axis : 'Category';
                                const yField = w.config ? w.config.y_axis : 'Total';
                                const aggType = w.config ? w.config.aggregation : 'SUM';
                                const aggregated = aggregateData(xField, yField, aggType);
                                card.innerHTML = `
                                    <div class="text-sm font-bold text-ink mb-1">${w.title}</div>
                                    <div class="relative w-full h-[220px]"><canvas id="${widgetId}"></canvas></div>
                                `;
                                setTimeout(() => {
                                    const canvasEl = document.getElementById(widgetId);
                                    if (!canvasEl) return;
                                    const ctx = canvasEl.getContext('2d');
                                    const colors = ['#2b2470', '#7c6cf0', '#b9a6f2', '#f43f5e', '#10b981'];
                                    new Chart(ctx, {
                                        type: w.type === 'line_chart' ? 'line' : (w.type === 'pie_chart' ? 'pie' : 'bar'),
                                        data: {
                                            labels: aggregated.labels,
                                            datasets: [{
                                                label: w.title,
                                                data: aggregated.data,
                                                backgroundColor: w.type === 'pie_chart' ? colors : 'rgba(124, 108, 240, 0.55)',
                                                borderColor: '#7c6cf0',
                                                borderWidth: w.type === 'line_chart' ? 2 : 1,
                                                borderRadius: w.type === 'bar_chart' ? 8 : 0,
                                                tension: w.type === 'line_chart' ? 0.35 : 0
                                            }]
                                        },
                                        options: { responsive: true, maintainAspectRatio: false }
                                    });
                                }, 100);
                            }
                            widgetContainer.appendChild(card);
                        });
                        botDiv.appendChild(widgetContainer);
                    }
                } catch(e) {}
            });
        }
    });
    
    messages.scrollTop = messages.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    if (webChatSessions.length > 0) {
        currentSessionId = webChatSessions[0].id;
        chatHistory = webChatSessions[0].history || [];
        renderAllMessages();
    }
});
"""

if "function saveChatHistory()" not in content:
    content = content.replace(js_search, js_replace)

# Inject saveChatHistory() after stream completion
save_hook_search = "chatHistory.push({ role: \"assistant\", content: fullReply });"
save_hook_replace = "chatHistory.push({ role: \"assistant\", content: fullReply });\n        saveChatHistory();"
if "saveChatHistory();" not in content:
    content = content.replace(save_hook_search, save_hook_replace)

save_user_hook_search = "chatHistory.push({ role: \"user\", content: text });"
save_user_hook_replace = "chatHistory.push({ role: \"user\", content: text });\n    saveChatHistory();"
if "saveChatHistory();" not in content.split("chatHistory.push({ role: \"user\", content: text });")[1][:50]:
    content = content.replace(save_user_hook_search, save_user_hook_replace)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
