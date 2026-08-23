-- 1. Businesss
CREATE TABLE Businesss (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    NameAr VARCHAR(255) NOT NULL,
    NameEn VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MenuItems
CREATE TABLE MenuItems (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BusinessId UUID REFERENCES Businesss(Id),
    NameAr VARCHAR(255) NOT NULL,
    NameEn VARCHAR(255) NOT NULL,
    Category VARCHAR(100),
    Price DECIMAL(10, 2) NOT NULL,
    IsAvailable BOOLEAN DEFAULT TRUE
);

-- 3. Orders
CREATE TABLE Orders (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BusinessId UUID REFERENCES Businesss(Id),
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status VARCHAR(50)
);

-- 4. OrderItems
CREATE TABLE OrderItems (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderId UUID REFERENCES Orders(Id),
    MenuItemId UUID REFERENCES MenuItems(Id),
    Quantity INT NOT NULL,
    SubTotal DECIMAL(10, 2) NOT NULL
);

-- DUMMY DATA FOR TESTING
INSERT INTO Businesss (Id, NameAr, NameEn) VALUES 
('11111111-1111-1111-1111-111111111111', 'مقهى بصيرة المختص', 'Baseera Specialty Coffee');

INSERT INTO MenuItems (Id, BusinessId, NameAr, NameEn, Category, Price) VALUES 
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'كورتادو', 'Cortado', 'Hot Coffee', 18.00),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'سبانش لاتيه بارد', 'Iced Spanish Latte', 'Cold Coffee', 22.00),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'كرواسون زعتر', 'Thyme Croissant', 'Bakery', 15.00);

-- Insert some dummy orders
INSERT INTO Orders (Id, BusinessId, TotalAmount, Status) VALUES 
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 40.00, 'Completed'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 37.00, 'Completed');

INSERT INTO OrderItems (OrderId, MenuItemId, Quantity, SubTotal) VALUES 
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 1, 18.00),
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 1, 22.00),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 1, 22.00),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222223', 1, 15.00);

-- 5. Users Table
CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BusinessId UUID REFERENCES Businesss(Id),
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    Role VARCHAR(50) DEFAULT 'Manager',
    IsActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    DeletedAt TIMESTAMPTZ,
    UpdatedAt TIMESTAMPTZ,
    RowVersion BYTEA,
    CreatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. AuthLogs Table
CREATE TABLE AuthLogs (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    EventType VARCHAR(50) NOT NULL,
    IPAddress VARCHAR(45),
    DeviceInfo TEXT,
    Timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    DeletedAt TIMESTAMPTZ,
    UpdatedAt TIMESTAMPTZ,
    RowVersion BYTEA
);

-- 7. Subscriptions Table
CREATE TABLE Subscriptions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    PlanName VARCHAR(100) NOT NULL,
    Price DECIMAL(18, 2) NOT NULL,
    StartDate TIMESTAMPTZ NOT NULL,
    EndDate TIMESTAMPTZ NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Active',
    IsDeleted BOOLEAN DEFAULT FALSE,
    DeletedAt TIMESTAMPTZ,
    UpdatedAt TIMESTAMPTZ,
    RowVersion BYTEA
);

-- 8. Invoices Table
CREATE TABLE Invoices (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    SubscriptionId UUID NOT NULL REFERENCES Subscriptions(Id) ON DELETE CASCADE,
    Amount DECIMAL(18, 2) NOT NULL,
    ThawaniTransactionId VARCHAR(255),
    PaymentDate TIMESTAMPTZ NOT NULL,
    PaymentStatus VARCHAR(50) NOT NULL DEFAULT 'Pending',
    IsDeleted BOOLEAN DEFAULT FALSE,
    DeletedAt TIMESTAMPTZ,
    UpdatedAt TIMESTAMPTZ,
    RowVersion BYTEA
);

-- 9. Notifications Table
CREATE TABLE Notifications (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    DeletedAt TIMESTAMPTZ,
    UpdatedAt TIMESTAMPTZ,
    RowVersion BYTEA
);

