using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LastMile.TMS.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAisleEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Aisles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ZoneId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aisles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Aisles_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aisles_Label",
                table: "Aisles",
                column: "Label");

            migrationBuilder.CreateIndex(
                name: "IX_Aisles_ZoneId",
                table: "Aisles",
                column: "ZoneId");

            // Data Migration: Create Aisles from existing Bins
            migrationBuilder.Sql(
                @"INSERT INTO ""Aisles"" (""Id"", ""Name"", ""Label"", ""Order"", ""IsActive"", ""ZoneId"", ""CreatedAt"", ""CreatedBy"", ""IsDeleted"")
                SELECT
                    gen_random_uuid() as ""Id"",
                    'A' || CAST(""Aisle"" AS TEXT) as ""Name"",
                    CONCAT('Zone-', CAST(""ZoneId"" AS TEXT), '-A', CAST(""Aisle"" AS TEXT)) as ""Label"",
                    ""Aisle"" as ""Order"",
                    true as ""IsActive"",
                    ""ZoneId"",
                    NOW() as ""CreatedAt"",
                    'System-Migration' as ""CreatedBy"",
                    false as ""IsDeleted""
                FROM ""Bins""
                GROUP BY ""ZoneId"", ""Aisle""
                ORDER BY ""ZoneId"", ""Aisle"";");

            // Add AisleId column as nullable first
            migrationBuilder.AddColumn<Guid>(
                name: "AisleId",
                table: "Bins",
                type: "uuid",
                nullable: true);

            // Update Bins to reference the new Aisles
            migrationBuilder.Sql(
                @"UPDATE ""Bins"" b
                SET ""AisleId"" = a.""Id""
                FROM ""Aisles"" a
                WHERE a.""ZoneId"" = b.""ZoneId""
                  AND a.""Name"" = 'A' || CAST(b.""Aisle"" AS TEXT);");

            // Make AisleId required after data migration
            migrationBuilder.AlterColumn<Guid>(
                name: "AisleId",
                table: "Bins",
                type: "uuid",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_Bins_AisleId",
                table: "Bins",
                column: "AisleId");

            // Drop old Aisle column
            migrationBuilder.DropColumn(
                name: "Aisle",
                table: "Bins");

            // Update Zone > Bin relationship (Zone no longer cascades to Bins directly)
            migrationBuilder.DropForeignKey(
                name: "FK_Bins_Zones_ZoneId",
                table: "Bins");

            migrationBuilder.AddForeignKey(
                name: "FK_Bins_Zones_ZoneId",
                table: "Bins",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Create Aisle > Bin relationship
            migrationBuilder.AddForeignKey(
                name: "FK_Bins_Aisles_AisleId",
                table: "Bins",
                column: "AisleId",
                principalTable: "Aisles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bins_Aisles_AisleId",
                table: "Bins");

            migrationBuilder.DropForeignKey(
                name: "FK_Bins_Zones_ZoneId",
                table: "Bins");

            migrationBuilder.DropIndex(
                name: "IX_Bins_AisleId",
                table: "Bins");

            // Restore old Aisle column
            migrationBuilder.AddColumn<int>(
                name: "Aisle",
                table: "Bins",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Copy Aisle name back to Aisle number (assuming name format is "A{number}")
            migrationBuilder.Sql(
                @"UPDATE ""Bins"" b
                SET ""Aisle"" = CAST(SUBSTRING(a.""Name"" FROM 2) AS INTEGER)
                FROM ""Aisles"" a
                WHERE b.""AisleId"" = a.""Id"";");

            // Drop AisleId column
            migrationBuilder.DropColumn(
                name: "AisleId",
                table: "Bins");

            // Drop Aisles table
            migrationBuilder.DropTable(
                name: "Aisles");

            // Restore original Zone > Bin cascade
            migrationBuilder.AddForeignKey(
                name: "FK_Bins_Zones_ZoneId",
                table: "Bins",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
