using System;
using Microsoft.EntityFrameworkCore;
using BaseeraAPI.Domain;

namespace BaseeraAPI.Data
{
    // Interface to get the current tenant context safely
    public interface ITenantService
    {
        Guid? GetCurrentTenantId();
    }

    public class BaseeraDbContext : DbContext
    {
        private readonly Guid? _currentTenantId;

        public BaseeraDbContext(DbContextOptions<BaseeraDbContext> options, ITenantService tenantService) 
            : base(options)
        {
            _currentTenantId = tenantService.GetCurrentTenantId();
        }

        public DbSet<Business> Businesss => Set<Business>();
        public DbSet<User> Users => Set<User>();
        public DbSet<DashboardSession> DashboardSessions => Set<DashboardSession>();
        public DbSet<ChatbotSession> ChatbotSessions => Set<ChatbotSession>();
        public DbSet<ChatbotMessage> ChatbotMessages => Set<ChatbotMessage>();
        public DbSet<TeamApiKey> TeamApiKeys => Set<TeamApiKey>();
        
        // B2B SaaS Entities
        public DbSet<AuthLog> AuthLogs => Set<AuthLog>();
        public DbSet<Subscription> Subscriptions => Set<Subscription>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<SystemHistory> SystemHistories => Set<SystemHistory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // GLOBAL QUERY FILTERS (Multi-Tenant + Soft Delete)
            // ==========================================
            
            // Soft Delete filter for Businesss
            modelBuilder.Entity<Business>().HasQueryFilter(e => !e.IsDeleted);
            
            // Soft Delete & Multi-Tenant filter for Users
            if (_currentTenantId.HasValue)
            {
                modelBuilder.Entity<User>()
                    .HasQueryFilter(e => e.BusinessId == _currentTenantId && !e.IsDeleted);
                
                modelBuilder.Entity<DashboardSession>()
                    .HasQueryFilter(e => e.BusinessId == _currentTenantId && !e.IsDeleted);
                
                modelBuilder.Entity<ChatbotSession>()
                    .HasQueryFilter(e => e.BusinessId == _currentTenantId && !e.IsDeleted);
            }
            else
            {
                modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
                modelBuilder.Entity<DashboardSession>().HasQueryFilter(e => !e.IsDeleted);
                modelBuilder.Entity<ChatbotSession>().HasQueryFilter(e => !e.IsDeleted);
            }

            modelBuilder.Entity<ChatbotMessage>().HasQueryFilter(e => !e.IsDeleted);
            
            // New entities soft delete filters
            modelBuilder.Entity<AuthLog>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Subscription>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Invoice>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SystemHistory>().HasQueryFilter(e => !e.IsDeleted);

            // Unique Indexes
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Business>().HasIndex(c => c.CRNumber).IsUnique();
        }
        
        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateAuditFields()
        {
            var entries = ChangeTracker.Entries<IBaseEntity>();

            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTimeOffset.UtcNow;
                        break;
                    case EntityState.Deleted:
                        // Implement Soft Delete
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDeleted = true;
                        entry.Entity.DeletedAt = DateTimeOffset.UtcNow;
                        break;
                }
            }
        }
    }
}
