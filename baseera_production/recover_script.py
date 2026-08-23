                                if not in_sim:
                                    sim_idx = buf.find("<internal_simulation>")
                                    if sim_idx != -1:
                                        if sim_idx > 0:
                                            q.put(buf[:sim_idx])
                                        buf = buf[sim_idx + len("<internal_simulation>"):]
                                        in_sim = True
                                        q.put(f"<agent_state>({meta['name']}) ÌﬁÊ„ »’Ì«€… «·„œ«Œ·… «· Œ’’Ì…...</agent_state>")
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
                                        q.put(f"<agent_state>({meta['name']}) Ìﬁœ„  Õ·Ì·Â «·„⁄ „œ ··Ã‰….</agent_state>")
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
                    q.put(f"\n[Ê«ÃÂ {meta['name']} ’⁄Ê»… „ƒﬁ … ›Ì ≈ „«„ «·„œ«Œ·…]\n")
                
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
        fallback_msg = "Analysis completed, but error in generating text." if lang == "en" else " „  Õ·Ì· «·»Ì«‰«  »‰Ã«Õ° Ê·ﬂ‰ «·–ﬂ«¡ «·«’ÿ‰«⁄Ì Ê«ÃÂ „‘ﬂ·… ›Ì  Ê·Ìœ «·‰’ «·‰Â«∆Ì."
        
        prompt = f"\""You are Basira (»’Ì—…), an elite AI Financial Director.
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
Ensure the forecast contains exactly 6 numeric values."\""

        try:
            response = self.client.models.generate_content(
                model="gemini-flash-lite-latest",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("`json"):
                text = text.replace("`json", "", 1).replace("`", "")
            if text.startswith("`"):
                text = text.replace("`", "")
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error in analyze_dataset_for_mobile: {e}")
            return {
                "ai_insight": fallback_msg,
                "forecast": [0, 0, 0, 0, 0, 0]
            }

    def generate_boardroom_debate(self, topic, file_context=""):
        "\""
        Simulates an executive multi-agent boardroom debate on a strategic topic.
        Returns a structured JSON containing speeches from 4 distinct board directors and final resolution.
        "\""
        prompt = f"\""You are the Executive Boardroom AI Engine for '»’Ì—…' (Baseera Business Intelligence).
The business owner has convened an urgent executive board meeting on the following strategic decision/topic:
"{topic}"

Context/Dataset Summary:
{file_context if file_context else "No active dataset attached. Use realistic commercial and financial assumptions for retail/SME business."}

Simulate a realistic, highly intelligent debate between 4 distinct executive board members, followed by an official Board Resolution by Basira:
1.  «·„œÌ— «·„«·Ì (CFO): Prioritizes cost reduction, high margins, and immediate profitability.
2.  „œÌ— «·⁄„·Ì«  Ê”·«”· «·≈„œ«œ (COO / Supply Chain Officer): Highlights operational feasibility, stock constraints, supplier lead times, and capacity.
3.  √Œ’«∆Ì «· ”⁄Ì— ÊÂÊ«„‘ «·—»Õ (Pricing & Revenue Strategist): Evaluates price elasticity, willingness to pay, unit economics, and bundling strategies.
4.  »’Ì—… - «·„” ‘«— «· ‰›Ì–Ì «·⁄«„ (Basira / Board Chair Resolution): Synthesizes the arguments into a definitive, actionable decision and 3 concrete next steps.

Language: Arabic (›’ÕÏ „Â‰Ì… —«ﬁÌ…).

You MUST return ONLY a valid JSON object matching EXACTLY this structure (no markdown fences, no raw text outside JSON):
{{
    "topic": "{topic}",
    "speakers": [
        {{
            "id": "financial",
            "name": "«·„Õ·· «·„«·Ì (CFO)",
            "avatar_icon": "line-chart",
            "color": "emerald",
            "stance": " Õ›Ÿ „«·Ì / Õ–—",
            "argument": "«·‰’ «· ›’Ì·Ì ·„œ«Œ·… «·„Õ·· «·„«·Ì..."
        }},

        {{
            "id": "supply_chain",
            "name": "„œÌ— «·⁄„·Ì«  Ê«·≈„œ«œ (COO)",
            "avatar_icon": "truck",
            "color": "blue",
            "stance": "«‰÷»«ÿ  ‘€Ì·Ì /  œﬁÌﬁ «·„Œ“Ê‰",
            "argument": "«·‰’ «· ›’Ì·Ì ·„œ«Œ·… „œÌ— «·⁄„·Ì« ..."
        }},
        {{
            "id": "pricing",
            "name": "√Œ’«∆Ì «” —« ÌÃÌ… «· ”⁄Ì—",
            "avatar_icon": "tag",
            "color": "purple",
            "stance": " ⁄ŸÌ„ «·ÂÊ«„‘ / „—Ê‰… «·ÿ·»",
            "argument": "«·‰’ «· ›’Ì·Ì ·„œ«Œ·… √Œ’«∆Ì «· ”⁄Ì—..."
        }}
    ],
    "resolution": {{
        "decision": "«·ﬁ—«— «·«” —« ÌÃÌ «·„ÊÕœ «·„⁄ „œ „‰ „Ã·” «·≈œ«—…...",
        "expected_roi": "+18% ‰„Ê „ Êﬁ⁄ ›Ì ’«›Ì «·√—»«Õ",
        "risk_level": "„ Ê”ÿ ( Õ  «·”Ìÿ—…)",
        "action_items": [
            "«·ŒÿÊ… «· ‰›Ì–Ì… «·√Ê·Ï",
            "«·ŒÿÊ… «· ‰›Ì–Ì… «·À«‰Ì…",
            "«·ŒÿÊ… «· ‰›Ì–Ì… «·À«·À…"
        ]
    }}
}}"\""

        try:
            response = self.client.models.generate_content(
                model="gemini-flash-lite-latest",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("`json"):
                text = text.replace("`json", "", 1).replace("`", "")
            if text.startswith("`"):
                text = text.replace("`", "")
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error in generate_boardroom_debate: {e}")
            return {
                "topic": topic,
                "speakers": [
                    {
                        "id": "financial",
                        "name": "«·„Õ·· «·„«·Ì (CFO)",
                        "avatar_icon": "line-chart",
                        "color": "emerald",
                        "stance": "Õ–— „«·Ì",
                        "argument": f"»‰«¡ ⁄·Ï «·„⁄ÿÌ«  «·„«·Ì…° √Ì  Õ—ﬂ »Œ’Ê’ '{topic}' ÌÃ» √‰ Ì÷„‰ «·Õ›«Ÿ ⁄·Ï «·”ÌÊ·… «·‰ﬁœÌ… ÊÂ«„‘ √„«‰ 20% ⁄·Ï «·√ﬁ· · €ÿÌ…  ﬂ«·Ì› «· ‘€Ì·."
                    },

                    {
                        "id": "supply_chain",
                        "name": "„œÌ— «·⁄„·Ì«  Ê«·≈„œ«œ (COO)",
                        "avatar_icon": "truck",
                        "color": "blue",
                        "stance": "Ã«Â“Ì…  ‘€Ì·Ì…",
                        "argument": "‰ƒﬂœ ⁄·Ï ÷—Ê—…  √„Ì‰ «·„Œ“Ê‰ Ê«·„Ê«œ «·√Ê·Ì… „ﬁœ„« ·÷„«‰ ⁄œ„ ÕœÊÀ √Ì «‰ﬁÿ«⁄ ›Ì  ·»Ì… ÿ·»«  «·⁄„·«¡."
                    },
                    {
                        "id": "pricing",
                        "name": "√Œ’«∆Ì «” —« ÌÃÌ… «· ”⁄Ì—",
                        "avatar_icon": "tag",
                        "color": "purple",
                        "stance": "Õ„«Ì… «·Â«„‘",
                        "argument": "‰ﬁ —Õ «⁄ „«œ ÂÌﬂ·  ”⁄Ì—  ›«÷·Ì Ì—«⁄Ì √⁄·Ï «·√’‰«› „»Ì⁄« ·÷„«‰ ⁄œ„  √À— «·⁄«∆œ «·’«›Ì ·ﬂ· ÊÕœ…."
                    }
                ],
                "resolution": {
                    "decision": f"«·„Ê«›ﬁ… «·„‘—Êÿ… ⁄·Ï  ‰›Ì– „»«œ—… '{topic}' » œ—Ã „—Õ·Ì Ì»œ√ » Ã—»… √Ê·Ì… ·„œ… √”»Ê⁄Ì‰.",
                    "expected_roi": "+15% ≈·Ï +22%  Õ”‰ ›Ì «·√œ«¡ «· Ã«—Ì",
                    "risk_level": "„‰Œ›÷ ≈·Ï „ Ê”ÿ",
                    "action_items": [
                        "≈⁄«œ… «· ›«Ê÷ „⁄ «·„Ê—œÌ‰ ⁄·Ï Œ’Ê„«  «·ﬂ„Ì« ",
                        "≈⁄«œ… «· ›«Ê÷ „⁄ «·„Ê—œÌ‰ ⁄·Ï Œ’Ê„«  «·ﬂ„Ì« ",
                        "„—«Ã⁄… ‰ «∆Ã «· Ã—»… »⁄œ 14 ÌÊ„« Ê ⁄œÌ· «·√”⁄«— Õ”» «·ÿ·»"
                    ]
                }
            }

    def extract_receipt_data(self, file_path):
        "\""
        Extracts structured data from a receipt/invoice image using Gemini Multimodal.
        "\""
        import PIL.Image
        import json
        
        prompt = "\""
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
        "\""
        try:
            img = PIL.Image.open(file_path)
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[img, prompt]
            )
            text = response.text.strip()
            if text.startswith("`json"):
                text = text.replace("`json", "", 1).replace("`", "")
            if text.startswith("`"):
                text = text.replace("`", "")
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error in extract_receipt_data: {e}")
            return None
