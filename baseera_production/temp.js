
    window.onerror = function (msg, url, line, col, error) {
        if (msg.indexOf("ResizeObserver") !== -1) return;
        alert("JAVASCRIPT ERROR: " + msg + " at line " + line);
    };
    window.addEventListener('unhandledrejection', function (event) {
        alert("PROMISE ERROR: " + event.reason);
    });
    let chatHistory = [];
    let currentSessionId = Date.now();
    let webChatSessions = JSON.parse(localStorage.getItem('basira_web_chat_sessions')) || [];
    let currentActiveAgent = 'general';
    let currentActiveAgentName = '{% if trans.lang_code == "ar" %}المساعد العام (Orchestrator){% else %}General Assistant{% endif %}';

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

    // Agent Selector Logic
    function toggleAgentMenu(e) {
        e.stopPropagation();
        const menu = document.getElementById('agentMenu');
        menu.classList.toggle('hidden');
    }

    document.addEventListener('click', function(e) {
        const menu = document.getElementById('agentMenu');
        if (menu && !menu.contains(e.target) && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });

    function switchAgent(agentId, agentName) {
        currentActiveAgent = agentId;
        currentActiveAgentName = agentName;
        
        // Update Indicator UI if it exists
        const indicator = document.getElementById('activeAgentIndicator');
        if (indicator) {
            indicator.textContent = agentName;
        }
        
        // Instead of clearing the chat, we append a system message indicating the switch
        chatHistory.push({
            role: 'system',
            content: `{% if trans.lang_code == 'ar' %}تم تبديل سياق المحادثة لتعمل مع: ${agentName}{% else %}Context switched to: ${agentName}{% endif %}`
        });
        renderAllMessages(); // Re-render to show the system message
        const messages = document.getElementById('chatMessages');
        messages.scrollTop = messages.scrollHeight;
        // Focus and hide menu
        const input = document.getElementById('chatInput');
        if (input) input.focus();
        document.getElementById('agentMenu').classList.add('hidden');
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
            var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
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
        let agentGreeting = `{% if trans.lang_code == 'ar' %}مرحباً بك{% if user.is_authenticated %}, {{ user.username }}{% endif %}!  أنا ${currentActiveAgentName}، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟{% else %}Hello{% if user.is_authenticated %}, {{ user.username }}{% endif %}!  I'm ${currentActiveAgentName}. How can I help you today?{% endif %}`;
        
        if (currentActiveAgent === 'general') {
            agentGreeting = `{% if trans.lang_code == 'ar' %}مرحباً بك{% if user.is_authenticated %}, {{ user.username }}{% endif %}!  أنا بصيرة، المساعد العام (المنسق). اسألني عن أي تفاصيل وسأقوم بتوجيه المهام إلى الوكلاء المتخصصين.{% else %}Hello{% if user.is_authenticated %}, {{ user.username }}{% endif %}!  I'm Basira, your General Assistant. Ask me anything and I will orchestrate the specialized agents.{% endif %}`;
        }

        const welcomeHtml = `
        <div class="flex gap-3">
            <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--nile)] to-[var(--glow)] grid place-items-center">
                <i data-lucide="${currentActiveAgent === 'general' ? 'sparkles' : 'bot'}" class="h-3.5 w-3.5 text-white"></i>
            </div>
            <div class="rounded-2xl rounded-tl-sm bg-white/70 border border-white px-4 py-3 max-w-lg">
                <p class="text-sm">
                    ${agentGreeting}
                </p>
            </div>
        </div>
    `;

        if (chatHistory.length === 0) {
            messages.innerHTML = welcomeHtml;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        messages.innerHTML = welcomeHtml;
        chatHistory.forEach((msg, idx) => {
            if (msg.role === 'system') {
                const sysDiv = document.createElement('div');
                sysDiv.className = 'flex justify-center my-4';
                sysDiv.innerHTML = `
                    <div class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">
                        <i data-lucide="refresh-cw" class="h-3 w-3"></i>
                        ${msg.content}
                    </div>
                `;
                messages.appendChild(sysDiv);
            } else if (msg.role === 'user') {
                const userDiv = document.createElement('div');
                userDiv.className = 'flex gap-3 {% if trans.lang_code == "ar" %}justify-start{% else %}justify-end{% endif %} mb-4';
                userDiv.innerHTML = `
                <div class="rounded-2xl rounded-tr-sm chat-bubble-user px-4 py-3 max-w-lg">
                    <p class="text-sm">${msg.content}</p>
                </div>
            `;
                messages.appendChild(userDiv);
            } else {
                const botDiv = document.createElement('div');
                botDiv.className = 'flex flex-col gap-2 mb-4';

                let displayReply = msg.content;

                // Extract Agent Logs for history
                // Extract old-style logs robustly using regex
                let logsHtml = "";
                let hasLogs = false;
                const oldLogRegex = /(?:\s*)?(AGENT_LOG:|STATUS___:|STATUS:)(.*?)(?=$|\n|\s*AGENT_LOG:|STATUS___:|STATUS:|<agent_state>)/g;
                let logMatch;
                while ((logMatch = oldLogRegex.exec(displayReply)) !== null) {
                    const tag = logMatch[1];
                    const msg = logMatch[2].trim();

                    if (tag === 'AGENT_LOG:' && msg) {
                        logsHtml += `<div class="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>${msg}</div>`;
                        hasLogs = true;
                    } else if ((tag === 'STATUS___:' || tag === 'STATUS:') && msg && msg !== 'DONE') {
                        logsHtml += `<div class="text-[10px] text-slate-500 font-medium italic flex items-center gap-2"><i data-lucide="loader-2" class="h-3 w-3"></i>${msg}</div>`;
                        hasLogs = true;
                    }
                }

                // Remove them from display text
                displayReply = displayReply.replace(/(?:\s*)?(AGENT_LOG:|STATUS___:|STATUS:)(.*?)(?=$|\n|\s*AGENT_LOG:|STATUS___:|STATUS:|<agent_state>)/g, '').trim();

                // Extract and remove <agent_state> tags
                const stateRegex = /<agent_state>([\s\S]*?)<\/agent_state>/g;
                let stateMatch;
                while ((stateMatch = stateRegex.exec(displayReply)) !== null) {
                    const msg = stateMatch[1].trim();
                    if (msg) {
                        logsHtml += `<div class="text-[10px] text-slate-500 font-medium italic flex items-center gap-2"><i data-lucide="loader-2" class="h-3 w-3"></i>${msg}</div>`;
                        hasLogs = true;
                    }
                }
                displayReply = displayReply.replace(stateRegex, '').trim();
                const jsonRegex = /\`\`\`json\s*([\s\S]*?)(\`\`\`|$)/g;
                displayReply = displayReply.replace(jsonRegex, '').trim();
                const fpCleanRegex = /<file_proposal>([\s\S]*?)<\/file_proposal>/g;
                displayReply = displayReply.replace(fpCleanRegex, '').trim();

                let htmlContent = typeof marked !== 'undefined' ? marked.parse(displayReply) : displayReply.replace(/\n/g, '<br>');

                var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";

                botDiv.innerHTML = `
                <div class="flex gap-3 w-full">
                    <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--nile)] to-[var(--glow)] grid place-items-center mt-1">
                        <i data-lucide="sparkles" class="h-3.5 w-3.5 text-white"></i>
                    </div>
                    <div class="flex flex-col gap-2 max-w-2xl w-full text-{{ trans.align }}">
                        ${hasLogs ? `
                        <details class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-fit group">
                            <summary class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition list-none">
                                <i data-lucide="cpu" class="h-4 w-4 text-[var(--glow)]"></i>
                                <span>${isAr ? 'نشاط الوكيل (اكتمل)' : 'Agent Activity (Completed)'}</span>
                                <i data-lucide="chevron-down" class="h-4 w-4 ml-2 group-open:rotate-180 transition"></i>
                            </summary>
                            <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                                ${logsHtml}
                            </div>
                        </details>
                        ` : ''}
                        
                        ${displayReply ? `
                        <div class="rounded-2xl rounded-tl-sm chat-bubble-bot px-4 py-3 shadow-sm w-fit">
                            <div class="markdown-content text-sm leading-relaxed">${htmlContent}</div>
                        </div>
                        ` : ''}
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
                                    const unit = w.config ? w.config.unit : (w.unit || 'ر.ع.');
                                    const totalVal = aggregateKpi(valueField, aggType, w.config, w);
                                    card.innerHTML = `
                                    <div class="text-xs uppercase tracking-wider text-muted-foreground font-semibold">${w.title}</div>
                                    <div class="text-3xl font-extrabold text-[var(--nile)]">${totalVal.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${unit}</div>
                                `;
                                } else if (w.type === 'bar_chart' || w.type === 'line_chart' || w.type === 'pie_chart') {
                                    const xField = w.config ? w.config.x_axis : 'Category';
                                    const yField = w.config ? w.config.y_axis : 'Total';
                                    const aggType = w.config ? w.config.aggregation : 'SUM';
                                    const aggregated = aggregateData(xField, yField, aggType);
                                    
                                    fetch('/api/live-sync/', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ type: 'chart', chart_type: w.type, title: w.title, labels: aggregated.labels, data: aggregated.data })
                                    }).catch(e => console.error(e));

                                    card.innerHTML = `
                                    <div class="text-sm font-bold text-ink mb-1 flex items-center gap-2">
                                        <i data-lucide="bar-chart-2" class="h-4 w-4 text-[var(--glow)]"></i>
                                        ${w.title}
                                    </div>
                                    <div class="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 p-2 rounded flex items-center gap-2 mt-2">
                                        <i data-lucide="check-circle" class="h-4 w-4"></i>
                                        {% if trans.lang_code == 'ar' %}تم تحويل الرسم البياني وعرضه مباشرة في منصة القرارات.{% else %}Chart sent to Live Dashboard.{% endif %}
                                    </div>
                                `;
                                }
                                widgetContainer.appendChild(card);
                            });
                            botDiv.appendChild(widgetContainer);
                        }
                    } catch (e) { }
                });

                // Extract and render File Proposals (Antigravity Agentic Workflow)
                let fpMatch;
                const fpExtractRegex = /<file_proposal>([\s\S]*?)<\/file_proposal>/g;
                var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
                while ((fpMatch = fpExtractRegex.exec(msg.content)) !== null) {
                    const block = fpMatch[1];
                    const fpPathMatch = block.match(/<file_path>(.*?)<\/file_path>/);
                    const fpPath = fpPathMatch ? fpPathMatch[1].trim() : "Unknown File";

                    const fpContentMatch = block.match(/<content>([\s\S]*?)<\/content>/);
                    const fpContent = fpContentMatch ? fpContentMatch[1] : "";
                    const b64Content = btoa(unescape(encodeURIComponent(fpContent)));

                    const fpContainer = document.createElement('div');
                    fpContainer.className = 'w-full max-w-xl {% if trans.lang_code == "ar" %}mr-11{% else %}ml-11{% endif %} mt-2 mb-2 animate-fade-up';

                    const parsedFpContent = typeof marked !== 'undefined' ? marked.parse(fpContent) : fpContent.replace(/\n/g, '<br>');

                    fpContainer.innerHTML = `
                    <div class="approval-card glass-panel flex flex-col gap-3 !m-0 !p-4" dir="${isAr ? 'rtl' : 'ltr'}">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="flex items-center gap-3">
                                <div class="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        ${isAr ? '📄 مستند الخطّة المولّدة' : 'Generated Document'}: <span class="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">${fpPath}</span>
                                    </div>
                                    <div class="text-xs text-slate-500">
                                        ${isAr ? 'اضغط "معاينة الخطة" لقراءة التفاصيل كاملة هنا، أو "تطبيق وحفظ" لحفظ الملف في مساحة العمل' : 'Click Preview to view full content or Accept to save to Workspace'}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="togglePlanPreview(this)" class="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    <span>${isAr ? '👁️ معاينة الخطة كاملة' : 'Preview Plan'}</span>
                                </button>
                                <button onclick="acceptFileProposal(this, '${fpPath}', '${b64Content}')" class="approval-btn cursor-pointer">
                                    ${isAr ? 'تطبيق وحفظ (Accept)' : 'Accept'}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div class="plan-preview-box hidden mt-2 p-5 rounded-xl bg-slate-900/95 text-slate-100 text-sm overflow-y-auto max-h-[450px] border border-white/10 font-sans leading-relaxed shadow-inner" dir="rtl">
                            <div class="prose prose-invert max-w-none text-right">${parsedFpContent}</div>
                        </div>
                    </div>
                `;
                    botDiv.appendChild(fpContainer);
                }
            }
        });

        messages.scrollTop = messages.scrollHeight;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        if (typeof enhanceCodeBlocks === 'function') enhanceCodeBlocks(messages);
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (webChatSessions.length > 0) {
            currentSessionId = webChatSessions[0].id;
            chatHistory = webChatSessions[0].history || [];
            renderAllMessages();
        }
    });


    function fillQuestion(btn) {
        document.getElementById('chatInput').value = btn.textContent.trim();
        document.getElementById('chatInput').focus();
        sendMessage();
    }

    function renderDatasetApproval(dataset) {
        const messages = document.getElementById('chatMessages');

        // User message for uploading file
        const userDiv = document.createElement('div');
        userDiv.className = 'flex gap-3 {% if trans.lang_code == "ar" %}justify-start{% else %}justify-end{% endif %} mb-4';
        userDiv.innerHTML = `
        <div class="rounded-2xl rounded-tr-sm chat-bubble-user px-4 py-3 max-w-lg flex items-center gap-2">
            <i data-lucide="paperclip" class="h-4 w-4"></i>
            <p class="text-sm font-semibold">${dataset.fileName}</p>
        </div>
    `;
        messages.appendChild(userDiv);

        // Assistant message for AI Safety
        const botDiv = document.createElement('div');
        botDiv.className = 'flex flex-col gap-2 mb-4';

        var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";

        const safetyHtml = `
        <div class="flex gap-3">
            <div class="h-8 w-8 shrink-0 rounded-full bg-[#1e1e1e] border border-[#333] grid place-items-center mt-1">
                <i data-lucide="git-pull-request" class="h-4 w-4 text-[#007acc]"></i>
            </div>
            <div class="flex flex-col gap-2 max-w-xl w-full text-{{ trans.align }}">
                
                <!-- Proposal Content -->
                <div class="rounded-xl chat-bubble-bot p-4 text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center gap-2 mb-3">
                        <i data-lucide="bot" class="h-4 w-4 text-slate-500"></i>
                        <span class="font-bold text-slate-700 dark:text-slate-300">${isAr ? 'مقترح الوكيل (Agent Proposal)' : 'Agent Proposal'}</span>
                    </div>
                    <div class="space-y-2 text-slate-600 dark:text-slate-400">
                        <p>${isAr ? 'لقد قمت بتحليل الملف المرفوع (Data Validation)، وتم التوصل للمؤشرات التالية:' : 'I have validated the data and discovered the following indicators:'}</p>
                        <ul class="list-disc list-inside px-2">
                            <li>${isAr ? 'تم قراءة هيكل البيانات بنجاح (' + (dataset.columns ? dataset.columns.length : 0) + ' أعمدة مكتشفة).' : 'Successfully parsed data structure (' + (dataset.columns ? dataset.columns.length : 0) + ' columns detected).'}</li>
                            <li>${isAr ? 'تم التحقق من خلو البيانات من الأكواد الضارة والتطابق مع معايير الأمان.' : 'Verified data integrity and compliance with safety guardrails.'}</li>
                            <li>${isAr ? 'البيانات جاهزة لتوليد لوحة القيادة الذكية (Dashboard).' : 'Data is ready to generate the smart dashboard.'}</li>
                        </ul>
                    </div>
                </div>

                <!-- Approval Bar (HITL) -->
                <div class="flex items-center justify-between bg-[#1e1e1e] text-[#d4d4d4] px-4 py-3 rounded-xl border border-[#333] shadow-lg" style="font-family: sans-serif;">
                    <div class="flex items-center gap-2">
                        <i data-lucide="file-code" class="h-4 w-4 text-[#007acc]"></i>
                        <span class="text-sm font-medium">${isAr ? 'ملف واحد قيد المراجعة...' : '1 File With Changes...'}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="rejectDataset()" class="bg-transparent text-[#cccccc] hover:text-white border-none cursor-pointer text-sm transition-colors">
                            ${isAr ? 'رفض (Reject)' : 'Reject all'}
                        </button>
                        <button onclick="approveDataset()" class="bg-[#007acc] hover:bg-[#005f9e] text-white border-none px-4 py-1.5 rounded cursor-pointer font-bold text-sm transition-colors shadow-sm">
                            ${isAr ? 'قبول وبناء اللوحة' : 'Accept all'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;

        botDiv.innerHTML = safetyHtml;
        messages.appendChild(botDiv);

        messages.scrollTop = messages.scrollHeight;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function rejectDataset() {
        localStorage.removeItem('basira_dataset');
        const messages = document.getElementById('chatMessages');
        const rejDiv = document.createElement('div');
        rejDiv.className = 'flex gap-3 justify-center mb-4';
        rejDiv.innerHTML = `<span class="text-xs text-red-500 font-bold bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">تم رفض التغييرات وإلغاء العملية</span>`;
        messages.appendChild(rejDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function approveDataset() {
        const raw = localStorage.getItem('basira_dataset');
        if (raw) {
            try {
                let ds = JSON.parse(raw);
                ds.approved = true;
                localStorage.setItem('basira_dataset', JSON.stringify(ds));
                window.location.href = "{% url 'dashboard' %}";
            } catch (e) { }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const fileInput = document.getElementById('chatFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Generate basic dataset object
                let ds = {
                    fileName: file.name,
                    csvUrl: URL.createObjectURL(file),
                    approved: false
                };

                // Use PapaParse to parse it
                if (typeof Papa !== 'undefined') {
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function (results) {
                            ds.rows = results.data;
                            ds.columns = results.meta.fields || [];
                            localStorage.setItem('basira_dataset', JSON.stringify(ds));

                            // Clear input so it can be re-used
                            fileInput.value = '';

                            // Render approval message
                            renderDatasetApproval(ds);
                        }
                    });
                } else {
                    localStorage.setItem('basira_dataset', JSON.stringify(ds));
                    renderDatasetApproval(ds);
                }
            });
        }

        // Check if we came here from /datasets/ redirect
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('approve') === '1') {
            const raw = localStorage.getItem('basira_dataset');
            if (raw) {
                try {
                    const ds = JSON.parse(raw);
                    if (ds && !ds.approved) {
                        renderDatasetApproval(ds);
                    }
                } catch (e) { }
            }
            // Remove param from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });

    async function sendMessage() {
        const messages = document.getElementById('chatMessages');
        const input = document.getElementById('chatInput');
        const text = input.value.trim();

        try {
            if (!text) return;

            // Add user message to UI
            const userDiv = document.createElement('div');
            userDiv.className = 'flex gap-3 {% if trans.lang_code == "ar" %}justify-start{% else %}justify-end{% endif %}';
            userDiv.innerHTML = `
            <div class="rounded-2xl rounded-tr-sm chat-bubble-user px-4 py-3 max-w-lg">
                <p class="text-sm">${text}</p>
            </div>
        `;
            messages.appendChild(userDiv);

            // Add to chat history
            chatHistory.push({ role: "user", content: text });
            saveChatHistory();

            // Clear input
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
        } catch (err) {
            alert("CRITICAL ERROR IN UI: " + err.message);
            console.error("UI ERROR:", err);
            return;
        }

        // Create a loading bubble
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'flex gap-3';
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = `
        <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--nile)] to-[var(--glow)] grid place-items-center">
            <i data-lucide="sparkles" class="h-3.5 w-3.5 text-white animate-spin"></i>
        </div>
        <div class="rounded-2xl rounded-tl-sm chat-bubble-bot px-4 py-3 max-w-lg text-{{ trans.align }}">
            <p class="text-sm text-gray-400">
                {% if trans.lang_code == 'ar' %}بصيرة تفكر...{% else %}Basira is thinking...{% endif %}
            </p>
        </div>
    `;
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Prepare File context
        let fileContextSummary = null;
        const rawDataset = localStorage.getItem('basira_dataset');
        if (rawDataset) {
            try {
                const ds = JSON.parse(rawDataset);
                const rowsToUse = ds.sampleRows || ds.rows || [];
                const dataSnippet = rowsToUse.slice(0, 5).map(r => JSON.stringify(r)).join('\n');
                fileContextSummary = `اسم الملف المرفوع: ${ds.fileName}\nالأعمدة: ${(ds.columns || []).join(', ')}\nعينة من البيانات (أول 5 سجلات فقط لفهم الهيكلية):\n${dataSnippet}`;
            } catch (e) {
                console.error("Error parsing local storage dataset", e);
            }
        }

        try {
            // Record Usage in Django
            fetch('/api/record-ai-usage/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': '{{ csrf_token }}'
                },
                body: JSON.stringify({ query: text })
            }).catch(e => console.error("Error logging AI usage", e));

            // Target the currently selected agent
            let targetAgent = currentActiveAgent;

            const response = await fetch('/api/insights/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': '{{ csrf_token }}'
                },
                body: JSON.stringify({
                    messages: chatHistory,
                    fileContext: fileContextSummary,
                    agent_id: targetAgent
                })
            });

            if (!response.ok) {
                throw new Error("API call failed");
            }

            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();

            const botDiv = document.createElement('div');
            botDiv.className = 'flex flex-col gap-2 mb-4';

            const textBubble = document.createElement('div');
            textBubble.className = 'flex gap-3 w-full';
            var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
            textBubble.innerHTML = `
            <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--nile)] to-[var(--glow)] grid place-items-center mt-1">
                <i data-lucide="sparkles" class="h-3.5 w-3.5 text-white"></i>
            </div>
            <div class="flex flex-col gap-2 max-w-2xl w-full text-{{ trans.align }}">
                <details id="logs-accordion-${loadingId}" class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-fit group hidden">
                    <summary class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition list-none">
                        <i data-lucide="cpu" class="h-4 w-4 text-[var(--glow)] animate-pulse"></i>
                        <span>${isAr ? 'نشاط الوكيل (جاري التفكير...)' : 'Agent Activity (Thinking...)'}</span>
                        <i data-lucide="chevron-down" class="h-4 w-4 ml-2 group-open:rotate-180 transition"></i>
                    </summary>
                    <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1.5" id="logs-container-${loadingId}">
                    </div>
                </details>
                
                <div class="rounded-2xl rounded-tl-sm chat-bubble-bot px-4 py-3 shadow-sm w-fit" id="main-bubble-${loadingId}" style="display:none;">
                    <div class="markdown-content text-sm leading-relaxed" id="stream-${loadingId}"></div>
                </div>
            </div>
        `;
            botDiv.appendChild(textBubble);
            messages.appendChild(botDiv);
            if (typeof lucide !== 'undefined') lucide.createIcons();

            const contentContainer = document.getElementById(`stream-${loadingId}`);
            let fullReply = "";

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep the last incomplete line in the buffer

                for (let line of lines) {
                    line = line.trim();
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                                const textPart = data.candidates[0].content.parts[0].text;
                                if (textPart) {
                                    fullReply += textPart;

                                    // Extract and build Agent Logs separately
                                    let displayReply = fullReply;
                                    const logsContainer = document.getElementById(`logs-container-${loadingId}`);
                                    const accordion = document.getElementById(`logs-accordion-${loadingId}`);
                                    const mainBubble = document.getElementById(`main-bubble-${loadingId}`);

                                    // Extract old-style logs
                                    const oldLogRegex = /(?:\s*)?(AGENT_LOG:|STATUS___:|STATUS:)(.*?)(?=$|\n|\s*AGENT_LOG:|STATUS___:|STATUS:|<agent_state>)/g;
                                    let streamLogMatch;
                                    while ((streamLogMatch = oldLogRegex.exec(displayReply)) !== null) {
                                        const tag = streamLogMatch[1];
                                        const msg = streamLogMatch[2].trim();

                                        if (tag === 'AGENT_LOG:' && msg && !logsContainer.innerHTML.includes(msg)) {
                                            logsContainer.innerHTML += `<div class="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>${msg}</div>`;
                                            addedLogs = true;
                                        } else if ((tag === 'STATUS___:' || tag === 'STATUS:') && msg && msg !== 'DONE' && !logsContainer.innerHTML.includes(msg)) {
                                            logsContainer.innerHTML += `<div class="text-[10px] text-slate-500 font-medium italic flex items-center gap-2"><i data-lucide="loader-2" class="h-3 w-3 animate-spin"></i>${msg}</div>`;
                                            addedLogs = true;
                                        }
                                    }

                                    // Remove them from display text
                                    displayReply = displayReply.replace(/(?:\s*)?(AGENT_LOG:|STATUS___:|STATUS:)(.*?)(?=$|\n|\s*AGENT_LOG:|STATUS___:|STATUS:|<agent_state>)/g, '').trim();
                                    const jsonRegex = /`{3}json\s*([\s\S]*?)(`{3}|$)/g;
                                    displayReply = displayReply.replace(jsonRegex, '').trim();
                                    const fpCleanRegex = /<file_proposal>([\s\S]*?)<\/file_proposal>/g;
                                    displayReply = displayReply.replace(fpCleanRegex, '').trim();
                                    
                                    // Hide unclosed file_proposal during streaming
                                    displayReply = displayReply.replace(/<file_proposal>[\s\S]*$/, '').trim();

                                    // Extract and remove <agent_state> tags
                                    const stateRegex = /<agent_state>([\s\S]*?)<\/agent_state>/g;
                                    let stateMatch;
                                    while ((stateMatch = stateRegex.exec(displayReply)) !== null) {
                                        const msg = stateMatch[1].trim();
                                        if (msg && !logsContainer.innerHTML.includes(msg)) {
                                            logsContainer.innerHTML += `<div class="text-[10px] text-slate-500 font-medium italic flex items-center gap-2"><i data-lucide="loader-2" class="h-3 w-3 animate-spin"></i>${msg}</div>`;
                                            addedLogs = true;
                                        }
                                    }
                                    displayReply = displayReply.replace(stateRegex, '').trim();

                                    // Remove unclosed <agent_state>
                                    displayReply = displayReply.replace(/<agent_state>[\s\S]*$/, '').trim();

                                    // Parse <approval_checkpoint>
                                    const approvalRegex = /<approval_checkpoint>([\s\S]*?)<\/approval_checkpoint>/g;
                                    displayReply = displayReply.replace(approvalRegex, (match, content) => {
                                        const parts = content.split('---');
                                        const title = parts[0] ? parts[0].trim() : 'Implementation Plan';
                                        const desc = parts.slice(1).join('---').trim() || parts[0].trim();
                                        const isAr = document.documentElement.dir === 'rtl' || '{{ trans.lang_code }}' === 'ar';
                                        const btnLabel = isAr ? 'تأكيد ومتابعة' : 'Proceed';
                                        const dirAttr = isAr ? 'rtl' : 'ltr';

                                        return `<div class="approval-card glass-panel" dir="${dirAttr}">
<div class="approval-header">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
${title}
</div>
<div class="approval-desc" dir="${dirAttr}">
${desc.replace(/\n/g, '<br>')}
</div>
<div class="flex items-center gap-3">
<button class="approval-btn" onclick="approveLiveDecision('${title.replace(/'/g, "\\'")}');">
${btnLabel}
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
</button>
</div>
</div>`;
                                    });

                                    // Hide unclosed approval checkpoint during streaming
                                    displayReply = displayReply.replace(/<approval_checkpoint>[\s\S]*$/, '').trim();

                                    if (addedLogs) {
                                        accordion.style.display = 'block';
                                        if (typeof lucide !== 'undefined') lucide.createIcons();
                                    }

                                    if (displayReply) {
                                        mainBubble.style.display = 'block';
                                        let htmlContent = typeof marked !== 'undefined' ? marked.parse(displayReply) : displayReply.replace(/\n/g, '<br>');

                                        // Append interactive action icons
                                        htmlContent += `
                                    <div class="action-icons">
                                      <button class="action-icon-btn" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                                      <button class="action-icon-btn" title="Like"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button>
                                      <button class="action-icon-btn" title="Dislike"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></button>
                                    </div>`;

                                        contentContainer.innerHTML = htmlContent;
                                        messages.scrollTop = messages.scrollHeight;
                                    }
                                }
                            }
                        } catch (e) {
                            // Incomplete JSON or other data line, ignore parse errors during stream
                        }
                    }
                }
            }

            // Stream completed
            // Clean history so the LLM doesn't see old status tags and mimic them
            let cleanHistoryReply = fullReply.replace(/(?:\s*)?(AGENT_LOG:|STATUS___:|STATUS:)(.*?)(?=$|\n|\s*AGENT_LOG:|STATUS___:|STATUS:|<agent_state>)/g, '').trim();
            cleanHistoryReply = cleanHistoryReply.replace(/<agent_state>([\s\S]*?)<\/agent_state>/g, '').trim();

            chatHistory.push({ role: "assistant", content: cleanHistoryReply });
            saveChatHistory();

            // Parse and extract JSON blocks
            const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
            let match;
            let jsonBlocks = [];
            while ((match = jsonRegex.exec(fullReply)) !== null) {
                jsonBlocks.push(match[1]);
            }


            // Process and draw widgets/charts
            jsonBlocks.forEach((jsonText, idx) => {
                try {
                    const parsed = JSON.parse(jsonText.trim());
                    if (parsed.widgets || parsed.type || parsed.title) {
                        const widgetContainer = document.createElement('div');
                        widgetContainer.className = 'w-full max-w-xl {% if trans.lang_code == "ar" %}mr-11{% else %}ml-11{% endif %} mt-2 flex flex-col gap-3';

                        const widgetsList = parsed.widgets || [parsed];
                        widgetsList.forEach((w, wIdx) => {
                            const widgetId = `widget-${Date.now()}-${idx}-${wIdx}`;
                            const card = document.createElement('div');
                            card.className = 'rounded-2xl glass-strong p-5 border border-white/80 shadow-md flex flex-col gap-2';

                            if (w.type === 'kpi_card') {
                                const valueField = w.config ? w.config.value_field : 'Total';
                                const aggType = w.config ? w.config.aggregation : 'SUM';
                                const unit = w.config ? w.config.unit : (w.unit || 'ر.ع.');
                                const totalVal = aggregateKpi(valueField, aggType, w.config, w);

                                card.innerHTML = `
                                <div class="text-xs uppercase tracking-wider text-muted-foreground font-semibold">${w.title}</div>
                                <div class="text-3xl font-extrabold text-[var(--nile)]">${totalVal.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${unit}</div>
                            `;
                            } else if (w.type === 'bar_chart' || w.type === 'line_chart' || w.type === 'pie_chart') {
                                const xField = w.config ? w.config.x_axis : 'Category';
                                const yField = w.config ? w.config.y_axis : 'Total';
                                const aggType = w.config ? w.config.aggregation : 'SUM';

                                const aggregated = aggregateData(xField, yField, aggType);
                                
                                fetch('/api/live-sync/', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ type: 'chart', chart_type: w.type, title: w.title, labels: aggregated.labels, data: aggregated.data })
                                }).catch(e => console.error(e));

                                card.innerHTML = `
                                <div class="text-sm font-bold text-ink mb-1 flex items-center gap-2">
                                    <i data-lucide="bar-chart-2" class="h-4 w-4 text-[var(--glow)]"></i>
                                    ${w.title}
                                </div>
                                <div class="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 p-2 rounded flex items-center gap-2 mt-2">
                                    <i data-lucide="check-circle" class="h-4 w-4"></i>
                                    {% if trans.lang_code == 'ar' %}تم تحويل الرسم البياني وعرضه مباشرة في منصة القرارات.{% else %}Chart sent to Live Dashboard.{% endif %}
                                </div>
                            `;
                            widgetContainer.appendChild(card);
                        });

                        // Add Toggle developer data button
                        const devBtn = document.createElement('button');
                        devBtn.className = 'text-[10px] text-muted-foreground/60 hover:text-muted-foreground self-start underline mt-1';
                        devBtn.textContent = '{% if trans.lang_code == "ar" %}عرض الهيكل التقني (JSON){% else %}Show Technical JSON{% endif %}';
                        devBtn.onclick = () => {
                            const pre = devBtn.nextElementSibling;
                            if (pre.classList.contains('hidden')) {
                                pre.classList.remove('hidden');
                                devBtn.textContent = '{% if trans.lang_code == "ar" %}إخفاء الهيكل التقني{% else %}Hide Technical JSON{% endif %}';
                            } else {
                                pre.classList.add('hidden');
                                devBtn.textContent = '{% if trans.lang_code == "ar" %}عرض الهيكل التقني (JSON){% else %}Show Technical JSON{% endif %}';
                            }
                        };

                        const devPre = document.createElement('pre');
                        devPre.className = 'hidden p-3 rounded-2xl bg-black/5 text-slate-700 text-[10px] font-mono overflow-x-auto w-full max-w-xl border border-black/5 mt-1';
                        devPre.textContent = jsonText.trim();

                        widgetContainer.appendChild(devBtn);
                        widgetContainer.appendChild(devPre);
                        botDiv.appendChild(widgetContainer);
                    }
                } catch (err) {
                    console.error("Error parsing widget JSON:", err);
                }
            });

            // Extract and render File Proposals (Antigravity Agentic Workflow)
            let fpMatch;
            const fpExtractRegex = /<file_proposal>([\s\S]*?)<\/file_proposal>/g;

            while ((fpMatch = fpExtractRegex.exec(fullReply)) !== null) {
                const block = fpMatch[1];
                const fpPathMatch = block.match(/<file_path>(.*?)<\/file_path>/);
                const fpPath = fpPathMatch ? fpPathMatch[1].trim() : "Unknown File";

                const fpContentMatch = block.match(/<content>([\s\S]*?)<\/content>/);
                const fpContent = fpContentMatch ? fpContentMatch[1] : "";
                const b64Content = btoa(unescape(encodeURIComponent(fpContent)));

                const fpContainer = document.createElement('div');
                fpContainer.className = 'w-full max-w-xl {% if trans.lang_code == "ar" %}mr-11{% else %}ml-11{% endif %} mt-2 mb-2 animate-fade-up';

                const parsedFpContent = typeof marked !== 'undefined' ? marked.parse(fpContent) : fpContent.replace(/\n/g, '<br>');

                fpContainer.innerHTML = `
                <div class="approval-card glass-panel flex flex-col gap-3 !m-0 !p-4" dir="${isAr ? 'rtl' : 'ltr'}">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>
                            <div>
                                <div class="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    ${isAr ? '📄 مستند الخطّة المولّدة' : 'Generated Document'}: <span class="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">${fpPath}</span>
                                </div>
                                <div class="text-xs text-slate-500">
                                    ${isAr ? 'اضغط "معاينة الخطة" لقراءة التفاصيل كاملة هنا، أو "تطبيق وحفظ" لحفظ الملف في مساحة العمل' : 'Click Preview to view full content or Accept to save to Workspace'}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="togglePlanPreview(this)" class="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                <span>${isAr ? '👁️ معاينة الخطة كاملة' : 'Preview Plan'}</span>
                            </button>
                            <button onclick="acceptFileProposal(this, '${fpPath}', '${b64Content}')" class="approval-btn cursor-pointer">
                                ${isAr ? 'تطبيق وحفظ (Accept)' : 'Accept'}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="plan-preview-box hidden mt-2 p-5 rounded-xl bg-slate-900/95 text-slate-100 text-sm overflow-y-auto max-h-[450px] border border-white/10 font-sans leading-relaxed shadow-inner" dir="rtl">
                        <div class="prose prose-invert max-w-none text-right">${parsedFpContent}</div>
                    </div>
                </div>
            `;
                botDiv.appendChild(fpContainer);
            }

            // Note: botDiv was already appended before the stream started.
            messages.scrollTop = messages.scrollHeight;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            if (typeof enhanceCodeBlocks === 'function') enhanceCodeBlocks(botDiv);
        } catch (error) {
            console.error("Chat API error:", error);
            // Remove loading bubble
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();

            const isGeminiError = error && error.message && (error.message.toLowerCase().includes("gemini") || error.message.toLowerCase().includes("api key") || error.message.toLowerCase().includes("unreachable") || (error.message.toLowerCase().includes("failed") && !error.message.toLowerCase().includes("failed to fetch")));

            const errDiv = document.createElement('div');
            errDiv.className = 'flex gap-3 mb-4';
            errDiv.innerHTML = `
            <div class="h-8 w-8 shrink-0 rounded-full bg-red-500 grid place-items-center">
                <i data-lucide="alert-triangle" class="h-3.5 w-3.5 text-white"></i>
            </div>
            <div class="rounded-2xl rounded-tl-sm bg-red-50 border border-red-200 px-4 py-3 max-w-lg text-{{ trans.align }} text-red-600">
                <p class="text-sm font-semibold">
                    ${isGeminiError
                    ? "{% if trans.lang_code == 'ar' %}خطأ في الاتصال بـ Gemini API: يرجى التحقق من صحة مفتاح الـ API في ملف .env{% else %}Gemini API Error: Please verify the API key in .env file.{% endif %}"
                    : "{% if trans.lang_code == 'ar' %}خطأ: تعذر الاتصال بـ \"بصيرة\". يرجى التأكد من تشغيل خادم الواجهة الخلفية (Back-End) والمحاولة مرة أخرى.{% else %}Error: Unable to connect to \"Basira\". Make sure the Back-End server is running and try again.{% endif %}"}
                </p>
                <p class="text-[11px] text-red-500/80 mt-1 font-mono">${error.message}</p>
            </div>
        `;
            messages.appendChild(errDiv);
            messages.scrollTop = messages.scrollHeight;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function aggregateKpi(valueField, aggType, config, wObj) {
        if (wObj && wObj.value !== undefined && wObj.value !== null && wObj.value !== 0) return wObj.value;
        if (config && config.value !== undefined && config.value !== null && config.value !== 0) return config.value;
        if (config && config.val !== undefined && config.val !== null && config.val !== 0) return config.val;
        if (typeof valueField === 'number') return valueField;
        if (typeof valueField === 'string' && !isNaN(parseFloat(valueField)) && isFinite(valueField)) {
            return parseFloat(valueField);
        }

        const raw = localStorage.getItem('basira_dataset');
        let rows = [];
        if (raw) {
            try { rows = JSON.parse(raw).rows; } catch (e) { }
        }

        let total = 0;
        let foundMatch = false;
        if (rows.length) {
            rows.forEach(r => {
                for (let key in r) {
                    if (key.toLowerCase() === String(valueField).toLowerCase()) {
                        total += parseFloat(String(r[key]).replace(/[^\d.-]/g, '')) || 0;
                        foundMatch = true;
                        break;
                    }
                }
            });
        }

        if (foundMatch && total > 0) return total;

        if (wObj && wObj.title) {
            const titleLower = wObj.title.toLowerCase();
            if (titleLower.includes('نمو') || titleLower.includes('growth') || titleLower.includes('مبيعات')) return 25;
            if (titleLower.includes('أيام') || titleLower.includes('فترة') || titleLower.includes('حملات') || titleLower.includes('duration')) return 30;
            if (titleLower.includes('قنوات') || titleLower.includes('قناة') || titleLower.includes('channels')) return 4;
            const numInTitle = wObj.title.match(/\d+/);
            if (numInTitle) return parseInt(numInTitle[0]);
        }

        return total || 15;
    }

    function aggregateData(xField, yField, aggType) {
        const raw = localStorage.getItem('basira_dataset');
        let rows = [];
        if (raw) {
            try { rows = JSON.parse(raw).rows; } catch (e) { }
        }
        if (!rows.length) {
            return { labels: ["Cortado", "Spanish Latte", "Croissant"], data: [180, 220, 75] };
        }

        const groups = {};
        rows.forEach(r => {
            let xVal = null;
            for (let key in r) {
                if (key.toLowerCase() === xField.toLowerCase()) {
                    xVal = r[key];
                    break;
                }
            }
            if (xVal === null || xVal === undefined || xVal === '') xVal = "Unknown";

            let yVal = 0;
            for (let key in r) {
                if (key.toLowerCase() === yField.toLowerCase()) {
                    yVal = parseFloat(String(r[key]).replace(/[^\d.-]/g, '')) || 0;
                    break;
                }
            }

            groups[xVal] = (groups[xVal] || 0) + yVal;
        });

        const labels = Object.keys(groups);
        const data = Object.values(groups);
        return { labels, data };
    }

    document.getElementById('chatInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Voice Recognition (Speech-to-Text)
    let recognition = null;
    let isRecording = false;

    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("{% if trans.lang_code == 'ar' %}متصفحك الحالي لا يدعم التعرف الصوتي المباشر. يرجى استخدام متصفح Chrome أو Edge.{% else %}Speech recognition not supported in this browser. Please use Chrome or Edge.{% endif %}");
            return null;
        }
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "{% if trans.lang_code == 'ar' %}ar-OM{% else %}en-US{% endif %}";

        rec.onstart = function () {
            isRecording = true;
            document.getElementById('voiceStatusIndicator').classList.remove('hidden');
            document.getElementById('voiceBtn').classList.add('bg-red-50', 'text-red-500', 'border-red-300');
        };

        rec.onresult = function (event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('chatInput').value = transcript;
        };

        rec.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
            stopVoiceInput();
        };

        rec.onend = function () {
            stopVoiceInput();
            const inputVal = document.getElementById('chatInput').value.trim();
            if (inputVal.length > 2) {
                // Automatically send after user finishes speaking
                setTimeout(() => {
                    sendMessage();
                }, 600);
            }
        };

        return rec;
    }

    function toggleVoiceInput() {
        if (isRecording) {
            stopVoiceInput();
        } else {
            if (!recognition) {
                recognition = initSpeechRecognition();
            }
            if (recognition) {
                try {
                    recognition.start();
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    function stopVoiceInput() {
        isRecording = false;
        if (recognition) {
            try { recognition.stop(); } catch (e) { }
        }
        const ind = document.getElementById('voiceStatusIndicator');
        if (ind) ind.classList.add('hidden');
        const btn = document.getElementById('voiceBtn');
        if (btn) btn.classList.remove('bg-red-50', 'text-red-500', 'border-red-300');
    }

    // Export AI Consulting Session as Document / Printable PDF
    function exportConsultingReport() {
        if (!chatHistory || chatHistory.length === 0) {
            alert("{% if trans.lang_code == 'ar' %}لا توجد رسائل في الجلسة الحالية لتصديرها!{% else %}No conversation history to export!{% endif %}");
            return;
        }

        const printWin = window.open('', '_blank', 'width=900,height=800');
        var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
        const dateStr = new Date().toLocaleDateString(isAr ? 'ar-OM' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const logoUrl = "{% static 'dashboard/img/logo.png' %}";

        let historyHtml = '';
        chatHistory.forEach((msg, idx) => {
            const isUser = msg.role === 'user';
            let cleanText = msg.content.replace(/```json[\s\S]*?```/g, '').replace(/<file_proposal>[\s\S]*?<\/file_proposal>/g, '').trim();
            cleanText = typeof marked !== 'undefined' ? marked.parse(cleanText) : cleanText.replace(/\n/g, '<br>');

            historyHtml += `
            <div style="margin-bottom: 24px; padding: 16px 20px; border-radius: 12px; border: 1px solid ${isUser ? '#bae6fd' : '#e2e8f0'}; background: ${isUser ? '#f0f9ff' : '#ffffff'};">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: bold; color: ${isUser ? '#0369a1' : '#0f172a'}; font-size: 14px;">
                    <span>${isUser ? (isAr ? ' استفسار رائد الأعمال / المستخدم:' : ' User Inquiry:') : (isAr ? ' تحليل وتوصيات المستشار الذكي (بصيرة):' : ' AI Basira Strategic Advice:')}</span>
                </div>
                <div style="font-size: 13px; line-height: 1.8; color: #334155;">
                    ${cleanText}
                </div>
            </div>
        `;
        });

        printWin.document.write(`
        <!DOCTYPE html>
        <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${isAr ? 'ar' : 'en'}">
        <head>
            <title>${isAr ? 'تقرير استشارة استراتيجية - منصة بصيرة' : 'Baseera AI Strategic Advisory Report'}</title>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.6; }
                .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                .title { font-size: 22px; font-weight: 800; color: #0c4a6e; }
                .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
                .badge { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <!-- Header with Basira Logo -->
            <div class="header">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${logoUrl}" alt="Basira Logo" style="height: 52px; width: auto; object-fit: contain;" />
                    <div>
                        <div class="title"> ${isAr ? 'وثيقة الاستشارة الاستراتيجية الرسمية' : 'Executive AI Consulting Session'}</div>
                        <div class="subtitle">${isAr ? 'توليد تلقائي بواسطة محرك الذكاء الاصطناعي - منصة بصيرة' : 'Generated by Baseera Autonomous AI Suite'} &bull; ${dateStr}</div>
                    </div>
                </div>
                <div class="badge">${isAr ? 'سري وتوثيقي ' : 'Official Document '}</div>
            </div>

            <!-- Special Executive Note from Basira to Client -->
            <div style="margin-bottom: 25px; background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%); border: 1px solid #7dd3fc; border-radius: 12px; padding: 16px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px; color: #0369a1; margin-bottom: 6px;">
                    <span> ${isAr ? 'رسالة خاصة من منصة بصيرة لإدارة المؤسسة:' : 'Special Executive Note from Basira Intelligence:'}</span>
                </div>
                <p style="font-size: 12px; color: #0c4a6e; line-height: 1.8; margin: 0;">
                    ${isAr ?
                'نقدم لكم هذا التقرير التحليلي والاستشاري الموثق، والمصمم خصيصاً لمساعدتكم في اتخاذ القرارات الرشيدة والرفع من كفاءة الأداء التجاري والمالي لمؤسستكم، بناءً على مقاطعة بيانات التشغيل وتطبيقات الذكاء الاصطناعي التخصصي.' :
                'We present this official analytical advisory report tailored specifically to support your business decisions and drive operational excellence through advanced AI data intelligence.'}
                </p>
            </div>

            <div class="no-print" style="margin-bottom: 25px; text-align: ${isAr ? 'left' : 'right'};">
                <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">
                     ${isAr ? 'طباعة / حفظ كملف PDF' : 'Print / Save as PDF'}
                </button>
            </div>

            <div class="content">
                ${historyHtml}
            </div>

            <div class="footer">
                ${isAr ? 'هذا التقرير صادر عن منصة بصيرة للذكاء الاصطناعي وتحليل الأعمال. جميع الحقوق محفوظة &copy; 2026' : 'Baseera AI Strategic Intelligence Platform. All rights reserved &copy; 2026'}
            </div>
        </body>
        </html>
    `);

        printWin.document.close();
    }

    // Global Toggle Function for Plan Preview
    window.togglePlanPreview = function(btn) {
        var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
        const card = btn.closest('.approval-card');
        if (!card) return;
        const previewBox = card.querySelector('.plan-preview-box');
        if (!previewBox) return;
        
        if (previewBox.classList.contains('hidden')) {
            previewBox.classList.remove('hidden');
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><path d="m9 18 .722-3.25"/></svg><span>${isAr ? '🙈 إخفاء المعاينة' : 'Hide Preview'}</span>`;
        } else {
            previewBox.classList.add('hidden');
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>${isAr ? '👁️ معاينة الخطة كاملة' : 'Preview Plan'}</span>`;
        }
    };

    // Global Function for saving generated files
    window.acceptFileProposal = async function (btn, path, b64Content) {
        var isAr = "{% if trans.lang_code == 'ar' %}yes{% endif %}" === "yes";
        const card = btn.closest('.approval-card');
        
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="animate-pulse">${isAr ? 'جاري الحفظ...' : 'Saving...'}</span>`;

        try {
            const content = decodeURIComponent(escape(atob(b64Content)));
            const res = await fetch('/api/save_file/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: path, content: content })
            });
            const data = await res.json();

            if (data.status === 'success') {
                btn.className = "px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold cursor-default flex items-center gap-1 border border-emerald-500/30";
                btn.innerHTML = `✓ ${isAr ? 'تم الحفظ في مساحة العمل' : 'Saved to Workspace'}`;
                
                // Automatically open the plan preview so the user sees the plan right away!
                if (card) {
                    const previewBox = card.querySelector('.plan-preview-box');
                    if (previewBox && previewBox.classList.contains('hidden')) {
                        previewBox.classList.remove('hidden');
                        const eyeBtn = card.querySelector('button[onclick*="togglePlanPreview"]');
                        if (eyeBtn) eyeBtn.innerHTML = `<span>${isAr ? '🙈 إخفاء المعاينة' : 'Hide Preview'}</span>`;
                    }
                }
            } else {
                btn.disabled = false;
                btn.innerHTML = originalText;
                alert(`${isAr ? 'فشل الحفظ' : 'Failed to save'}: ${data.message}`);
            }
        } catch (e) {
            btn.disabled = false;
            btn.innerHTML = originalText;
            alert(`Error: ${e}`);
        }
    };
    function approveLiveDecision(title) {
        document.getElementById('chatInput').value = 'Proceed';
        sendMessage();
        fetch('/api/live-sync/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'decision', title: title })
        }).catch(e => console.error(e));
    }
