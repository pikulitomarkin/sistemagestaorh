using HRManagementAPI.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRManagementAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260321201500_FixLegacyBooleanColumns")]
    public partial class FixLegacyBooleanColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Employees'
          AND column_name = 'IsActive'
          AND data_type IN ('integer', 'smallint', 'bigint')
    ) THEN
        ALTER TABLE ""Employees""
        ALTER COLUMN ""IsActive"" TYPE boolean
        USING (""IsActive"" <> 0);
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Attendances'
          AND column_name = 'IsAbsent'
          AND data_type IN ('integer', 'smallint', 'bigint')
    ) THEN
        ALTER TABLE ""Attendances""
        ALTER COLUMN ""IsAbsent"" TYPE boolean
        USING (""IsAbsent"" <> 0);
    END IF;
END
$$;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Employees'
          AND column_name = 'IsActive'
          AND data_type = 'boolean'
    ) THEN
        ALTER TABLE ""Employees""
        ALTER COLUMN ""IsActive"" TYPE integer
        USING (CASE WHEN ""IsActive"" THEN 1 ELSE 0 END);
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Attendances'
          AND column_name = 'IsAbsent'
          AND data_type = 'boolean'
    ) THEN
        ALTER TABLE ""Attendances""
        ALTER COLUMN ""IsAbsent"" TYPE integer
        USING (CASE WHEN ""IsAbsent"" THEN 1 ELSE 0 END);
    END IF;
END
$$;
");
        }
    }
}
