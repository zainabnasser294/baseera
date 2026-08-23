using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace BaseeraAPI.Domain
{
    // واجهة موحدة لجميع الكيانات لدعم الحذف الناعم والتتبع المتزامن
    public interface IBaseEntity
    {
        bool IsDeleted { get; set; }
        DateTimeOffset? DeletedAt { get; set; }
        DateTimeOffset? UpdatedAt { get; set; }
        byte[] RowVersion { get; set; }
    }

    public interface IMultiTenant
    {
        Guid BusinessId { get; set; }
    }

    public class Business : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public string? CRNumber { get; set; }
        public byte[]? EncryptedExternalApiKeys { get; set; }
        
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<DashboardSession> DashboardSessions { get; set; } = new List<DashboardSession>();
        public ICollection<ChatbotSession> ChatbotSessions { get; set; } = new List<ChatbotSession>();
    }

    public class User : IMultiTenant, IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BusinessId { get; set; }
        public Business Business { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = "Manager";
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<AuthLog> AuthLogs { get; set; } = new List<AuthLog>();
        public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<SystemHistory> SystemHistories { get; set; } = new List<SystemHistory>();
    }

    public class DashboardSession : IMultiTenant, IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BusinessId { get; set; }
        public Business Business { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        public string UserQuery { get; set; } = null!;
        public string? GeneratedPythonCode { get; set; }
        
        [Column(TypeName = "jsonb")]
        public JsonDocument UIBlueprint { get; set; } = null!;
        
        [Column(TypeName = "jsonb")]
        public JsonDocument? ActionableInsights { get; set; } 
        
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }

    public class ChatbotSession : IMultiTenant, IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BusinessId { get; set; }
        public Business Business { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Title { get; set; } = "محادثة جديدة";
        public string? ContextSummary { get; set; } 

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        
        public ICollection<ChatbotMessage> Messages { get; set; } = new List<ChatbotMessage>();
    }

    public class ChatbotMessage : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SessionId { get; set; }
        public ChatbotSession Session { get; set; } = null!;
        public string Role { get; set; } = null!; // User, Assistant
        public string Content { get; set; } = null!;
        public int TokenCount { get; set; } = 0; // Token Tracking
        
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }

    public class TeamApiKey
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string DeveloperName { get; set; } = null!; 
        public string ApiKeyHash { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }

    public class AuthLog : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(50)]
        public string EventType { get; set; } = null!;
        
        [MaxLength(45)]
        public string? IPAddress { get; set; }
        public string? DeviceInfo { get; set; }
        
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
    }

    public class Subscription : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(100)]
        public string PlanName { get; set; } = null!;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
    }

    public class Invoice : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        public Guid SubscriptionId { get; set; }
        public Subscription Subscription { get; set; } = null!;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        [MaxLength(255)]
        public string? ThawaniTransactionId { get; set; }
        
        public DateTimeOffset PaymentDate { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string PaymentStatus { get; set; } = "Pending";

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
    }

    public class Notification : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = null!;
        
        [Required]
        public string Message { get; set; } = null!;
        
        public bool IsRead { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
    }

    public class SystemHistory : IBaseEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(100)]
        public string ActionType { get; set; } = null!;
        
        [Column(TypeName = "jsonb")]
        public string? Details { get; set; }
        
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [Timestamp] public byte[] RowVersion { get; set; } = null!;
    }
}
