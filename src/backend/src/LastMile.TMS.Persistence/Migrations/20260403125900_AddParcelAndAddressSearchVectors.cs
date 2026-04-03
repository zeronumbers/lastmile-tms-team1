using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace LastMile.TMS.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddParcelAndAddressSearchVectors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryConfirmation_Parcel_ParcelId",
                table: "DeliveryConfirmation");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcel_Addresses_RecipientAddressId",
                table: "Parcel");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcel_Addresses_ShipperAddressId",
                table: "Parcel");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcel_Zones_ZoneId",
                table: "Parcel");

            migrationBuilder.DropForeignKey(
                name: "FK_ParcelContentItem_Parcel_ParcelId",
                table: "ParcelContentItem");

            migrationBuilder.DropForeignKey(
                name: "FK_ParcelWatcherParcels_Parcel_ParcelsId",
                table: "ParcelWatcherParcels");

            migrationBuilder.DropForeignKey(
                name: "FK_TrackingEvent_Parcel_ParcelId",
                table: "TrackingEvent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Parcel",
                table: "Parcel");

            migrationBuilder.RenameTable(
                name: "Parcel",
                newName: "Parcels");

            migrationBuilder.RenameIndex(
                name: "IX_Parcel_ZoneId",
                table: "Parcels",
                newName: "IX_Parcels_ZoneId");

            migrationBuilder.RenameIndex(
                name: "IX_Parcel_TrackingNumber",
                table: "Parcels",
                newName: "IX_Parcels_TrackingNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Parcel_Status",
                table: "Parcels",
                newName: "IX_Parcels_Status");

            migrationBuilder.RenameIndex(
                name: "IX_Parcel_ShipperAddressId",
                table: "Parcels",
                newName: "IX_Parcels_ShipperAddressId");

            migrationBuilder.RenameIndex(
                name: "IX_Parcel_RecipientAddressId",
                table: "Parcels",
                newName: "IX_Parcels_RecipientAddressId");

            migrationBuilder.RenameIndex(
                name: "IX_Parcel_EstimatedDeliveryDate",
                table: "Parcels",
                newName: "IX_Parcels_EstimatedDeliveryDate");

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Addresses",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', coalesce(\"ContactName\", '') || ' ' || coalesce(\"Street1\", '') || ' ' || coalesce(\"City\", '') || ' ' || coalesce(\"PostalCode\", ''))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Parcels",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', coalesce(\"TrackingNumber\", '') || ' ' || coalesce(\"Description\", ''))",
                stored: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Parcels",
                table: "Parcels",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_SearchVector",
                table: "Addresses",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");

            migrationBuilder.CreateIndex(
                name: "IX_Parcels_SearchVector",
                table: "Parcels",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryConfirmation_Parcels_ParcelId",
                table: "DeliveryConfirmation",
                column: "ParcelId",
                principalTable: "Parcels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ParcelContentItem_Parcels_ParcelId",
                table: "ParcelContentItem",
                column: "ParcelId",
                principalTable: "Parcels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcels_Addresses_RecipientAddressId",
                table: "Parcels",
                column: "RecipientAddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcels_Addresses_ShipperAddressId",
                table: "Parcels",
                column: "ShipperAddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcels_Zones_ZoneId",
                table: "Parcels",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ParcelWatcherParcels_Parcels_ParcelsId",
                table: "ParcelWatcherParcels",
                column: "ParcelsId",
                principalTable: "Parcels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrackingEvent_Parcels_ParcelId",
                table: "TrackingEvent",
                column: "ParcelId",
                principalTable: "Parcels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryConfirmation_Parcels_ParcelId",
                table: "DeliveryConfirmation");

            migrationBuilder.DropForeignKey(
                name: "FK_ParcelContentItem_Parcels_ParcelId",
                table: "ParcelContentItem");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcels_Addresses_RecipientAddressId",
                table: "Parcels");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcels_Addresses_ShipperAddressId",
                table: "Parcels");

            migrationBuilder.DropForeignKey(
                name: "FK_Parcels_Zones_ZoneId",
                table: "Parcels");

            migrationBuilder.DropForeignKey(
                name: "FK_ParcelWatcherParcels_Parcels_ParcelsId",
                table: "ParcelWatcherParcels");

            migrationBuilder.DropForeignKey(
                name: "FK_TrackingEvent_Parcels_ParcelId",
                table: "TrackingEvent");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_SearchVector",
                table: "Addresses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Parcels",
                table: "Parcels");

            migrationBuilder.DropIndex(
                name: "IX_Parcels_SearchVector",
                table: "Parcels");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Parcels");

            migrationBuilder.RenameTable(
                name: "Parcels",
                newName: "Parcel");

            migrationBuilder.RenameIndex(
                name: "IX_Parcels_ZoneId",
                table: "Parcel",
                newName: "IX_Parcel_ZoneId");

            migrationBuilder.RenameIndex(
                name: "IX_Parcels_TrackingNumber",
                table: "Parcel",
                newName: "IX_Parcel_TrackingNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Parcels_Status",
                table: "Parcel",
                newName: "IX_Parcel_Status");

            migrationBuilder.RenameIndex(
                name: "IX_Parcels_ShipperAddressId",
                table: "Parcel",
                newName: "IX_Parcel_ShipperAddressId");

            migrationBuilder.RenameIndex(
                name: "IX_Parcels_RecipientAddressId",
                table: "Parcel",
                newName: "IX_Parcel_RecipientAddressId");

            migrationBuilder.RenameIndex(
                name: "IX_Parcels_EstimatedDeliveryDate",
                table: "Parcel",
                newName: "IX_Parcel_EstimatedDeliveryDate");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Parcel",
                table: "Parcel",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryConfirmation_Parcel_ParcelId",
                table: "DeliveryConfirmation",
                column: "ParcelId",
                principalTable: "Parcel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcel_Addresses_RecipientAddressId",
                table: "Parcel",
                column: "RecipientAddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcel_Addresses_ShipperAddressId",
                table: "Parcel",
                column: "ShipperAddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Parcel_Zones_ZoneId",
                table: "Parcel",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ParcelContentItem_Parcel_ParcelId",
                table: "ParcelContentItem",
                column: "ParcelId",
                principalTable: "Parcel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ParcelWatcherParcels_Parcel_ParcelsId",
                table: "ParcelWatcherParcels",
                column: "ParcelsId",
                principalTable: "Parcel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrackingEvent_Parcel_ParcelId",
                table: "TrackingEvent",
                column: "ParcelId",
                principalTable: "Parcel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