-- 10. SystemHistory (Audit Logs) Table
CREATE TABLE SystemHistory (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    ActionType VARCHAR(100) NOT NULL,
    Details JSONB,
    Timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    DeletedAt TIMESTAMPTZ,
    UpdatedAt TIMESTAMPTZ,
    RowVersion BYTEA
);

-- Indexes for performance
CREATE INDEX IX_AuthLogs_UserId ON AuthLogs(UserId);
CREATE INDEX IX_Subscriptions_UserId ON Subscriptions(UserId);
CREATE INDEX IX_Invoices_SubscriptionId ON Invoices(SubscriptionId);
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_SystemHistory_UserId ON SystemHistory(UserId);
-- ==========================================
-- ROW LEVEL SECURITY (RLS) - STRICT POLICIES
-- ==========================================

-- 1. Enable RLS on all tables
ALTER TABLE Businesss ENABLE ROW LEVEL SECURITY;
ALTER TABLE MenuItems ENABLE ROW LEVEL SECURITY;
ALTER TABLE Orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE OrderItems ENABLE ROW LEVEL SECURITY;
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE AuthLogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE Subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE Invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE Notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE SystemHistory ENABLE ROW LEVEL SECURITY;

-- 2. Create Strict Policies
-- (Assumes backend sets session variables: 'app.current_user_id' and 'app.current_role')

-- Users: Can only see/modify their own record (or SuperAdmin sees all)
CREATE POLICY Users_Strict_Policy ON Users FOR ALL 
USING (Id::text = current_setting('app.current_user_id', true) OR current_setting('app.current_role', true) = 'SuperAdmin');

-- Businesss: Public read, but restricted write
CREATE POLICY Businesss_Read_Policy ON Businesss FOR SELECT USING (true);
CREATE POLICY Businesss_Write_Policy ON Businesss FOR ALL 
USING (current_setting('app.current_role', true) = 'SuperAdmin');

-- MenuItems: Public read, but only Business users can write
CREATE POLICY MenuItems_Read_Policy ON MenuItems FOR SELECT USING (true);
CREATE POLICY MenuItems_Write_Policy ON MenuItems FOR ALL 
USING (BusinessId IN (SELECT BusinessId FROM Users WHERE Id::text = current_setting('app.current_user_id', true)) OR current_setting('app.current_role', true) = 'SuperAdmin');

-- Orders: Only Business users can view/manage their orders
CREATE POLICY Orders_Strict_Policy ON Orders FOR ALL 
USING (BusinessId IN (SELECT BusinessId FROM Users WHERE Id::text = current_setting('app.current_user_id', true)) OR current_setting('app.current_role', true) = 'SuperAdmin');

-- OrderItems: Dependent on Orders policy indirectly or explicitly matched
CREATE POLICY OrderItems_Strict_Policy ON OrderItems FOR ALL 
USING (OrderId IN (SELECT Id FROM Orders WHERE BusinessId IN (SELECT BusinessId FROM Users WHERE Id::text = current_setting('app.current_user_id', true))) OR current_setting('app.current_role', true) = 'SuperAdmin');

-- Subscriptions, Invoices, Notifications, AuthLogs, SystemHistory: User specific
CREATE POLICY Subscriptions_Strict_Policy ON Subscriptions FOR ALL USING (UserId::text = current_setting('app.current_user_id', true) OR current_setting('app.current_role', true) = 'SuperAdmin');
CREATE POLICY Invoices_Strict_Policy ON Invoices FOR ALL USING (UserId::text = current_setting('app.current_user_id', true) OR current_setting('app.current_role', true) = 'SuperAdmin');
CREATE POLICY Notifications_Strict_Policy ON Notifications FOR ALL USING (UserId::text = current_setting('app.current_user_id', true) OR current_setting('app.current_role', true) = 'SuperAdmin');
CREATE POLICY AuthLogs_Strict_Policy ON AuthLogs FOR ALL USING (UserId::text = current_setting('app.current_user_id', true) OR current_setting('app.current_role', true) = 'SuperAdmin');
CREATE POLICY SystemHistory_Strict_Policy ON SystemHistory FOR ALL USING (UserId::text = current_setting('app.current_user_id', true) OR current_setting('app.current_role', true) = 'SuperAdmin');

