using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LastMile.TMS.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Zones",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Zones",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Zones",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Vehicle",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Vehicle",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Vehicle",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "TrackingEvent",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "TrackingEvent",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TrackingEvent",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "ShiftSchedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "ShiftSchedules",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ShiftSchedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Permissions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Permissions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Permissions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "ParcelWatcher",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "ParcelWatcher",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ParcelWatcher",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "ParcelContentItem",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "ParcelContentItem",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ParcelContentItem",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Parcel",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Parcel",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Parcel",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Drivers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Drivers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Drivers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Depots",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Depots",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Depots",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "DeliveryConfirmation",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "DeliveryConfirmation",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "DeliveryConfirmation",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "DaysOff",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "DaysOff",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "DaysOff",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "AspNetUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "AspNetRoles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "AspNetRoles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AspNetRoles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Addresses",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Addresses",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Addresses",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Zones");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Zones");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Zones");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Vehicle");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Vehicle");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Vehicle");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "TrackingEvent");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "TrackingEvent");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TrackingEvent");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ShiftSchedules");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "ShiftSchedules");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ShiftSchedules");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ParcelWatcher");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "ParcelWatcher");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ParcelWatcher");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ParcelContentItem");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "ParcelContentItem");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ParcelContentItem");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Parcel");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Parcel");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Parcel");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Depots");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Depots");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Depots");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "DeliveryConfirmation");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "DeliveryConfirmation");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "DeliveryConfirmation");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "DaysOff");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "DaysOff");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "DaysOff");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Addresses");
        }
    }
}
