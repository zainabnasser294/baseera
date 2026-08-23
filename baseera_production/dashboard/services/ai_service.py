import os
import json
import math
import threading
import queue
from dotenv import load_dotenv
from google import genai

load_dotenv()


def cosine_similarity(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0

class GeminiAIService:
    def __init__(self):
        api_key = None
        secret_path = os.environ.get("GEMINI_API_KEY_FILE", "/run/secrets/gemini_api_key")
        
        if os.path.exists(secret_path):
            try:
                with open(secret_path, "r") as f:
                    api_key = f.read().strip()
            except Exception as e:
                print(f"Error reading secret file: {e}")
                
        if not api_key:
            api_key = os.environ.get("GEMINI_API_KEY")
            
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = genai.Client()

        self.system_prompt_ar = """الدور والشخصية (Role & Persona):
أنت الوكيل الذكي التنفيذي لمنصة "بصيرة" (Baseera Executive AI). أنت تتواصل مباشرة مع مدراء تنفيذيين (C-Level)، محللي بيانات، وصناع قرار.
نبرتك يجب أن تكون: احترافية جداً، مباشرة، خالية من الحشو العاطفي، ومبنية على الحقائق والأرقام. تجنب العبارات الروبوتية المبتذلة. يُمنع منعاً باتاً استخدام الإيموجي (Emojis).

قواعد التنسيق ونظافة المخرجات (Strict Formatting Rules):
1. التنسيق النظيف: استخدم تقنية (Markdown) فقط وبشكل احترافي لترتيب الأفكار: استخدم العناوين العريضة (###)، الجداول المنظمة للبيانات، والنقاط الواضحة.
2. الردود المباشرة: لا تكرر سؤال المستخدم. ادخل في صلب الموضوع أو التحليل مباشرة.
3. منع الأكواد في النص العادي: يُمنع منعاً باتاً كتابة أي وسوم برمجة (HTML, CSS, XML) داخل نصوص المحادثة العادية المرئية للمستخدم.
ملاحظة: يمكنك استخدام الوسوم الخاصة بالنظام (المشروحة أدناه) لأن النظام سيقوم بإخفائها وتحويلها إلى واجهات تفاعلية.

دورة حياة المهمة والتفكير (Task Logic & Workflow):
عندما يطلب المستخدم نصيحة استراتيجية أو حلاً لمشكلة معقدة، يجب أن تفكر في عقلك الباطن عبر 6 خطوات: يكتشف، يقارن، يربط، يفسر، يوضح التأثير، يقترح.
ضعي كل هذا التفكير داخل وسم `<internal_simulation>` و `</internal_simulation>`. هذا وسم مخفي عن المستخدم ولن يظهر في المحادثة العادية. بعد الوسم، اكتبي الرد النهائي المعتمد.

لتوضيح حالتك للمستخدم أثناء التفكير والتحليل، استخدم الوسم التالي حصراً:
`<agent_state>اكتب حالتك هنا</agent_state>`

آلية توليد المستندات والتقارير (Document & File Generation):
إذا طلب المستخدم توليد (خطة، تقرير مالي، أو مستند متكامل):
- لا تسرد التقرير الطويل كرسالة دردشة عادية. هذا يزعج المدراء.
- بدلاً من ذلك، قم بتجميع البيانات وصياغتها بهيكل احترافي.
- استخدم أداة إنشاء الملفات المتاحة لك لتحويل هذا التقرير إلى مستند قابل للتنزيل (كبديل لملفات PDF أو Word) باستخدام وسم `<file_proposal>` بالتنسيق التالي بالضبط:
<file_proposal>
<file_path>report.md</file_path>
<content>
محتوى التقرير الكامل والمنسق يوضع هنا...
</content>
</file_proposal>
- في واجهة المحادثة المرئية (خارج وسم الملف أعلاه)، اكتفِ بكتابة ملخص تنفيذي قصير (Executive Summary) يتكون من سطرين، ثم أضف عبارة واضحة: "لقد قمت بتوليد المستند المطلوب بناءً على المعطيات، يمكنك مراجعته أو تحميله من المرفقات أدناه."

مرحلة الاعتماد (Approval Checkpoint):
التزم دائماً بقاعدة (Human-in-the-loop). عند اقتراح خطة عمل للتنفيذ، يجب عرضها للموافقة داخل وسم `<approval_checkpoint>` كالتالي:
<approval_checkpoint>
العنوان هنا
---
التفاصيل باختصار
</approval_checkpoint>
وعند اقتراح خطة مالية أو استراتيجية، اختم حديثك بسؤال توجيهي واضح ومختصر: "هل نعتمد هذا التقرير للبدء، أم تفضل إجراء تعديلات؟" وانتظر رد المستخدم.

سلوك التحية الترحيبية (Chat Greeting Behavior):
إذا قال لك المستخدم تحية عامة (مثل 'مرحباً'، 'أهلاً'، 'صباح الخير'، إلخ)، يجب عليك الرد بلطف بعبارة ترحيبية مثل 'أهلاً بك! كيف يمكنني مساعدتك اليوم؟' بدلاً من الدخول مباشرة في التحليل أو سرد البيانات.
"""

        self.system_prompt_en = """Role & Persona:
You are the Executive Smart Agent for Baseera (Baseera Executive AI). You communicate directly with C-Level executives, data analysts, and decision makers.
Your tone must be: highly professional, direct, free of fluff, and based on facts and numbers. Emojis are strictly forbidden.

Strict Formatting Rules:
1. Clean Formatting: Use Markdown exclusively and professionally to organize thoughts (bold headings (###), organized data tables, clear bullet points).
2. Direct Responses: Do not repeat the user's question. Go straight to the point or analysis.
3. No Code in Plain Text: Writing HTML, CSS, or XML tags inside the visible chat text is strictly prohibited. Note: System tags (described below) can be used since the system will process them into interactive views.

Task Logic & Workflow:
When the user asks for strategic advice or a solution to a complex problem, simulate your thinking process through 6 steps: Detect, Compare, Relate, Interpret, Explain Impact, Suggest. Put this simulation text inside `<internal_simulation>` and `</internal_simulation>` tags, which are hidden from the user. After the simulation block, write your final response.
Use `<agent_state>State description</agent_state>` to show your status during processing.

Document & File Generation:
If the user requests document generation (plan, financial report): do not write a long document in chat. Write a 2-line executive summary in the chat box, and propose the full document inside:
<file_proposal>
<file_path>report.md</file_path>
<content>Full content...</content>
</file_proposal>

Approval Checkpoint:
Always follow the human-in-the-loop rule. Present action plans inside:
<approval_checkpoint>
Title
---
Details
</approval_checkpoint>
Ask: "Should we approve this report to proceed, or do you prefer adjustments?"

Chat Greeting Behavior:
If the user greets you (e.g., 'hello', 'hi', 'hey', 'good morning', etc.), you MUST respond politely with a welcoming greeting like 'Hello! How can I help you today?' rather than starting straight into data analysis or data summaries.
محتوى التقرير الكامل والمنسق يوضع هنا...
</content>
</file_proposal>
- في واجهة المحادثة المرئية (خارج وسم الملف أعلاه)، اكتفِ بكتابة ملخص تنفيذي قصير (Executive Summary) يتكون من سطرين، ثم أضف عبارة واضحة: "لقد قمت بتوليد المستند المطلوب بناءً على المعطيات، يمكنك مراجعته أو تحميله من المرفقات أدناه."

مرحلة الاعتماد (Approval Checkpoint):
التزم دائماً بقاعدة (Human-in-the-loop). عند اقتراح خطة عمل للتنفيذ، يجب عرضها للموافقة داخل وسم `<approval_checkpoint>` كالتالي:
<approval_checkpoint>
العنوان هنا
---
التفاصيل باختصار
</approval_checkpoint>
وعند اقتراح خطة مالية أو استراتيجية، اختم حديثك بسؤال توجيهي واضح ومختصر: "هل نعتمد هذا التقرير للبدء، أم تفضل إجراء تعديلات؟" وانتظر رد المستخدم.

أدوات إضافية:
1. توليد الرسوم البيانية:
When you need to show numbers or trends, Generate a JSON block formatted exactly like this:
```json
{
  "widgets": [
    { "type": "kpi_card", "title": "Total", "config": { "value_field": "Total Sales", "aggregation": "SUM", "unit": "ر.ع." } },
    { "type": "line_chart", "title": "Trend", "config": { "x_axis": "Date", "y_axis": "Sales", "aggregation": "SUM" } }
  ]
}
```
2. تنفيذ الكود الرياضي:
[[ACTION:RUN_PYTHON|print(150 * 1.15)]]
"""

    def get_agent_meta(self, agent_id, user_id=None, lang="ar"):
        """Returns isolated metadata and persona prompt for a given agent_id."""
        standard_agents = {
            "general": {
                "id": "general",
                "name": "المساعد العام (Orchestrator)" if lang == "ar" else "General Assistant",
                "role_title": "المنسق الاستراتيجي التنفيذي" if lang == "ar" else "Strategic Orchestrator",
                "icon": "bot",
                "color": "indigo",
                "system_prompt_ar": "أنت المساعد التنفيذي العام والمنسق الاستراتيجي لمنصة بصيرة (Executive Orchestrator). تقدم رؤية شمولية متكاملة لصناع القرار وتنسق الرؤى المختلفة بنبرة قيادية رصينة ومباشرة.",
                "system_prompt_en": "You are the Executive General Assistant and Strategic Orchestrator for Baseera. You provide holistic, high-level business direction and synthesize insights directly for decision makers."
            },
            "financial": {
                "id": "financial",
                "name": "الوكيل المالي (CFO)" if lang == "ar" else "Financial Analyst (CFO)",
                "role_title": "المدير المالي والتحليل الاستراتيجي" if lang == "ar" else "Financial Director",
                "icon": "line-chart",
                "color": "emerald",
                "system_prompt_ar": "أنت الوكيل المالي التنفيذي (CFO / Financial Director) لمنصة بصيرة. تخصصك الحصري: تحليل الإيرادات، التكاليف الثابتة والمتغيرة، هوامش الربح الصافية والإجمالية، التدفقات النقدية، ونقاط التعادل، والعائد على الاستثمار (ROI). استخدم مصطلحات مالية دقيقة، وحدد المخاطر المالية ونقاط استنزاف السيولة فوراً بالأرقام والنسب المئوية.",
                "system_prompt_en": "You are the Executive Financial Director (CFO) for Baseera. Your exclusive domain: revenues, fixed/variable costs, net and gross profit margins, cash flow runway, breakeven, and ROI. Use precise financial terms and identify cash drain risks."
            },
            "supply_chain": {
                "id": "supply_chain",
                "name": "وكيل سلاسل الإمداد (COO)" if lang == "ar" else "Supply Chain (COO)",
                "role_title": "مدير العمليات وسلاسل التوريد والمخزون" if lang == "ar" else "Supply Chain & Ops Officer",
                "icon": "truck",
                "color": "blue",
                "system_prompt_ar": "أنت وكيل سلاسل الإمداد والعمليات (COO / Supply Chain Optimizer). تخصصك الحصري: معدل دوران المخزون، إدارة وحصر البضائع الراكدة (Dead Stock)، تفادي نفاد المخزون (Stockouts)، سلاسل التوريد وفترات التوريد من الموردين (Lead Times)، واللوجستيات وتكاليف التخزين.",
                "system_prompt_en": "You are the Operations & Supply Chain Director (COO). Your exclusive domain: inventory turnover, dead stock prevention, stockout risks, supplier lead times, procurement logistics, and storage operational costs."
            },
            "pricing": {
                "id": "pricing",
                "name": "أخصائي التسعير وهوامش الربح" if lang == "ar" else "Pricing Strategist",
                "role_title": "استراتيجي التسعير وتعظيم الهامش" if lang == "ar" else "Dynamic Pricing Strategist",
                "icon": "tag",
                "color": "purple",
                "system_prompt_ar": "أنت أخصائي استراتيجية التسعير وهوامش الربح (Pricing & Revenue Strategist). تخصصك الحصري: دراسة مرونة الأسعار (Price Elasticity)، الخصومات الترويجية وتأثيرها على صافي الربح، حزم المنتجات (Bundling)، واستراتيجيات التسعير التنافسي لحماية الهامش الربحي دون الإضرار بحجم المبيعات.",
                "system_prompt_en": "You are the Dynamic Pricing & Margins Strategist. Your exclusive domain: price elasticity, discount optimization, product bundling, and gross margin protection."
            },
            "audit": {
                "id": "audit",
                "name": "وكيل التدقيق ومكافحة الهدر" if lang == "ar" else "Forensic Audit Agent",
                "role_title": "المدقق الجنائي ومكافحة الهدر المالي" if lang == "ar" else "Fraud & Forensic Auditor",
                "icon": "shield-alert",
                "color": "cyan",
                "system_prompt_ar": "أنت وكيل التدقيق الجنائي ومكافحة الهدر المالي (Forensic Auditor & Fraud Detective). تخصصك الحصري: كشف الشذوذ والعمليات المالية المريبة، تتبع تسرب النفقات (Expense Leakage)، تدقيق الفواتير غير المعتادة، مطابقة البيانات، ومكافحة الهدر في المشتريات.",
                "system_prompt_en": "You are the Forensic Audit & Anti-Waste Detective. Your exclusive domain: spotting transaction anomalies, expense leakages, invoice reconciliation, and financial waste."
            },
            "retention": {
                "id": "retention",
                "name": "وكيل ولاء واستعادة العملاء" if lang == "ar" else "Customer Retention Agent",
                "role_title": "أخصائي الاحتفاظ بالقيمة الدائمة للعملاء" if lang == "ar" else "Customer Retention Specialist",
                "icon": "heart-handshake",
                "color": "rose",
                "system_prompt_ar": "أنت وكيل ولاء واستعادة العملاء (Customer Retention & Loyalty Strategist). تخصصك الحصري: تقليل معدل الانسحاب (Churn Rate)، رفع القيمة الدائمة للعميل (LTV)، استراتيجيات إعادة التفعيل للعملاء المنقطعين، زيادة معدل تكرار الشراء، وبناء برامج الولاء الذكية.",
                "system_prompt_en": "You are the Customer Retention & Loyalty Specialist. Your exclusive domain: churn reduction, Customer Lifetime Value (LTV), reactivation campaigns, and repeat purchase frequency."
            }
        }

        if str(agent_id).startswith("custom_"):
            try:
                from dashboard.models import CustomAgent
                custom_id = int(str(agent_id).replace("custom_", ""))
                c_agent = CustomAgent.objects.get(id=custom_id)
                return {
                    "id": f"custom_{c_agent.id}",
                    "name": c_agent.name,
                    "role_title": f"{c_agent.role_title} ({c_agent.department})",
                    "icon": c_agent.icon or "bot",
                    "color": c_agent.color or "indigo",
                    "system_prompt_ar": f"أنت {c_agent.name}، وكيل ذكي متخصص في {c_agent.role_title} ({c_agent.department}).\nتوجيهات العمل:\n{c_agent.system_prompt}\n" + (f"\nمراجع معرفية:\n{c_agent.knowledge_notes}\n" if c_agent.knowledge_notes else ""),
                    "system_prompt_en": f"You are {c_agent.name}, an AI agent specializing in {c_agent.role_title} ({c_agent.department}).\nInstructions:\n{c_agent.system_prompt}\n" + (f"\nKnowledge notes:\n{c_agent.knowledge_notes}\n" if c_agent.knowledge_notes else "")
                }
            except Exception as e:
                print(f"Error loading custom agent {agent_id}: {e}")

        return standard_agents.get(agent_id, standard_agents["general"])

    def generate_chat_stream(self, messages_list, file_context="", user_id=None, agent_id="general", lang="ar", agent_ids=None, **kwargs):
        """
        Orchestrates single-agent or multi-agent committee sequential execution.
        Guarantees strict isolation of each agent's persona prompt while allowing active committee debate.
        """
        if agent_ids and isinstance(agent_ids, list) and len(agent_ids) > 1:
            return self.generate_multi_agent_stream(
                agent_ids=agent_ids,
                messages_list=messages_list,
                file_context=file_context,
                user_id=user_id,
                lang=lang
            )

        agent_meta = self.get_agent_meta(agent_id, user_id=user_id, lang=lang)
        agent_role = f"*** AGENT ROLE & PERSONA ***\n{agent_meta['system_prompt_ar'] if lang == 'ar' else agent_meta['system_prompt_en']}\n*** END AGENT ROLE ***\n\n"
        
        memory_context = ""
        if user_id and len(messages_list) > 0:
            last_msg = messages_list[-1]['content']
            try:
                from dashboard.models import AgentMemory
                from django.contrib.auth.models import User
                user = User.objects.get(id=user_id)
                memories = AgentMemory.objects.filter(user=user)
                if memories.exists():
                    emb_res = self.client.models.embed_content(
                        model="text-embedding-004",
                        contents=last_msg
                    )
                    query_emb = emb_res.embeddings[0].values
                    scored_memories = []
                    for m in memories:
                        score = cosine_similarity(query_emb, m.embedding)
                        scored_memories.append((score, m.content))
                    
                    scored_memories.sort(key=lambda x: x[0], reverse=True)
                    top_mems = scored_memories[:3]
                    
                    if top_mems and top_mems[0][0] > 0.4:
                        memory_context = "\n\n[Long-Term Memory Context]\n"
                        for i, mem in enumerate(top_mems):
                            memory_context += f"{i+1}. {mem[1]}\n"
            except Exception as e:
                print(f"Error retrieving memory: {e}")

        base_system_prompt = self.system_prompt_ar if lang == "ar" else self.system_prompt_en
        if lang == "ar":
            lang_dir = "\n\n[توجيه لغوي إلزامي صارم / Strict Language Directive]:\nيجب أن يكون ردك بالكامل وباللغة العربية الفصحى والمهنية حصراً. يُمنع منعاً باتاً الرد باللغة الإنجليزية طالما أن المستخدم تحدث أو اختار العربية. كل المخرجات والتحليلات يجب أن تكون بالعربية."
        else:
            lang_dir = "\n\n[Strict Language Directive]:\nYou MUST write your entire response strictly in professional English. Do not respond in Arabic when English is selected."

        prompt = agent_role + base_system_prompt + lang_dir + memory_context + "\n\nFile Context:\n" + file_context + "\n\nConversation:\n"
        for msg in messages_list:
            prompt += f"{msg['role']}: {msg['content']}\n"
        prompt += "model: "

        q = queue.Queue()

        def execute_action(action_text):
            try:
                import re
                match = re.search(r'\[\[ACTION:CREATE_NOTIFICATION\|(.*?)\|(.*?)\|(.*?)\]\]', action_text)
                if match:
                    title, message, notif_type = match.groups()
                    from dashboard.models import Notification
                    from django.contrib.auth.models import User
                    if user_id:
                        user = User.objects.get(id=user_id)
                        Notification.objects.create(user=user, title=title.strip(), message=message.strip(), type=notif_type.strip())
                
                mem_match = re.search(r'\[\[ACTION:SAVE_MEMORY\|(.*?)\]\]', action_text)
                if mem_match:
                    memory_text = mem_match.group(1).strip()
                    from dashboard.models import AgentMemory
                    from django.contrib.auth.models import User
                    if user_id:
                        user = User.objects.get(id=user_id)
                        emb_res = self.client.models.embed_content(
                            model="text-embedding-004",
                            contents=memory_text
                        )
                        AgentMemory.objects.create(user=user, content=memory_text, embedding=emb_res.embeddings[0].values)
            except Exception as e:
                print(f"Error executing action: {e}")

        def run_python_code(code):
            import sys
            from io import StringIO
            old_stdout = sys.stdout
            redirected_output = sys.stdout = StringIO()
            try:
                exec(code, {"__builtins__": __builtins__}, {})
                output = redirected_output.getvalue()
                if not output.strip():
                    output = "Code executed successfully but no output was printed."
            except Exception as e:
                output = f"Error executing code: {str(e)}"
            finally:
                sys.stdout = old_stdout
            return output

        def worker(current_prompt, iteration=0):
            if iteration > 3:
                q.put(None)
                return
                
            try:
                stream = self.client.models.generate_content_stream(
                    model="gemini-flash-lite-latest",
                    contents=current_prompt
                )
                
                full_response = ""
                in_sim = False
                in_action = False
                buf = ""
                has_python_action = False
                python_code_to_run = ""
                
                for chunk in stream:
                    if chunk.text:
                        full_response += chunk.text
                        buf += chunk.text
                        
                        while True:
                            if not in_sim and not in_action:
                                sim_idx = buf.find("<internal_simulation>")
                                act_idx = buf.find("[[ACTION:")
                                
                                idxs = [(sim_idx, 'sim'), (act_idx, 'act')]
                                valid_idxs = [x for x in idxs if x[0] != -1]
                                
                                if valid_idxs:
                                    valid_idxs.sort(key=lambda x: x[0])
                                    first_idx, tag_type = valid_idxs[0]
                                    
                                    if first_idx > 0:
                                        q.put(buf[:first_idx])
                                        
                                    if tag_type == 'sim':
                                        buf = buf[first_idx + len("<internal_simulation>"):]
                                        in_sim = True
                                        q.put('<agent_state>يقوم بوضع خطة تفكير داخلية...</agent_state>')
                                    elif tag_type == 'act':
                                        buf = buf[first_idx + len("[[ACTION:"):]
                                        in_action = True
                                else:
                                    safe_len = max(0, len(buf) - 30)
                                    if safe_len > 0:
                                        q.put(buf[:safe_len])
                                        buf = buf[safe_len:]
                                    break
                                    
                            elif in_sim:
                                end_idx = buf.find("</internal_simulation>")
                                if end_idx != -1:
                                    buf = buf[end_idx + len("</internal_simulation>"):]
                                    in_sim = False
                                    q.put('<agent_state>جاري صياغة الرد النهائي...</agent_state>')
                                    q.put('<agent_state>أتم الوكيل عملية التفكير والمحاكاة بنجاح.</agent_state>')
                                else:
                                    break
                                    
                            elif in_action:
                                end_idx = buf.find("]]")
                                if end_idx != -1:
                                    action_content = buf[:end_idx]
                                    buf = buf[end_idx + len("]]"):]
                                    in_action = False
                                    
                                    clean_action = action_content.replace("[[ACTION:", "").strip()
                                    if clean_action.startswith("RUN_PYTHON|"):
                                        python_code_to_run = clean_action.split("RUN_PYTHON|")[1]
                                        has_python_action = True
                                    elif clean_action.startswith("CREATE_NOTIFICATION|"):
                                        q.put('AGENT_LOG: أصدر الوكيل إشعاراً استباقياً')
                                        execute_action(action_content + "]]")
                                    elif clean_action.startswith("SAVE_MEMORY|"):
                                        q.put('AGENT_LOG: تم حفظ الاستراتيجية في الذاكرة الدائمة')
                                        execute_action(action_content + "]]")
                                else:
                                    break

                        if has_python_action:
                            break
                
                if has_python_action:
                    q.put('STATUS___:جاري تنفيذ ومعالجة الكود برمجياً...')
                    q.put('AGENT_LOG: جاري تنفيذ كود بايثون...')
                    observation = run_python_code(python_code_to_run)
                    next_prompt = current_prompt + full_response + f"\n\nObservation: {observation}\n\n"
                    worker(next_prompt, iteration + 1)
                else:
                    if not in_sim and not in_action and buf:
                        q.put(buf)
                    q.put('STATUS___:DONE')
                    q.put(None)
                    
            except Exception as e:
                print(f"Error in genai stream thread: {e}")
                err_str = str(e)
                if "503" in err_str:
                    q.put("عذراً، خوادم الذكاء الاصطناعي تواجه ضغطاً كبيراً حالياً (High Demand). يرجى المحاولة بعد قليل.")
                elif "429" in err_str or "Quota" in err_str:
                    q.put("عذراً، تم تجاوز الحد المسموح من الطلبات للذكاء الاصطناعي. يرجى الانتظار قليلاً ثم المحاولة.")
                else:
                    q.put(f"عذراً، حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي: {err_str}")
                q.put(None)

        threading.Thread(target=worker, args=(prompt, 0), daemon=True).start()

        def event_stream():
            while True:
                text_chunk = q.get()
                if text_chunk is None:
                    break
                yield f"data: {json.dumps({'candidates': [{'content': {'parts': [{'text': text_chunk}]}}]})}\n\n"

        return event_stream()

    def generate_multi_agent_stream(self, agent_ids, messages_list, file_context="", user_id=None, lang="ar"):
        """
        Sequential execution loop for Committee / Multi-Agent Group Conversation.
        Each agent maintains its own strictly isolated persona & system prompt.
        Agent 2+ receives prior agents' contributions in the debate context.
        """
        q = queue.Queue()

        def committee_worker():
            committee_transcript = []
            
            for index, aid in enumerate(agent_ids):
                meta = self.get_agent_meta(aid, user_id=user_id, lang=lang)
                
                # Signal the start of this specific agent's turn
                start_marker = f"[[AGENT_START:{meta['id']}:{meta['name']}:{meta['icon']}:{meta['color']}]]"
                q.put(start_marker)
                
                # Build strictly isolated persona prompt for THIS agent
                agent_role_prompt = meta['system_prompt_ar'] if lang == 'ar' else meta['system_prompt_en']
                
                # Committee debate context if prior agents have spoken
                committee_context = ""
                if committee_transcript:
                    debate_log = "\n".join([f"- [{t['name']}]: {t['content']}" for t in committee_transcript])
                    if lang == "ar":
                        committee_context = f"""
\n\n[سجل جلسة نقاش اللجنة التنفيذية الحالية / Current Committee Debate Transcript]:
{debate_log}

[توجيه المشاركة في اللجنة / Multi-Agent Collaboration Directive]:
أنت تشارك الآن في جلسة نقاش تنفيذية مشتركة بصفتك "{meta['name']}" ({meta['role_title']}).
المطلوب منك:
1. التزم حصرياً بدورك وتخصصك ({meta['role_title']}) ولا تتقمص أدوار زملائك.
2. تفاعل مباشرة وبذكاء مع ما طرحه زملاؤك أعلاه في اللجنة: أيد النقاط الصائبة، انتقد الثغرات من منظور تخصصك، أو قدم حلولاً وتوصيات تكميلية تنبع من مجال خبرتك.
3. ابدأ ردك مباشرة بالتحليل والمداخلة دون تكرار مقدمات عامة.
"""
                    else:
                        committee_context = f"""
\n\n[Current Committee Debate Transcript]:
{debate_log}

[Multi-Agent Collaboration Directive]:
You are actively participating in an executive committee debate as "{meta['name']}" ({meta['role_title']}).
Requirements:
1. Strictly maintain your own specific domain role ({meta['role_title']}).
2. Explicitly review and interact with the prior agents' statements above: agree, challenge, or expand on their arguments from your domain angle.
3. Dive straight into your specialized analysis.
"""
                
                base_system = self.system_prompt_ar if lang == "ar" else self.system_prompt_en
                if lang == "ar":
                    lang_dir = "\n\n[توجيه لغوي إلزامي صارم / Strict Language Directive]:\nيجب أن يكون ردك بالكامل وباللغة العربية الفصحى والمهنية حصراً. يُمنع منعاً باتاً الرد باللغة الإنجليزية طالما أن المستخدم تحدث أو اختار العربية. كل المخرجات والتحليلات يجب أن تكون بالعربية."
                else:
                    lang_dir = "\n\n[Strict Language Directive]:\nYou MUST write your entire response strictly in professional English. Do not respond in Arabic when English is selected."

                agent_prompt = f"*** AGENT ROLE & PERSONA ***\n{agent_role_prompt}\n*** END AGENT ROLE ***\n\n" + base_system + lang_dir + committee_context + "\n\nFile Context:\n" + file_context + "\n\nConversation History:\n"
                for msg in messages_list:
                    agent_prompt += f"{msg['role']}: {msg['content']}\n"
                agent_prompt += f"model ({meta['name']}): "

                # Call LLM for this agent
                try:
                    stream = self.client.models.generate_content_stream(
                        model="gemini-flash-lite-latest",
                        contents=agent_prompt
                    )
                    
                    agent_text_accum = ""
                    buf = ""
                    in_sim = False
                    
                    for chunk in stream:
                        if chunk.text:
                            agent_text_accum += chunk.text
                            buf += chunk.text
                            
                            while True:
                                if not in_sim:
                                    sim_idx = buf.find("<internal_simulation>")
                                    if sim_idx != -1:
                                        if sim_idx > 0:
                                            q.put(buf[:sim_idx])
                                        buf = buf[sim_idx + len("<internal_simulation>"):]
                                        in_sim = True
                                        q.put(f"<agent_state>({meta['name']}) يقوم بصياغة المداخلة التخصصية...</agent_state>")
                                    else:
                                        safe_len = max(0, len(buf) - 20)
                                        if safe_len > 0:
                                            q.put(buf[:safe_len])
                                            buf = buf[safe_len:]
                                        break
                                else:
                                    end_idx = buf.find("</internal_simulation>")
                                    if end_idx != -1:
                                        buf = buf[end_idx + len("</internal_simulation>"):]
                                        in_sim = False
                                        q.put(f"<agent_state>({meta['name']}) يقدم تحليله المعتمد للجنة.</agent_state>")
                                    else:
                                        break

                    if not in_sim and buf:
                        q.put(buf)
                        
                    # Clean agent response for the committee transcript buffer
                    clean_response = agent_text_accum
                    import re
                    clean_response = re.sub(r'<internal_simulation>[\s\S]*?<\/internal_simulation>', '', clean_response)
                    clean_response = re.sub(r'<agent_state>[\s\S]*?<\/agent_state>', '', clean_response).strip()
                    
                    committee_transcript.append({
                        "id": meta['id'],
                        "name": meta['name'],
                        "content": clean_response
                    })
                    
                except Exception as e:
                    print(f"Error during committee agent {aid} execution: {e}")
                    q.put(f"\n[واجه {meta['name']} صعوبة مؤقتة في إتمام المداخلة]\n")
                
                # Signal completion of this specific agent's response
                end_marker = f"[[AGENT_END:{meta['id']}]]"
                q.put(end_marker)

            q.put('STATUS___:DONE')
            q.put('[[COMMITTEE_DONE]]')
            q.put(None)

        threading.Thread(target=committee_worker, daemon=True).start()

        def event_stream():
            while True:
                text_chunk = q.get()
                if text_chunk is None:
                    break
                yield f"data: {json.dumps({'candidates': [{'content': {'parts': [{'text': text_chunk}]}}]})}\n\n"

        return event_stream()

    def analyze_dataset_for_mobile(self, df_summary, lang="en"):
        lang_instruction = "English text" if lang == "en" else "Arabic text"
        fallback_msg = "Analysis completed, but error in generating text." if lang == "en" else "تم تحليل البيانات بنجاح، ولكن الذكاء الاصطناعي واجه مشكلة في توليد النص النهائي."
        
        prompt = f"""You are Basira (بصيرة), an elite AI Financial Director.
The user uploaded a dataset with the following summary:
{df_summary}

Analyze this data to:
1. Find any financial gaps, risks, or critical insights.
2. Forecast sales/revenue for the next 6 periods based on the trends in the data.

IMPORTANT: Generate the "ai_insight" analysis in {lang_instruction}. Do NOT include any introductory conversational greetings. Start the text directly with the analysis.

You MUST respond with ONLY a raw JSON object (no markdown, no backticks, no other text) matching exactly this format:
{{
    "ai_insight": "Your detailed {lang_instruction} analysis about the financial gap and what to do, directly without greetings.",
    "forecast": [100.5, 110.2, 115.0, 105.5, 120.0, 125.5]
}}
Ensure the forecast contains exactly 6 numeric values."""

        try:
            response = self.client.models.generate_content(
                model="gemini-flash-lite-latest",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "", 1).replace("```", "")
            if text.startswith("```"):
                text = text.replace("```", "")
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error in analyze_dataset_for_mobile: {e}")
            return {
                "ai_insight": fallback_msg,
                "forecast": [0, 0, 0, 0, 0, 0]
            }

    def generate_boardroom_debate(self, topic, file_context=""):
        """
        Simulates an executive multi-agent boardroom debate on a strategic topic.
        Returns a structured JSON containing speeches from 4 distinct board directors and final resolution.
        """
        prompt = f"""You are the Executive Boardroom AI Engine for 'بصيرة' (Baseera Business Intelligence).
The business owner has convened an urgent executive board meeting on the following strategic decision/topic:
"{topic}"

Context/Dataset Summary:
{file_context if file_context else "No active dataset attached. Use realistic commercial and financial assumptions for retail/SME business."}

Simulate a realistic, highly intelligent debate between 4 distinct executive board members, followed by an official Board Resolution by Basira:
1.  المدير المالي (CFO): Prioritizes cost reduction, high margins, and immediate profitability.
2.  مدير العمليات وسلاسل الإمداد (COO / Supply Chain Officer): Highlights operational feasibility, stock constraints, supplier lead times, and capacity.
3.  أخصائي التسعير وهوامش الربح (Pricing & Revenue Strategist): Evaluates price elasticity, willingness to pay, unit economics, and bundling strategies.
4.  بصيرة - المستشار التنفيذي العام (Basira / Board Chair Resolution): Synthesizes the arguments into a definitive, actionable decision and 3 concrete next steps.

Language: Arabic (فصحى مهنية راقية).

You MUST return ONLY a valid JSON object matching EXACTLY this structure (no markdown fences, no raw text outside JSON):
{{
    "topic": "{topic}",
    "speakers": [
        {{
            "id": "financial",
            "name": "المحلل المالي (CFO)",
            "avatar_icon": "line-chart",
            "color": "emerald",
            "stance": "تحفظ مالي / حذر",
            "argument": "النص التفصيلي لمداخلة المحلل المالي..."
        }},

        {{
            "id": "supply_chain",
            "name": "مدير العمليات والإمداد (COO)",
            "avatar_icon": "truck",
            "color": "blue",
            "stance": "انضباط تشغيلي / تدقيق المخزون",
            "argument": "النص التفصيلي لمداخلة مدير العمليات..."
        }},
        {{
            "id": "pricing",
            "name": "أخصائي استراتيجية التسعير",
            "avatar_icon": "tag",
            "color": "purple",
            "stance": "تعظيم الهوامش / مرونة الطلب",
            "argument": "النص التفصيلي لمداخلة أخصائي التسعير..."
        }}
    ],
    "resolution": {{
        "decision": "القرار الاستراتيجي الموحد المعتمد من مجلس الإدارة...",
        "expected_roi": "+18% نمو متوقع في صافي الأرباح",
        "risk_level": "متوسط (تحت السيطرة)",
        "action_items": [
            "الخطوة التنفيذية الأولى",
            "الخطوة التنفيذية الثانية",
            "الخطوة التنفيذية الثالثة"
        ]
    }}
}}"""

        try:
            response = self.client.models.generate_content(
                model="gemini-flash-lite-latest",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "", 1).replace("```", "")
            if text.startswith("```"):
                text = text.replace("```", "")
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error in generate_boardroom_debate: {e}")
            return {
                "topic": topic,
                "speakers": [
                    {
                        "id": "financial",
                        "name": "المحلل المالي (CFO)",
                        "avatar_icon": "line-chart",
                        "color": "emerald",
                        "stance": "حذر مالي",
                        "argument": f"بناءً على المعطيات المالية، أي تحرك بخصوص '{topic}' يجب أن يضمن الحفاظ على السيولة النقدية وهامش أمان 20% على الأقل لتغطية تكاليف التشغيل."
                    },
                    {
                        "id": "supply_chain",
                        "name": "مدير العمليات والإمداد (COO)",
                        "avatar_icon": "truck",
                        "color": "blue",
                        "stance": "جاهزية تشغيلية",
                        "argument": "نؤكد على ضرورة تأمين المخزون والمواد الأولية مقدماً لضمان عدم حدوث أي انقطاع في تلبية طلبات العملاء."
                    },
                    {
                        "id": "pricing",
                        "name": "أخصائي استراتيجية التسعير",
                        "avatar_icon": "tag",
                        "color": "purple",
                        "stance": "حماية الهامش",
                        "argument": "نقترح اعتماد هيكل تسعير تفاضلي يراعي أعلى الأصناف مبيعاً لضمان عدم تأثر العائد الصافي لكل وحدة."
                    }
                ],
                "resolution": {
                    "decision": f"الموافقة المشروطة على تنفيذ مبادرة '{topic}' بتدرج مرحلي يبدأ بتجربة أولية لمدة أسبوعين.",
                    "expected_roi": "+15% إلى +22% تحسن في الأداء التجاري",
                    "risk_level": "منخفض إلى متوسط",
                    "action_items": [
                        "إعادة التفاوض مع الموردين على خصومات الكميات",
                        "إعادة التفاوض مع الموردين على خصومات الكميات",
                        "مراجعة نتائج التجربة بعد 14 يوماً وتعديل الأسعار حسب الطلب"
                    ]
                }
            }

    def extract_receipt_data(self, file_path):
        """
        Extracts structured data from a receipt/invoice image using Gemini Multimodal.
        """
        import PIL.Image
        import json
        
        prompt = """
        You are an expert accountant. Analyze this receipt or invoice.
        Extract the following data into a clean JSON object ONLY (no markdown fences, no other text):
        {
            "merchant_name": "Name of the store or company",
            "date": "Date of transaction (YYYY-MM-DD)",
            "total_amount": 0.0,
            "tax_amount": 0.0,
            "currency": "Currency code or symbol",
            "items": [
                {"description": "Item 1", "quantity": 1, "price": 0.0, "total": 0.0}
            ]
        }
        """
        try:
            img = PIL.Image.open(file_path)
            response = self.client.models.generate_content(
                model="gemini-3.6-flash",
                contents=[img, prompt]
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "", 1).replace("```", "")
            if text.startswith("```"):
                text = text.replace("```", "")
            return json.loads(text.strip())
        except Exception as e:
            import traceback
            traceback.print_exc()
            return None
