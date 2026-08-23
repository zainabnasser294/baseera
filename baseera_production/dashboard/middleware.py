from django.shortcuts import redirect
from django.contrib import messages
from dashboard.models import Profile

class TrialExpirationMiddleware:
    """
    Middleware that checks if a logged-in user's 14-day trial period has expired.
    If 14 days have passed and user has no active paid subscription, access to 
    feature pages (Dashboard, Datasets, Reports, AI Chat, etc.) is blocked, 
    and the user is redirected ONLY to the Pricing page (or Settings / Logout).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Bypass trial restriction for Super Admin or staff
            if not request.user.is_staff and not request.user.is_superuser and request.user.username != 'admin':
                try:
                    profile, _ = Profile.objects.get_or_create(user=request.user)
                    trial_info = profile.get_trial_info()

                    if trial_info['is_expired'] and not trial_info['is_subscribed']:
                        path = request.path_info
                        
                        # Whitelisted endpoints accessible after trial expires:
                        # 1. Pricing & Payment pages (to upgrade account)
                        # 2. Settings (to view/edit profile & password)
                        # 3. Auth & Public marketing pages
                        allowed_prefixes = [
                            '/pricing/',
                            '/process-payment/',
                            '/settings/',
                            '/logout/',
                            '/login/',
                            '/register/',
                            '/about/',
                            '/contact/',
                            '/privacy/',
                            '/terms/',
                            '/all-agents/',
                            '/static/',
                            '/media/',
                            '/admin/',
                        ]

                        is_allowed = (path == '/') or any(path.startswith(prefix) for prefix in allowed_prefixes)

                        if not is_allowed:
                            lang = request.session.get('lang') or request.COOKIES.get('lang', 'ar')
                            if lang == 'ar':
                                messages.warning(
                                    request,
                                    "انتهت الفترة التجريبية (14 يوماً). يرجى اختيار إحدى الباقات للاستمرار في استخدام خدمات منصة بصيرة."
                                )
                            else:
                                messages.warning(
                                    request,
                                    "Your 14-day free trial has expired. Please select a subscription plan to continue using Baseera platform services."
                                )
                            return redirect('pricing')
                except Exception as e:
                    print("TrialExpirationMiddleware Error:", e)

        return self.get_response(request)
