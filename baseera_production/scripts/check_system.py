import os
import sys
import django
from dotenv import load_dotenv

# Load env variables
load_dotenv(override=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseera_web.settings')
django.setup()

def check_database():
    print("=== 1. DATABASE CHECK ===", flush=True)
    from django.db import connection
    from django.contrib.auth.models import User
    from dashboard.models import (
        Profile, ProjectFile, DynamicRecord, BoardroomSession, 
        CustomAgent, AnomalyAlert, SalesGoal
    )
    
    try:
        connection.ensure_connection()
        print("[OK] Database connection successful.", flush=True)
        
        user_count = User.objects.count()
        file_count = ProjectFile.objects.count()
        record_count = DynamicRecord.objects.count()
        boardroom_count = BoardroomSession.objects.count()
        agent_count = CustomAgent.objects.count()
        profile_count = Profile.objects.count()
        anomaly_count = AnomalyAlert.objects.count()
        sales_goal_count = SalesGoal.objects.count()
        
        print(f"[OK] Users in DB: {user_count}", flush=True)
        print(f"[OK] User Profiles: {profile_count}", flush=True)
        print(f"[OK] Project/Uploaded Files: {file_count}", flush=True)
        print(f"[OK] Dynamic CSV/Data Records: {record_count}", flush=True)
        print(f"[OK] Boardroom Sessions: {boardroom_count}", flush=True)
        print(f"[OK] Custom AI Agents: {agent_count}", flush=True)
        print(f"[OK] Anomaly Alerts: {anomaly_count}", flush=True)
        print(f"[OK] Sales Goals: {sales_goal_count}", flush=True)
        
        users = list(User.objects.values_list('username', flat=True)[:5])
        print(f"[INFO] Sample Usernames: {users}", flush=True)
        
        return True
    except Exception as e:
        print(f"[ERROR] Database check failed: {e}", flush=True)
        return False

def check_backend():
    print("\n=== 2. BACKEND / ENDPOINTS CHECK ===", flush=True)
    from django.test import Client
    from django.urls import reverse
    
    try:
        client = Client()
        
        # Test Welcome page
        res = client.get(reverse('welcome'))
        print(f"[OK] GET / (welcome): Status {res.status_code}", flush=True)
        
        # Test Login page
        res = client.get(reverse('login'))
        print(f"[OK] GET /login/: Status {res.status_code}", flush=True)
        
        # Test Register page
        res = client.get(reverse('register'))
        print(f"[OK] GET /register/: Status {res.status_code}", flush=True)
        
        # Test About page
        res = client.get(reverse('about'))
        print(f"[OK] GET /about/: Status {res.status_code}", flush=True)
        
        # Test Contact page
        res = client.get(reverse('contact'))
        print(f"[OK] GET /contact/: Status {res.status_code}", flush=True)
        
        return True
    except Exception as e:
        print(f"[ERROR] Backend check failed: {e}", flush=True)
        return False

def check_ai():
    print("\n=== 3. AI SERVICE CHECK ===", flush=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    print(f"[INFO] GEMINI_API_KEY detected: {'YES (' + api_key[:6] + '...' + api_key[-4:] + ')' if api_key else 'NO'}", flush=True)
    
    try:
        from dashboard.services.ai_service import GeminiAIService
        ai_service = GeminiAIService()
        
        print("[INFO] Testing AI chat stream generation with Gemini model...", flush=True)
        test_messages = [{"role": "user", "content": "مرحبا، هل أنت متصل وجاهز للعمل؟"}]
        response_chunks = []
        for chunk in ai_service.generate_chat_stream(test_messages, agent_id="general"):
            response_chunks.append(chunk)
            
        full_response = "".join(response_chunks)
        print(f"[OK] AI Response received successfully ({len(full_response)} chars):", flush=True)
        print("--- AI OUTPUT SNIPPET ---", flush=True)
        print(full_response[:300] + ("..." if len(full_response) > 300 else ""), flush=True)
        print("-------------------------", flush=True)
        return True
    except Exception as e:
        print(f"[ERROR] AI Check failed: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    db_ok = check_database()
    be_ok = check_backend()
    ai_ok = check_ai()
    
    print("\n=== FINAL SUMMARY ===", flush=True)
    print(f"Database: {'WORKING (PASS)' if db_ok else 'FAILED'}", flush=True)
    print(f"Backend:  {'WORKING (PASS)' if be_ok else 'FAILED'}", flush=True)
    print(f"AI:       {'WORKING (PASS)' if ai_ok else 'FAILED'}", flush=True)
