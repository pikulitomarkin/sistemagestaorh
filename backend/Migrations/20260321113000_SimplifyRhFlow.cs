using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRManagementAPI.Migrations
{
    public partial class SimplifyRhFlow : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DoubleTimeHourlyRate",
                table: "Employees",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "HourlyRate",
                table: "Employees",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OvertimeHourlyRate",
                table: "Employees",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AbsenceDays",
                table: "Attendances",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WorkedHours",
                table: "Attendances",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql(@"
                UPDATE ""Employees""
                SET ""HourlyRate"" = CASE
                    WHEN ""MonthlyWorkHours"" > 0 THEN ROUND((""MonthlySalary"" / ""MonthlyWorkHours""), 2)
                    ELSE 0
                END
                WHERE ""HourlyRate"" = 0;
            ");

            migrationBuilder.Sql(@"
                UPDATE ""Attendances""
                SET ""AbsenceDays"" = 1
                WHERE ""IsAbsent"" = TRUE AND ""AbsenceDays"" = 0;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EmployeeId_Date",
                table: "Attendances",
                columns: new[] { "EmployeeId", "Date" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Attendances_EmployeeId_Date",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "DoubleTimeHourlyRate",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "HourlyRate",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "OvertimeHourlyRate",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "AbsenceDays",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "WorkedHours",
                table: "Attendances");
        }
    }
}
