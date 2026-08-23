from django.test import TestCase
from django.contrib.auth.models import User
from .models import (
    Profile, ProjectFile, UserFeedback, DynamicRecord, SystemLog,
    Invoice, Announcement, AIUsageLog, Notification, AgentMemory,
    SalesGoal, AnomalyAlert, WeeklyDigest, CustomAgent, BoardroomSession
)
from decimal import Decimal

class BaseeraModelTests(TestCase):
    def setUp(self):
        # Setup a dummy user to be used across tests
        self.user = User.objects.create_user(username='test_user', email='test@example.com', password='password123')
        
    # 1. Test Profile Creation & String Representation
    def test_profile_creation_and_str(self):
        profile = Profile.objects.create(
            user=self.user,
            phone_number='12345678',
            commercial_register='CR-1234',
            company_name='Test Company',
            project_type='retail'
        )
        self.assertEqual(profile.company_name, 'Test Company')
        self.assertEqual(str(profile), 'test_user - Test Company')

    # 2. Test Profile Default Values
    def test_profile_default_project_type(self):
        profile = Profile.objects.create(
            user=User.objects.create_user(username='another_user'),
            phone_number='0000',
            commercial_register='0000'
        )
        self.assertEqual(profile.project_type, 'other')
        self.assertEqual(profile.company_name, 'مؤسسة عُمانية ناشئة')

    # 3. Test ProjectFile Creation
    def test_projectfile_creation(self):
        pf = ProjectFile.objects.create(user=self.user, excel_file='dummy.csv')
        self.assertEqual(pf.user.username, 'test_user')
        self.assertTrue(str(pf).endswith('dummy.csv'))

    # 4. Test ProjectFile Association with User
    def test_projectfile_user_relation(self):
        pf = ProjectFile.objects.create(user=self.user, excel_file='data.xlsx')
        self.assertIn(pf, self.user.projectfile_set.all())

    # 5. Test UserFeedback Creation
    def test_userfeedback_creation(self):
        feedback = UserFeedback.objects.create(
            user=self.user,
            email='test@test.com',
            message='Great platform!'
        )
        self.assertEqual(feedback.message, 'Great platform!')

    # 6. Test UserFeedback Default Rating
    def test_userfeedback_default_rating(self):
        feedback = UserFeedback.objects.create(
            user=self.user,
            email='test@test.com',
            message='Good'
        )
        self.assertEqual(feedback.rating, 5)
        self.assertEqual(feedback.feedback_type, 'rating')

    # 7. Test UserFeedback String Representation
    def test_userfeedback_str(self):
        feedback = UserFeedback.objects.create(
            user=self.user,
            email='test@test.com',
            message='Hello',
            rating=4
        )
        self.assertIn('[تقييم المنصة] - test@test.com (4★)', str(feedback))

    # 8. Test DynamicRecord Creation with JSON
    def test_dynamicrecord_creation(self):
        record = DynamicRecord.objects.create(
            user=self.user,
            schema_hash='abc123hash',
            row_data={'col1': 'val1', 'col2': 100}
        )
        self.assertEqual(record.row_data['col2'], 100)

    # 9. Test DynamicRecord String Representation
    def test_dynamicrecord_str(self):
        record = DynamicRecord.objects.create(
            user=self.user,
            schema_hash='abc123hash',
            row_data={}
        )
        self.assertIn('Record for test_user', str(record))

    # 10. Test SystemLog Creation
    def test_systemlog_creation(self):
        log = SystemLog.objects.create(
            user=self.user,
            action_type='Login',
            details='User logged in successfully.'
        )
        self.assertEqual(log.action_type, 'Login')

    # 11. Test SystemLog String Representation
    def test_systemlog_str(self):
        log = SystemLog.objects.create(
            user=self.user,
            action_type='Logout'
        )
        self.assertIn('Logout -', str(log))

    # 12. Test Invoice Creation
    def test_invoice_creation(self):
        invoice = Invoice.objects.create(
            user=self.user,
            plan_name='Pro',
            amount=Decimal('15.00')
        )
        self.assertEqual(invoice.amount, Decimal('15.00'))

    # 13. Test Invoice String Representation
    def test_invoice_str(self):
        invoice = Invoice.objects.create(
            user=self.user,
            plan_name='Basic',
            amount=Decimal('5.00')
        )
        self.assertEqual(str(invoice), 'test_user - Basic - 5.00 OMR')

    # 14. Test Announcement Creation
    def test_announcement_creation(self):
        announcement = Announcement.objects.create(
            title='Maintenance',
            message='System will be down for 1 hour.'
        )
        self.assertEqual(announcement.title, 'Maintenance')

    # 15. Test Announcement Default Active Status
    def test_announcement_defaults(self):
        announcement = Announcement.objects.create(
            title='Update',
            message='New feature released.'
        )
        self.assertTrue(announcement.is_active)
        self.assertEqual(announcement.type, 'info')

    # 16. Test AIUsageLog Creation
    def test_aiusagelog_creation(self):
        usage = AIUsageLog.objects.create(
            user=self.user,
            query='How to increase sales?'
        )
        self.assertEqual(usage.query, 'How to increase sales?')

    # 17. Test AIUsageLog String Representation
    def test_aiusagelog_str(self):
        usage = AIUsageLog.objects.create(
            user=self.user,
            query='Test query'
        )
        self.assertTrue(str(usage).startswith('test_user - AI Request at'))

    # 18. Test Notification Creation
    def test_notification_creation(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Alert',
            message='Warning high risk.'
        )
        self.assertEqual(notif.title, 'Alert')

    # 19. Test Notification Default Is Read
    def test_notification_default_is_read(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Hello',
            message='World'
        )
        self.assertFalse(notif.is_read)

    # 20. Test AgentMemory Creation
    def test_agentmemory_creation(self):
        memory = AgentMemory.objects.create(
            user=self.user,
            content='Strategic insight',
            embedding=[0.1, 0.2, 0.3]
        )
        self.assertEqual(len(memory.embedding), 3)

    # 21. Test SalesGoal Creation
    def test_salesgoal_creation(self):
        goal = SalesGoal.objects.create(
            user=self.user,
            target_revenue=Decimal('10000.00'),
            target_profit=Decimal('2000.00'),
            month='2026-08'
        )
        self.assertEqual(goal.target_profit, Decimal('2000.00'))

    # 22. Test SalesGoal String Representation
    def test_salesgoal_str(self):
        goal = SalesGoal.objects.create(
            user=self.user,
            month='2026-09'
        )
        self.assertTrue(str(goal).startswith('test_user - Goal for 2026-09: 5000.'))

    # 23. Test AnomalyAlert Creation
    def test_anomalyalert_creation(self):
        alert = AnomalyAlert.objects.create(
            user=self.user,
            title='Drop in Sales',
            description='Sales dropped by 20%',
            severity='critical'
        )
        self.assertEqual(alert.severity, 'critical')
        self.assertIn('[critical] Drop in Sales - test_user', str(alert))

    # 24. Test WeeklyDigest Creation
    def test_weeklydigest_creation(self):
        digest = WeeklyDigest.objects.create(
            user=self.user,
            week_label='Week 33',
            summary_text='Great week',
            top_risks=['Stock out'],
            top_opportunities=['Upsell']
        )
        self.assertEqual(digest.top_risks[0], 'Stock out')

    # 25. Test CustomAgent and BoardroomSession Creation
    def test_boardroom_and_agent_creation(self):
        agent = CustomAgent.objects.create(
            user=self.user,
            name='My Agent',
            role_title='Helper',
            system_prompt='Be helpful'
        )
        self.assertEqual(agent.name, 'My Agent')

        session = BoardroomSession.objects.create(
            user=self.user,
            topic='Pricing Strategy',
            debate_history=[{'agent': 'finance', 'text': 'increase prices'}],
            action_items=['Action 1']
        )
        self.assertEqual(session.topic, 'Pricing Strategy')
        self.assertEqual(len(session.action_items), 1)
